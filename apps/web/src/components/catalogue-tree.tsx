import { useCatalogueTree } from "@/hooks/use-catalogue-tree";
import { ChapterItem } from "./chapter-item";
import { VolumeItem } from "./volume-item";

export function CatalogueTree({ novelId }: { novelId: string }) {
  const { tree } = useCatalogueTree();

  return (
    <div {...tree.getContainerProps()} className="flex flex-col">
      {tree.getItems().map((item) => {
        const data = item.getItemData();
        const type = data.type;

        if (type === "volume") {
          return (
            <VolumeItem
              novelId={novelId}
              item={item}
              key={item.getId()}
              style={{ marginLeft: `${item.getItemMeta().level * 10}px` }}
              {...item.getProps()}
            />
          );
        }

        if (type === "chapter") {
          return (
            <ChapterItem
              novelId={novelId}
              item={item}
              key={item.getId()}
              style={{ marginLeft: `${item.getItemMeta().level * 10}px` }}
              {...item.getProps()}
            />
          );
        }
      })}
    </div>
  );
}
