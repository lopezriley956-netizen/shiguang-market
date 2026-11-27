"""把 Vite 构建产物打包成单个自包含、沙箱友好的 HTML 文件。

解决的问题：
1. 在线分享链接靠 URL 上的 ?sharecode= 授权，HTML 里引用的
   ./assets/*.js / *.css 子资源不会带上该参数，会被服务器判为
   「链接不完整」返回 403，导致页面白屏。内联后没有任何子资源请求。
2. 打包代码在模块顶层直接读 localStorage.getItem('sg_token')，
   在预览沙箱 / 隐私模式 / opaque origin 下会抛 SecurityError，
   导致 Vue 应用挂载失败白屏。注入一层安全垫片规避。
3. 内联的 type="module" 脚本在部分 iframe 沙箱中不执行；改为
   普通 script 并放到 </body> 前（DOM 已解析完），用 IIFE + 严格模式
   保持与原 ESM 模块一致的作用域语义。
4. 注入全局错误提示，任何运行时异常都会显示红色提示条，不再是无提示白屏。

用法：
    npm run build
    python3 inline-build.py
产物：dist/index.html（单文件），dist/assets/ 会被清空
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent
DIST = ROOT / "dist"
HTML = DIST / "index.html"
ASSETS = DIST / "assets"

# 必须在任何业务代码之前执行
GUARD = """<script>
(function () {
  // localStorage 安全垫片：沙箱下访问就抛错时用内存版替代
  try {
    window.localStorage.setItem('__wb_probe__', '1');
    window.localStorage.removeItem('__wb_probe__');
  } catch (e) {
    var mem = {};
    var shim = {
      getItem: function (k) {
        return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null;
      },
      setItem: function (k, v) { mem[k] = String(v); },
      removeItem: function (k) { delete mem[k]; },
      clear: function () { mem = {}; },
      key: function (i) { return Object.keys(mem)[i] || null; }
    };
    Object.defineProperty(shim, 'length', {
      get: function () { return Object.keys(mem).length; }
    });
    try {
      Object.defineProperty(window, 'localStorage', {
        value: shim, configurable: true
      });
    } catch (e2) { /* 无法覆盖时忽略，业务代码仍有 try/catch */ }
  }

  // 运行时错误可视化：避免出现没有任何提示的白屏
  var shown = false;
  function showError(title, detail) {
    if (shown) return;
    shown = true;
    try {
      var box = document.createElement('div');
      box.setAttribute('style',
        'position:fixed;z-index:99999;left:12px;right:12px;top:12px;' +
        'padding:14px 16px;border-radius:10px;background:#fff1f0;' +
        'color:#a8071a;border:1px solid #ffa39e;font:14px/1.6 sans-serif;' +
        'box-shadow:0 6px 20px rgba(0,0,0,.12);white-space:pre-wrap;' +
        'word-break:break-all;');
      box.textContent = title + '：' + String(detail);
      (document.body || document.documentElement).appendChild(box);
    } catch (e) {}
  }
  window.addEventListener('error', function (e) {
    showError('页面脚本出错',
      (e && (e.message || (e.error && e.error.message))) || '未知错误');
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e && e.reason;
    showError('请求出错', (r && (r.message || r)) || '未知错误');
  });
})();
</script>
"""


def main() -> None:
    html = HTML.read_text(encoding="utf-8")

    # 内联 CSS
    def css_repl(match: re.Match) -> str:
        css = (ASSETS / match.group(1)).read_text(encoding="utf-8")
        return f"<style>{css}</style>"

    html, css_count = re.subn(
        r'<link[^>]+href="\./assets/([^"]+\.css)"[^>]*>', css_repl, html
    )

    # 取出 JS，先移除原 module script 标签；稍后放到 </body> 前
    js_holder: dict[str, str] = {}

    def js_repl(match: re.Match) -> str:
        js = (ASSETS / match.group(1)).read_text(encoding="utf-8")
        # 防止意外出现的 </script> 提前闭合标签
        js_holder["js"] = js.replace("</script", "<\\/script")
        return ""

    html, js_count = re.subn(
        r'<script[^>]+src="\./assets/([^"]+\.js)"[^>]*>\s*</script>', js_repl, html
    )

    if css_count != 1 or js_count != 1 or "js" not in js_holder:
        raise SystemExit(
            f"资源匹配数量异常: css={css_count} js={js_count}，"
            "请检查 index.html 结构或先重新 npm run build"
        )

    # 注入安全垫片（紧跟 <head> 之后，早于任何业务脚本）
    html, guard_count = re.subn(
        r"<head[^>]*>", lambda m: m.group(0) + "\n" + GUARD, html, count=1
    )
    if guard_count != 1:
        raise SystemExit("未找到 <head> 标签，无法注入安全垫片")

    # 普通 script 放在 body 末尾：DOM 已解析完，#app 存在，且不受
    # 内联 module script 在沙箱中的执行限制影响
    bundle = (
        '<script>(function(){"use strict";\n'
        + js_holder["js"]
        + "\n})();</script>\n  </body>"
    )
    if "</body>" not in html:
        raise SystemExit("未找到 </body> 标签")
    html = html.replace("</body>", bundle, 1)

    remaining = re.findall(r'(?:src|href)="(?!data:)[^"]+"', html)
    if remaining:
        raise SystemExit(f"仍有未内联的外部资源引用: {remaining}")

    HTML.write_text(html, encoding="utf-8")

    # 单文件已经不需要 assets 目录，清空避免被误上传
    for f in ASSETS.glob("*"):
        if f.is_file():
            f.unlink()
    ASSETS.rmdir()

    print(f"已生成单文件: {HTML} ({len(html.encode('utf-8')) / 1024:.1f} KB)")
    print("已注入 localStorage 安全垫片 + 错误提示，CSS/JS 全部内联，无外部资源")


if __name__ == "__main__":
    main()
