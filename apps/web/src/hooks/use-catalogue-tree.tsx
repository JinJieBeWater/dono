import {
  type Chapter,
  novelEvents,
  useNovelStore,
  visibleChapters$,
  visibleVolumes$,
  type Volume,
} from "@/stores/novel";
import {
  hotkeysCoreFeature,
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
}

const customClickBehavior: FeatureImplementation = {
  itemInstance: {
    getProps: ({ item, prev }) => ({
      ...prev?.(),
      onDoubleClick: () => {
        item.primaryAction();

        if (!item.isFolder()) {
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
  const params = useParams({ strict: false });
  const { novelId } = useParams({
    from: "/novel/$novelId",
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
    features: [syncDataLoaderFeature, hotkeysCoreFeature, customClickBehavior, renamingFeature],
  });

  useEffect(() => {
    tree.rebuildTree();
  }, [volumes]);

  useEffect(() => {
    tree.rebuildTree();
  }, [chapters]);

  // 根据当前路由参数自动聚焦对应的章节或卷
  useEffect(() => {
    const chapterId = params.chapterId;
    const volumeId = params.volumeId;

    // 优先聚焦章节，如果没有章节则聚焦卷
    const focusId = chapterId || volumeId;

    if (focusId) {
      const item = tree.getItemInstance(focusId);
      if (item) {
        item.setFocused();

        // 如果是章节，确保其父卷是展开的
        if (chapterId && volumeId) {
          const volumeItem = tree.getItemInstance(volumeId);
          if (volumeItem && !volumeItem.isExpanded()) {
            volumeItem.expand();
          }
        }
      }
    } else {
      // 直接通过tree的状态更新
      setFocusedItem("root");
    }
  }, [params.chapterId, params.volumeId, tree, volumes, chapters]);

  return <CatalogueTreeContext.Provider value={{ tree }}>{children}</CatalogueTreeContext.Provider>;
}

export function useCatalogueTree(): CatalogueTreeContextValue {
  const context = useContext(CatalogueTreeContext);
  if (!context) {
    throw new Error("useCatalogueTreeContext must be used within a CatalogueTreeProvider");
  }
  return context;
}
