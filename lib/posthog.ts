"use client";

import posthog from "posthog-js";

// 檢查是否在客戶端環境
const isClient = typeof window !== "undefined";

// 確保 PostHog 在客戶端環境中可用
const getPostHog = () => {
  if (!isClient) return null;
  return posthog;
};

/**
 * 發送自定義事件到 PostHog
 * @param eventName 事件名稱
 * @param properties 事件屬性（可選）
 */
export function captureEvent(eventName: string, properties?: Record<string, unknown>) {
  // 確保只在客戶端發送事件
  if (isClient) {
    try {
      const ph = getPostHog();
      ph?.capture(eventName, properties);
    } catch (error) {
      console.error("PostHog 事件捕獲失敗:", error);
    }
  }
}

/**
 * 識別用戶
 * @param distinctId 用戶唯一識別碼
 * @param userProperties 用戶屬性（可選）
 */
export function identifyUser(distinctId: string, userProperties?: Record<string, unknown>) {
  if (isClient) {
    try {
      const ph = getPostHog();
      ph?.identify(distinctId, userProperties);
    } catch (error) {
      console.error("PostHog 用戶識別失敗:", error);
    }
  }
}

/**
 * 重置用戶身份（登出時使用）
 */
export function resetUser() {
  if (isClient) {
    try {
      const ph = getPostHog();
      ph?.reset();
    } catch (error) {
      console.error("PostHog 用戶重置失敗:", error);
    }
  }
}

/**
 * 設置用戶屬性
 * @param properties 用戶屬性
 */
export function setUserProperties(properties: Record<string, unknown>) {
  if (isClient) {
    try {
      const ph = getPostHog();
      ph?.people.set(properties);
    } catch (error) {
      console.error("PostHog 設置用戶屬性失敗:", error);
    }
  }
}

/**
 * 設置單次使用的用戶屬性
 * @param properties 用戶屬性
 */
export function setUserPropertiesOnce(properties: Record<string, unknown>) {
  if (isClient) {
    try {
      const ph = getPostHog();
      ph?.people.set_once(properties);
    } catch (error) {
      console.error("PostHog 設置單次用戶屬性失敗:", error);
    }
  }
}
