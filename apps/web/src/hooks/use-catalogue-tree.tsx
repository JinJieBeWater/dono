import {
  type Chapter,
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

export type CatalogueTreeItem =
  | ({
      type: "volume";
    } & Volume)
  | ({
      type: "chapter";
    } & Chapter)
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
      onClick: (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const isChevronClick = target.closest('[data-chevron="true"]');

        if (isChevronClick && item.isFolder()) {
          if (item.isExpanded()) {
            item.collapse();
          } else {
            item.expand();
          }
        }
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
    indent: 20,
    features: [syncDataLoaderFeature, hotkeysCoreFeature, customClickBehavior],
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
