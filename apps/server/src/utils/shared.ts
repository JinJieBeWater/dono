/**
 * 本项目中，store ID 的格式为 `user:userId:otherId:otherId...`，
 * 其中 `userId` 是用户的唯一标识符，`otherId` 是其他可能的唯一标识符。
 */
function idFromStoreId(storeId: string, key: string): string | null {
  const prefix = key + "_";
  const start = storeId.indexOf(prefix);
  if (start === -1) return null;

  const valueStart = start + prefix.length;
  let end = storeId.indexOf("_", valueStart);

  // 如果找不到下一个冒号，说明该值在字符串末尾
  if (end === -1) end = storeId.length;

  return storeId.substring(valueStart, end);
}

export function userIdFromStoreId(storeId: string): string | null {
  return idFromStoreId(storeId, "user");
}
