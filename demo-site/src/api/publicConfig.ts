// 由 workbuddy_cloud_service 激活后返回的 publicConfig。
// 只包含面向前端的公开配置；环境 ID 与服务端密钥不在这里，也不应出现在前端。
export const publicConfig = {
  resourceId: 'wbcs_tH13cE1LLhZFqhgQsX6LQP',
  endpoint: 'https://shiguang-market-demo.app.workbuddy.host',
  oauthRelayBaseUrl: 'https://www.workbuddy.cn/v2/as/genie-baas/oauth',
  publishableKey: 'wbpk_pTjNtioZJ1x2GbVZbPzFu2_qvgCDesxuCZrmxkxWBiwefo5ct0gK24f',
} as const;
