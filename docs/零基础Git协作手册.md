# 拾光集市 · 零基础 Git 协作手册

> 写给第一次接触 Git 的同学。全程照着做即可，不需要提前懂代码。
> 遇到看不懂的英文不用慌，只要照着敲命令、看结果对不对就行。

---

## 一、先搞懂 3 件事（2 分钟）

1. **GitHub = 网盘**。项目代码放在网上，全组共享一份。
2. **Git = 同步软件**。装在自己电脑上，负责把你电脑的文件和网盘上的保持一致。
3. **流程就两步**：
   - 开工前 `pull`（把网盘最新内容下载到自己电脑）
   - 干完活 `push`（把自己改的内容上传到网盘）

一个人改坏不影响别人，因为每个人电脑上都是完整的一份。

---

## 二、第一次准备（每人只做一次）

### 1. 安装 Git

- Windows：去 https://git-scm.com/download/win 下载，一路点「Next」装完。
- 装完后在桌面或任意文件夹点右键，能看到 **Git Bash Here** 就成功了。

### 2. 安装代码编辑器

推荐 VS Code：https://code.visualstudio.com/ ，一路下一步。

### 3. 告诉 Git 你是谁（只做一次）

打开 Git Bash，输入下面两行（引号里换成你自己的名字和邮箱）：

```bash
git config --global user.name "张三"
git config --global user.email "zhangsan@email.com"
```

### 4. 下载项目到自己电脑

先确认你已经被组长加进仓库（会收到邮件邀请，点接受）。

然后找一个你想放项目的文件夹（比如桌面），在空白处右键 → Git Bash Here，输入：

```bash
git clone https://github.com/lopezriley956-netizen/shiguang-market.git
```

完成后会多出一个 `shiguang-market` 文件夹，这就是项目。

---

## 三、每天的固定动作（最重要，背下来）

### 开工前：先同步

```bash
cd shiguang-market
git pull
```

看到 `Already up to date.` 或一串文件变化提示，就成功了。

> 为什么必须做？因为队友昨晚可能改了东西，你不同步就在旧版本上改，上传时会冲突。

### 改完活：上传三连

```bash
git add .
git commit -m "这次改了什么"
git push
```

三行的意思：

| 命令 | 通俗解释 |
|---|---|
| `git add .` | 把改动「打包」（`.` 表示全部改动） |
| `git commit -m "..."` | 给这包改动「贴标签存档」，引号里写人话说明 |
| `git push` | 把存档上传到网盘 |

**commit 说明要写清楚**，例如：
- ✅ `新增商品详情页`
- ✅ `修复登录按钮点不动的问题`
- ❌ `update`、`123`、`aaa`

### 收工前：确认上传成功

去 GitHub 网页刷新仓库，能看到你刚写的文件/改动，才算真的完成。

---

## 四、第一周练习：签到接龙（不写代码）

组长已经在仓库建了 `docs/签到.md` 文件。每个人练习一遍完整流程：

1. `git pull` 先同步
2. 用 VS Code 打开 `docs/签到.md`
3. 在末尾加一行：`- 你的名字 - 今天日期 - 一句话感想`
4. 保存文件
5. 执行上传三连：
   ```bash
   git add .
   git commit -m "签到：张三"
   git push
   ```
6. 去网页确认你的名字出现了

这样全组每人练一遍 add → commit → push，第一周目标就达成了。

---

## 五、第二周练习：分工改不同文件

**规则：一个人只改自己负责的文件，绝不碰别人的。**

| 分工 | 负责文件 |
|---|---|
| 同学 A | `frontend/src/views/HomeView.vue` |
| 同学 B | `frontend/src/views/LoginView.vue` |
| 同学 C | `backend/src/modules/products/products.service.ts` |

因为各改各的文件，所以不会冲突。每人重复「开工 pull → 改文件 → 上传三连」。

---

## 六、常见报错怎么办（不要慌）

### 报错 1：`Please tell me who you are`
原因：没做第二节第 3 步。补做那两行 `git config` 命令，再重新 commit。

### 报错 2：`Updates were rejected because the remote contains work...` 或 `! [rejected]`
原因：你没先 `git pull` 就 `git push`，网盘上有你没有的新内容。

解决：
```bash
git pull
# 如果弹出一个编辑器界面，不用改，直接输入 :q 回车退出
git push
```

### 报错 3：文件出现 `<<<<<<< HEAD` 这样的符号
原因：两个人改了同一个文件的同一行，Git 不知道听谁的，这叫「冲突」。

解决：
1. 用 VS Code 打开这个文件，会看到一段 `<<<<<<<`、一段 `=======`、一段 `>>>>>>>`
2. 找组长当面确认保留哪一段，把另外的符号和内容删掉
3. 然后正常执行上传三连

> 预防胜于治疗：只改自己负责的文件，开工先 pull。

### 报错 4：密码输不对
GitHub 已经**不能再用账号密码**了，要用「Personal Access Token」（个人访问令牌）。
找组长要 token，在提示输密码时粘贴 token（粘贴时屏幕不显示是正常的，直接回车）。

### 报错 5：命令打错 / 不知道自己在哪
```bash
pwd          # 看现在在哪个文件夹
ls           # 看这个文件夹里有什么
git status   # 看当前改动状态，红色=未打包，绿色=已打包待提交
```

`git status` 是最好用的命令，迷路时就敲它。

---

## 七、第三周起：分支和 PR（等前面玩熟了再学）

当大家已经能熟练 pull/push，再升级到「分支」模式：

```bash
# 从主干切出自己的分支
git checkout -b feature/你的功能名

# 改完代码，上传三连（push 时要加参数）
git add .
git commit -m "完成 xxx 功能"
git push -u origin feature/你的功能名
```

然后去 GitHub 网页点 **Pull request** → **New pull request** → 选你的分支 → 填说明 → 创建。
组长在网页上点 **Merge pull request** 合并。这样主干永远是可用的版本。

---

## 八、组长（你）的检查清单

- [ ] 每人都能成功 clone 仓库
- [ ] 每人都完成 `docs/签到.md` 签到
- [ ] 每人都成功 push 过至少一次
- [ ] 建一份分工表（谁负责哪些文件），贴到仓库 README 或群公告
- [ ] 设置分支保护：Settings → Branches → Add rule → 选 main → 勾选 Require a pull request before merging
- [ ] 收集全组成员的 GitHub 用户名，用你的账号把人加进 Collaborators

## 九、给你的特别提醒（数据库负责人）

- 你负责 `db/schema.sql`，这是全组共用文件，**别人不要改**。
- 每次数据库表结构有变动，你自己改完上传，然后在群里通知大家 `git pull`。
- `.env` 文件含数据库密码，已被 git 忽略，**千万不要**发给组员或传到网上。让组员自己复制 `.env.example` 改成 `.env`，填自己的本地数据库配置。
- 组员如果本地数据库连不上，先检查 MySQL 是否启动、`.env` 里的账号密码对不对，不要改共享代码。

---

## 十、记住这 5 个命令就够了

```bash
git pull                       # 开工前，下载最新
git add .                      # 改完，打包
git commit -m "改了什么"        # 存档，写清楚说明
git push                       # 上传
git status                     # 迷路时看状态
```

> 核心纪律只有两条：**开工先 pull，收工要 push**。做到这两条，团队就不会乱。
