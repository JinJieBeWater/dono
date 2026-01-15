import {
  novelEvents,
  visibleChapters$,
  visibleVolumes$,
  type Chapter,
  type Volume,
} from "@dono/stores/novel";
import { useNovelStore } from "@/stores/novel";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useLocalStorage } from "./use-local-storage";
import { shouldNeverHappen } from "@/utils/should-never-happen";

export type CatalogueTreeVolumeItem = Volume & {
  type: "volume";
};

export type CatalogueTreeChapterItem = Chapter & {
  type: "chapter";
};

export type CatalogueTreeItem =
  | CatalogueTreeVolumeItem
  | CatalogueTreeChapterItem
  | {
      type: "placeholder";
    };

export interface CatalogueDataContextValue {
  novelId: string;

  volumes: CatalogueTreeVolumeItem[];
  chapters: CatalogueTreeChapterItem[];

  expandedItems: string[];
  setExpandedItems: (value: string[] | ((prev: string[]) => string[])) => void;

  focusedItem: string | null;
  setFocusedItem: React.Dispatch<React.SetStateAction<string | null>>;

  getItem: (itemId: string | null | undefined) => CatalogueTreeItem | undefined;
  getItemOrPlaceholder: (itemId: string) => CatalogueTreeItem;
  getItemName: (item: CatalogueTreeItem) => string;
  getItemNameById: (itemId: string | null | undefined) => string;
  getChildrenIds: (itemId: string) => string[];

  getItemAboveId: (itemId: string | null | undefined) => string | undefined;
  getItemBelowId: (itemId: string | null | undefined) => string | undefined;
  getItemAbove: (itemId: string | null | undefined) => CatalogueTreeItem | undefined;
  getItemBelow: (itemId: string | null | undefined) => CatalogueTreeItem | undefined;

  renameItem: (item: CatalogueTreeItem, value: string) => void;

  // Bumps when the tree structure (nodes/order) likely changed.
  structureRevision: string;
}

const CatalogueDataContext = createContext<CatalogueDataContextValue | null>(null);

export function useCatalogueData(): CatalogueDataContextValue {
  const ctx = useContext(CatalogueDataContext);
  if (!ctx) {
    throw new Error("useCatalogueData must be used within a CatalogueTreeProvider");
  }
  return ctx;
}

export function useCatalogueDataValue(novelId: string): CatalogueDataContextValue {
  const novelStore = useNovelStore(novelId);
  const volumesRaw = novelStore.useQuery(visibleVolumes$());
  const chaptersRaw = novelStore.useQuery(visibleChapters$());

  const volumes = useMemo(
    () => volumesRaw.map((volume) => ({ type: "volume" as const, ...volume })),
    [volumesRaw],
  );
  const chapters = useMemo(
    () => chaptersRaw.map((chapter) => ({ type: "chapter" as const, ...chapter })),
    [chaptersRaw],
  );

  const [expandedItems, setExpandedItems] = useLocalStorage<string[]>("SIDEBAR_EXPANDED_ITEMS", []);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

  const itemsById = useMemo(() => {
    const map = new Map<string, CatalogueTreeItem>();
    for (const v of volumes) map.set(v.id, v);
    for (const c of chapters) map.set(c.id, c);
    return map;
  }, [volumes, chapters]);

  const chaptersByVolumeId = useMemo(() => {
    const map = new Map<string, string[]>();
    // chaptersRaw is already ordered by "order" asc; preserve that ordering per volume.
    for (const ch of chapters) {
      const list = map.get(ch.volumeId);
      if (list) {
        list.push(ch.id);
      } else {
        map.set(ch.volumeId, [ch.id]);
      }
    }
    return map;
  }, [chapters]);

  // A flattened ordering that is independent of UI rendering (expanded/collapsed).
  // Order: volume, then its chapters (by chapter.order asc), then next volume...
  const flatItemIds = useMemo(() => {
    const out: string[] = [];
    for (const v of volumes) {
      out.push(v.id);
      const chapterIds = chaptersByVolumeId.get(v.id);
      if (chapterIds) out.push(...chapterIds);
    }
    return out;
  }, [volumes, chaptersByVolumeId]);

  const flatIndexById = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 0; i < flatItemIds.length; i += 1) {
      map.set(flatItemIds[i]!, i);
    }
    return map;
  }, [flatItemIds]);

  const getItem = useCallback(
    (itemId: string | null | undefined) => {
      if (!itemId || itemId === "root") return undefined;
      return itemsById.get(itemId);
    },
    [itemsById],
  );

  const getItemOrPlaceholder = useCallback(
    (itemId: string) => {
      return getItem(itemId) ?? { type: "placeholder" as const };
    },
    [getItem],
  );

  const getItemName = useCallback((item: CatalogueTreeItem) => {
    switch (item.type) {
      case "volume":
      case "chapter":
        return item.title;
      default:
        return "";
    }
  }, []);

  const getItemNameById = useCallback(
    (itemId: string | null | undefined) => {
      const item = getItem(itemId);
      return item ? getItemName(item) : "";
    },
    [getItem, getItemName],
  );

  const getChildrenIds = useCallback(
    (itemId: string) => {
      if (itemId === "root") {
        return volumes.map((v) => v.id);
      }
      return chaptersByVolumeId.get(itemId) ?? [];
    },
    [volumes, chaptersByVolumeId],
  );

  const getItemAboveId = useCallback(
    (itemId: string | null | undefined) => {
      if (!itemId || itemId === "root") return undefined;
      const idx = flatIndexById.get(itemId);
      if (idx === undefined || idx <= 0) return undefined;
      return flatItemIds[idx - 1];
    },
    [flatIndexById, flatItemIds],
  );

  const getItemBelowId = useCallback(
    (itemId: string | null | undefined) => {
      if (!itemId || itemId === "root") return undefined;
      const idx = flatIndexById.get(itemId);
      if (idx === undefined) return undefined;
      return flatItemIds[idx + 1];
    },
    [flatIndexById, flatItemIds],
  );

  const getItemAbove = useCallback(
    (itemId: string | null | undefined) => getItem(getItemAboveId(itemId)),
    [getItem, getItemAboveId],
  );

  const getItemBelow = useCallback(
    (itemId: string | null | undefined) => getItem(getItemBelowId(itemId)),
    [getItem, getItemBelowId],
  );

  const renameItem = useCallback(
    (item: CatalogueTreeItem, value: string) => {
      switch (item.type) {
        case "volume":
          novelStore.commit(
            novelEvents.volumeTitleUpdated({
              id: item.id,
              title: value,
              modified: new Date(),
            }),
          );
          return;
        case "chapter":
          novelStore.commit(
            novelEvents.chapterTitleUpdated({
              id: item.id,
              title: value,
              modified: new Date(),
            }),
          );
          return;
        default:
          throw shouldNeverHappen("data.type !== volume && data.type !== chapter");
      }
    },
    [novelStore],
  );

  const structureRevision = `${volumes.length}:${chapters.length}`;

  return {
    novelId,
    volumes,
    chapters,
    expandedItems,
    setExpandedItems,
    focusedItem,
    setFocusedItem,
    getItem,
    getItemOrPlaceholder,
    getItemName,
    getItemNameById,
    getChildrenIds,
    getItemAboveId,
    getItemBelowId,
    getItemAbove,
    getItemBelow,
    renameItem,
    structureRevision,
  };
}

export function CatalogueDataProvider({
  value,
  children,
}: {
  value: CatalogueDataContextValue;
  children: React.ReactNode;
}) {
  return React.createElement(CatalogueDataContext.Provider, { value }, children);
}
