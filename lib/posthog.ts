"use client";

import posthog from "posthog-js";

/**
 * 發送自定義事件到 PostHog
 * @param eventName 事件名稱
 * @param properties 事件屬性（可選）
 */
export function captureEvent(eventName: string, properties?: Record<string, any>) {
  // 確保只在客戶端發送事件
  if (typeof window !== "undefined") {
    posthog.capture(eventName, properties);
  }
}

/**
 * 識別用戶
 * @param distinctId 用戶唯一識別碼
 * @param userProperties 用戶屬性（可選）
 */
export function identifyUser(distinctId: string, userProperties?: Record<string, any>) {
  if (typeof window !== "undefined") {
    posthog.identify(distinctId, userProperties);
  }
}

/**
 * 重置用戶身份（登出時使用）
 */
export function resetUser() {
  if (typeof window !== "undefined") {
    posthog.reset();
  }
}

/**
 * 設置用戶屬性
 * @param properties 用戶屬性
 */
export function setUserProperties(properties: Record<string, any>) {
  if (typeof window !== "undefined") {
    posthog.people.set(properties);
  }
}

/**
 * 設置單次使用的用戶屬性
 * @param properties 用戶屬性
 */
export function setUserPropertiesOnce(properties: Record<string, any>) {
  if (typeof window !== "undefined") {
    posthog.people.set_once(properties);
  }
}
