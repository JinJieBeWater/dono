import { getLocalUserInfo } from "./get-local-user-info";
import { shouldNeverHappen } from "./should-never-happen";
import { makeChapterRoomId } from "@dono/stores/utils";

/**
 * 获取章节编辑的 room ID
 */
export function getChapterRoomId(novelId: string, chapterId: string) {
  const localUserInfo = getLocalUserInfo();
  if (!localUserInfo) throw shouldNeverHappen("localUserInfo should not be null");
  return makeChapterRoomId(localUserInfo.id, novelId, chapterId);
}
