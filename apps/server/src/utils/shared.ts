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

const USER_STORE_PATTERN = new RegExp(`^user-(${NANOID_PATTERN})$`);

const NOVEL_STORE_PATTERN = new RegExp(`^user-(${NANOID_PATTERN})-novel-(${NANOID_PATTERN})$`);

export function userIdFromStoreId(storeId: string): string | null {
  // 尝试匹配格式1：user-{userId}
  let match = storeId.match(USER_STORE_PATTERN);
  if (match?.[1]) {
    return match[1];
  }

  match = storeId.match(NOVEL_STORE_PATTERN);
  if (match?.[1]) {
    return match[1];
  }

  return null;
}

export function novelIdFromStoreId(storeId: string): string | null {
  // 匹配格式2：user-{userId}-novel-{novelId}
  const match = storeId.match(NOVEL_STORE_PATTERN);
  return match?.[2] ?? null; // 第2个捕获组是 novelId
}
