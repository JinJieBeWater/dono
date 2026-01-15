import type { ItemInstance } from "@headless-tree/core";
import { ChapterItem } from "./chapter-item";
import { VolumeItem } from "./volume-item";
import type { CatalogueTreeItem as CatalogueTreeItemType } from "@/hooks/use-catalogue-tree";
import { useCallback, useMemo } from "react";
import { shouldNeverHappen } from "@/utils/should-never-happen";
import { useCatalogueData } from "@/hooks/use-catalogue-data";

export const CatalogueTreeItem = ({
  item,
  novelId,
}: {
  item: ItemInstance<CatalogueTreeItemType>;
  novelId: string;
}) => {
  const data = item.getItemData();
  const type = data.type;

  switch (type) {
    case "volume":
      return <CatalogueTreeVolumeItem item={item} novelId={novelId} key={data.id} />;
    case "chapter":
      return <CatalogueTreeChapterItem item={item} novelId={novelId} key={data.id} />;
  }
};

const CatalogueTreeVolumeItem = ({
  item,
  novelId,
}: {
  item: ItemInstance<CatalogueTreeItemType>;
  novelId: string;
}) => {
  const { getItemAbove } = useCatalogueData();
  const data = item.getItemData();
  if (data.type !== "volume") throw shouldNeverHappen("item.type !== volume");
  const isExpanded = item.isExpanded();
  const isMatch = item.isFocused();
  const isRenaming = item.isRenaming();
  const collapse = useMemo(() => item.collapse, [item]);
  const expand = useMemo(() => item.expand, [item]);
  const startRenaming = useMemo(() => item.startRenaming, [item]);
  const getItemAboveForThis = useCallback(() => getItemAbove(data.id), [getItemAbove, data.id]);
  const style = useMemo(
    () => ({ marginLeft: `${item.getItemMeta().level * 10}px` }),
    [item.getItemMeta().level],
  );
  const volumeData = useMemo(() => data, [data.title, data.modified]);
  const getRenameInputProps = useMemo(() => item.getRenameInputProps, [item]);
  return (
    <VolumeItem
      novelId={novelId}
      data={volumeData}
      isExpanded={isExpanded}
      isRenaming={isRenaming}
      isMatch={isMatch}
      collapse={collapse}
      expand={expand}
      startRenaming={startRenaming}
      getRenameInputProps={getRenameInputProps}
      getItemAbove={getItemAboveForThis}
      style={style}
      {...item.getProps()}
    />
  );
};

const CatalogueTreeChapterItem = ({
  item,
  novelId,
}: {
  item: ItemInstance<CatalogueTreeItemType>;
  novelId: string;
}) => {
  const { getItemAbove } = useCatalogueData();
  const data = item.getItemData();
  if (data.type !== "chapter") throw shouldNeverHappen("item.type !== chapter");

  const isMatch = item.isFocused();
  const isRenaming = item.isRenaming();
  const startRenaming = useMemo(() => item.startRenaming, [item]);
  const getItemAboveForThis = useCallback(() => getItemAbove(data.id), [getItemAbove, data.id]);
  const style = useMemo(
    () => ({ marginLeft: `${item.getItemMeta().level * 10}px` }),
    [item.getItemMeta().level],
  );
  const chapterData = useMemo(() => data, [data.title, data.modified, data.order, data.volumeId]);
  const getRenameInputProps = useMemo(() => item.getRenameInputProps, [item]);

  return (
    <ChapterItem
      novelId={novelId}
      data={chapterData}
      isRenaming={isRenaming}
      isMatch={isMatch}
      getRenameInputProps={getRenameInputProps}
      startRenaming={startRenaming}
      getItemAbove={getItemAboveForThis}
      style={style}
      {...item.getProps()}
    />
  );
};
