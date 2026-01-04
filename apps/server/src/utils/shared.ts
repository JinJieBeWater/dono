/**
 * nanoid 默认生成的 ID 长度
 * @see https://github.com/ai/nanoid
 */
const NANOID_LENGTH = 21;

/**
 * 匹配 21 位 nanoid 的正则片段
 * nanoid 默认字符集: A-Za-z0-9_-
 */
const NANOID_PATTERN = `[A-Za-z0-9_-]{${NANOID_LENGTH}}`;

// 匹配所有以 user-{userId} 开头的 storeId，不关心后续内容
const USER_ID_PATTERN = new RegExp(`^user-(${NANOID_PATTERN})`);

// const USER_STORE_PATTERN = new RegExp(`^user-(${NANOID_PATTERN})$`);

const NOVEL_STORE_PATTERN = new RegExp(`^user-(${NANOID_PATTERN})-novel-(${NANOID_PATTERN})$`);

export function userIdFromStoreId(storeId: string): string | null {
  // 只需要提取 userId，不关心后续内容
  const match = storeId.match(USER_ID_PATTERN);
  return match?.[1] ?? null;
}

export function novelIdFromStoreId(storeId: string): string | null {
  // 匹配格式2：user-{userId}-novel-{novelId}
  const match = storeId.match(NOVEL_STORE_PATTERN);
  return match?.[2] ?? null; // 第2个捕获组是 novelId
}
