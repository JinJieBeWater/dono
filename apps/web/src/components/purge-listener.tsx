import { useEffect, useEffectEvent } from "react";

import { useStoreRegistry } from "@livestore/react";
import type { LiveStoreEvent } from "@livestore/livestore";

import { userEvents, userTables } from "@dono/stores/user";
import { useUserStore } from "@/stores/user";
import { purgeNovelLocalData } from "@/utils/purge";
import { useLocalUserInfo } from "@/components/local-user-info-provider";
import { useMatch, useNavigate } from "@tanstack/react-router";

type NovelPurgedEvent = LiveStoreEvent.ForEventDef.Decoded<typeof userEvents.novelPurged>;

export function PurgeListener() {
  const { localUserInfo } = useLocalUserInfo();
  if (!localUserInfo) return null;

  return <PurgeListenerAuthed />;
}

function PurgeListenerAuthed(): null {
  const userStore = useUserStore();
  const storeRegistry = useStoreRegistry();
  const [uiState, setUiState] = userStore.useClientDocument(userTables.uiState);
  const navigate = useNavigate();
  const novelId = useMatch({
    from: "/novel/$novelId",
    shouldThrow: false,
    select(match) {
      return match.params.novelId;
    },
  });

  const handlePurgeEvent = useEffectEvent(async (event: NovelPurgedEvent) => {
    const globalSeq = event.seqNum.global;
    if (globalSeq <= uiState.lastNovelPurgeGlobalSeq) return;

    setUiState({ lastNovelPurgeGlobalSeq: globalSeq });

    const purgedNovelId = event.args.id;
    if (novelId === purgedNovelId) {
      navigate({
        to: "/",
        replace: true,
      });
    }
    try {
      await purgeNovelLocalData({ storeRegistry, novelId: purgedNovelId });
    } catch {
      // 可能会发生资源被占用的情况，当前暂时未搞清楚
      // 大概率是 livestore 的 shutdown promise 在完成时实际上仍然保持资源的占用，需要再等待一会
      console.error("Failed to purge local novel data");
    }
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const events = userStore.events({
        filter: [userEvents.novelPurged.name],
      }) as AsyncIterable<NovelPurgedEvent>;

      for await (const event of events) {
        if (cancelled) return;
        await handlePurgeEvent(event);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userStore]);

  return null;
}
