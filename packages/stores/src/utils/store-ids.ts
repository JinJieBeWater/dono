const NANOID_LENGTH = 21;
const NANOID_PATTERN = `[A-Za-z0-9_-]{${NANOID_LENGTH}}`;

// Matches any id that starts with `user-{userId}` and ignores the rest.
const USER_ID_PATTERN = new RegExp(`^user-(${NANOID_PATTERN})`);

// Matches `user-{userId}`.
const USER_STORE_ID_PATTERN = new RegExp(`^user-(${NANOID_PATTERN})$`);

// Matches `user-{userId}-novel-{novelId}`.
const NOVEL_STORE_ID_PATTERN = new RegExp(`^user-(${NANOID_PATTERN})-novel-(${NANOID_PATTERN})$`);

export type StoreIdKind = "user" | "novel" | "unknown";

export type ParsedStoreId =
  | { kind: "user"; userId: string }
  | { kind: "novel"; userId: string; novelId: string }
  | { kind: "unknown" };

export function makeUserStoreId(userId: string): string {
  return `user-${userId}`;
}

export function makeNovelStoreId(userId: string, novelId: string): string {
  return `user-${userId}-novel-${novelId}`;
}

export function makeNovelStoreIdFromUserStoreId(userStoreId: string, novelId: string): string {
  const userId = userIdFromStoreId(userStoreId);
  if (!userId) throw new Error("Invalid userStoreId");
  return makeNovelStoreId(userId, novelId);
}

export function isUserStoreId(storeId: string): boolean {
  return USER_STORE_ID_PATTERN.test(storeId);
}

export function isNovelStoreId(storeId: string): boolean {
  return NOVEL_STORE_ID_PATTERN.test(storeId);
}

export function parseStoreId(storeId: string): ParsedStoreId {
  const userMatch = storeId.match(USER_STORE_ID_PATTERN);
  if (userMatch) return { kind: "user", userId: userMatch[1]! };

  const novelMatch = storeId.match(NOVEL_STORE_ID_PATTERN);
  if (novelMatch) return { kind: "novel", userId: novelMatch[1]!, novelId: novelMatch[2]! };

  return { kind: "unknown" };
}

export function userIdFromStoreId(storeId: string): string | null {
  const match = storeId.match(USER_ID_PATTERN);
  return match?.[1] ?? null;
}

// Given any storeId that starts with `user-{userId}`, return the corresponding user storeId (`user-{userId}`).
export function userStoreIdFromStoreId(storeId: string): string | null {
  const userId = userIdFromStoreId(storeId);
  return userId ? makeUserStoreId(userId) : null;
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
