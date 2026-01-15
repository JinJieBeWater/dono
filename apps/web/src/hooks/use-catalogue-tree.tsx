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
import React, { createContext, useContext, useEffect } from "react";
import { renamingFeature } from "@headless-tree/core";
import {
  CatalogueDataProvider,
  useCatalogueDataValue,
  type CatalogueTreeItem,
} from "./use-catalogue-data";
export type {
  CatalogueTreeChapterItem,
  CatalogueTreeItem,
  CatalogueTreeVolumeItem,
} from "./use-catalogue-data";

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

  const catalogueData = useCatalogueDataValue(novelId);

  const tree = useTree<CatalogueTreeItem>({
    instanceBuilder: buildProxiedInstance,
    rootItemId: "root",
    indent: 20,
    state: { expandedItems: catalogueData.expandedItems, focusedItem: catalogueData.focusedItem },
    setExpandedItems: catalogueData.setExpandedItems,
    setFocusedItem: catalogueData.setFocusedItem,
    getItemName: (item) => catalogueData.getItemName(item.getItemData()),
    isItemFolder: (item) => item.getItemData().type === "volume",
    dataLoader: {
      getItem: (itemId) => catalogueData.getItemOrPlaceholder(itemId),
      getChildren: (itemId) => catalogueData.getChildrenIds(itemId),
    },
    onRename: (item, value) => catalogueData.renameItem(item.getItemData(), value),
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
  }, [catalogueData.structureRevision]);

  return (
    <CatalogueDataProvider value={catalogueData}>
      <CatalogueTreeContext.Provider value={{ tree, setFocusedItem: catalogueData.setFocusedItem }}>
        {children}
      </CatalogueTreeContext.Provider>
    </CatalogueDataProvider>
  );
}

export function useCatalogueTree(): CatalogueTreeContextValue {
  const context = useContext(CatalogueTreeContext);
  if (!context) {
    throw new Error("useCatalogueTreeContext must be used within a CatalogueTreeProvider");
  }
  return context;
}
