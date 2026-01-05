import { getLocalUserInfo } from "./get-local-user-info";
import { shouldNeverHappen } from "./should-never-happen";

/**
 * 获取章节编辑的 room ID
 */
export function getChapterRoomId(chapterId: string) {
  const localUserInfo = getLocalUserInfo();
  if (!localUserInfo) throw shouldNeverHappen("localUserInfo should not be null");
  return `user-${localUserInfo.id}-chapter-${chapterId}`;
}
