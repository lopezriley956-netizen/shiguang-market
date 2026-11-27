import { createWorkBuddyCloud } from '@tencent-ai/workbuddy-cloud-sdk';
import { publicConfig } from './publicConfig';

// 全应用唯一客户端：Auth / Database / Storage / LLM 共用这一实例。
export const cloud = createWorkBuddyCloud({
  endpoint: publicConfig.endpoint,
  oauthRelayBaseUrl: publicConfig.oauthRelayBaseUrl,
  publishableKey: publicConfig.publishableKey,
});
