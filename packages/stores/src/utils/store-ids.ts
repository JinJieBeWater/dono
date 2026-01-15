const NANOID_LENGTH = 21;
const NANOID_PATTERN = `[A-Za-z0-9_-]{${NANOID_LENGTH}}`;

// Matches any id that starts with `user-{userId}` and ignores the rest.
const USER_ID_PATTERN = new RegExp(`^user-(${NANOID_PATTERN})`);

// Matches `user-{userId}-novel-{novelId}`.
const NOVEL_STORE_ID_PATTERN = new RegExp(`^user-(${NANOID_PATTERN})-novel-(${NANOID_PATTERN})$`);

export function makeUserStoreId(userId: string): string {
  return `user-${userId}`;
}

export function makeNovelStoreId(userId: string, novelId: string): string {
  return `user-${userId}-novel-${novelId}`;
}

export function userIdFromStoreId(storeId: string): string | null {
  const match = storeId.match(USER_ID_PATTERN);
  return match?.[1] ?? null;
}

export function novelIdFromStoreId(storeId: string): string | null {
  const match = storeId.match(NOVEL_STORE_ID_PATTERN);
  return match?.[2] ?? null;
}

export function makeChapterRoomId(userId: string, novelId: string, chapterId: string): string {
  return `user-${userId}-novel-${novelId}-chapter-${chapterId}`;
}

export function makeChapterRoomPrefix(userId: string, novelId: string): string {
  return `user-${userId}-novel-${novelId}-chapter-`;
}
