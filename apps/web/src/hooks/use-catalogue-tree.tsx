import {
  novelEvents,
  visibleChapters$,
  visibleVolumes$,
  type Chapter,
  type Volume,
} from "@dono/stores/novel";
import { useNovelStore } from "@/stores/novel";
import {
  buildProxiedInstance,
  hotkeysCoreFeature,
  propMemoizationFeature,
  syncDataLoaderFeature,
  type FeatureImplementation,
  type TreeInstance,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { useParams } from "@tanstack/react-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "./use-local-storage";
import { renamingFeature } from "@headless-tree/core";
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

interface CatalogueTreeContextValue {
  tree: TreeInstance<CatalogueTreeItem>;
  setFocusedItem: React.Dispatch<React.SetStateAction<string | null>>;
}

const customClickBehavior: FeatureImplementation = {
  itemInstance: {
    getProps: ({ item, prev }) => ({
      ...prev?.(),
      onDoubleClick: (e: MouseEvent) => {
        item.primaryAction();

        if (!item.isFolder()) {
          return;
        }

        // 只有点击在带有 data-slot="canDoubleClick" 的元素上才触发折叠/展开
        const target = e.target as HTMLElement;
        if (!target.closest('[data-slot="canDoubleClick"]')) {
          return;
        }

        if (item.isExpanded()) {
          item.collapse();
        } else {
          item.expand();
        }
      },
      onClick: (_e: MouseEvent) => {
        //
      },
    }),
  },
};

const CatalogueTreeContext = createContext<CatalogueTreeContextValue | null>(null);

export function CatalogueTreeProvider({ children }: { children: React.ReactNode }) {
  const novelId = useParams({
    from: "/novel/$novelId",
    select: (params) => params.novelId,
  });

  const novelStore = useNovelStore(novelId);
  const volumes = novelStore.useQuery(visibleVolumes$());
  const chapters = novelStore.useQuery(visibleChapters$());
  const dataSet = [
    ...volumes.map((volume) => ({ type: "volume", ...volume })),
    ...chapters.map((chapter) => ({ type: "chapter", ...chapter })),
  ];
  const [expandedItems, setExpandedItems] = useLocalStorage<string[]>("SIDEBAR_EXPANDED_ITEMS", []);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

  const tree = useTree<CatalogueTreeItem>({
    instanceBuilder: buildProxiedInstance,
    rootItemId: "root",
    indent: 20,
    state: { expandedItems, focusedItem },
    setExpandedItems,
    setFocusedItem,
    getItemName: (item) => {
      const data = item.getItemData();
      const type = data.type;
      switch (type) {
        case "volume":
          return data.title;
        case "chapter":
          return data.title;
        default:
          return "";
      }
    },
    isItemFolder: (item) => item.getItemData().type === "volume",
    dataLoader: {
      getItem: (itemId) => {
        const data = dataSet.find((item) => item.id === itemId);
        if (data) {
          return data as CatalogueTreeItem;
        }
        return {
          type: "placeholder",
        };
      },
      getChildren: (itemId) => {
        if (itemId === "root") {
          return volumes.map((volume) => volume.id);
        } else {
          return chapters
            .filter((chapter) => chapter.volumeId === itemId)
            .map((chapter) => chapter.id);
        }
      },
    },
    onRename: (item, value) => {
      const data = item.getItemData();
      switch (data.type) {
        case "volume":
          novelStore.commit(
            novelEvents.volumeTitleUpdated({
              id: data.id,
              title: value,
              modified: new Date(),
            }),
          );
          break;
        case "chapter":
          novelStore.commit(
            novelEvents.chapterTitleUpdated({
              id: data.id,
              title: value,
              modified: new Date(),
            }),
          );
          break;
        default:
          throw shouldNeverHappen("data.type !== volume && data.type !== chapter");
      }
    },
    features: [
      syncDataLoaderFeature,
      hotkeysCoreFeature,
      customClickBehavior,
      renamingFeature,
      propMemoizationFeature,
    ],
  });

  useEffect(() => {
    tree.rebuildTree();
  }, [dataSet.length]);

  return (
    <CatalogueTreeContext.Provider value={{ tree, setFocusedItem }}>
      {children}
    </CatalogueTreeContext.Provider>
  );
}

export function useCatalogueTree(): CatalogueTreeContextValue {
  const context = useContext(CatalogueTreeContext);
  if (!context) {
    throw new Error("useCatalogueTreeContext must be used within a CatalogueTreeProvider");
  }
  return context;
}
