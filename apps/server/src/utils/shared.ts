/**
 * 从 store ID 中提取 user ID
 *
 * 支持的格式:
 * - `user-${userId}`
 * - `user-${userId}-novel-${novelId}`
 * - `user-${userId}-other-${otherId}`
 *
 * @param storeId - store 的唯一标识符 (必须符合 /^[a-zA-Z0-9_-]+$/)
 * @returns userId 或 null (如果格式不正确)
 *
 * @example
 * userIdFromStoreId('user-123') // 返回 '123'
 * userIdFromStoreId('user-456-novel-789') // 返回 '456'
 * userIdFromStoreId('user-') // 返回 null (userId 为空)
 */
export function userIdFromStoreId(storeId: string): string | null {
  // Reason: 基础验证 - 检查输入是否为有效字符串
  if (!storeId || typeof storeId !== "string") {
    return null;
  }

  // Reason: 验证 storeId 符合官方规范，防止非法字符注入
  if (!/^[a-zA-Z0-9_-]+$/.test(storeId)) {
    return null;
  }

  const parts = storeId.split("-");

  // Reason: 至少需要两个部分: ['user', 'userId', ...]
  if (parts.length < 2) {
    return null;
  }

  // Reason: 验证第一部分必须是 'user'
  if (parts[0] !== "user") {
    return null;
  }

  const userId = parts[1];

  // Reason: 确保 userId 存在且不为空字符串
  if (!userId || userId.length === 0) {
    return null;
  }

  return userId;
}
