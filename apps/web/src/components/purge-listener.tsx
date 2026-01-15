import { useEffect, useEffectEvent } from "react";

import { useStoreRegistry } from "@livestore/react";
import type { LiveStoreEvent } from "@livestore/livestore";

import { userEvents, userTables } from "@dono/stores/user";
import { useUserStore } from "@/stores/user";
import { purgeNovelLocalData } from "@/utils/purge";
import { useLocalUserInfo } from "@/components/local-user-info-provider";

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

  const handlePurgeEvent = useEffectEvent(async (event: NovelPurgedEvent) => {
    const globalSeq = event.seqNum.global;
    if (globalSeq <= uiState.lastNovelPurgeGlobalSeq) return;

    setUiState({ lastNovelPurgeGlobalSeq: globalSeq });
    await purgeNovelLocalData({ storeRegistry, novelId: event.args.id });
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
