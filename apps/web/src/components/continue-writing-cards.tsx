import { Edit, FileText, Layers, ArrowRight } from "lucide-react";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "@/components/ui/item";

interface ContinueWritingCardProps {
  novelId: string;
}

export function ContinueWritingCards({ novelId }: ContinueWritingCardProps) {
  const options = [
    {
      value: "latest-chapter",
      icon: <FileText className="w-4 h-4" />,
      title: "Latest Chapter",
      subtitle: "Vol 3 · Ch 8",
    },
    {
      value: "latest-outline",
      icon: <Layers className="w-4 h-4" />,
      title: "Latest Outline",
      subtitle: "Vol 3 · Outline",
    },
    {
      value: "last-chapter",
      icon: <FileText className="w-4 h-4" />,
      title: "Last Chapter",
      subtitle: "Vol 2 · Ch 5",
    },
    {
      value: "last-outline",
      icon: <Layers className="w-4 h-4" />,
      title: "Last Outline",
      subtitle: "Vol 2 · Outline",
    },
  ];

  return (
    <div className="space-y-2">
      <Item size={"xs"}>
        <ItemMedia variant="icon">
          <Edit />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Continue Writing</ItemTitle>
        </ItemContent>
      </Item>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {options.map((option) => (
          <Item
            key={option.title}
            size="sm"
            variant="outline"
            className="hover:bg-muted cursor-pointer"
          >
            <ItemMedia variant="icon">{option.icon}</ItemMedia>
            <ItemContent>
              <ItemTitle>{option.title}</ItemTitle>
              <ItemDescription>{option.subtitle}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </ItemActions>
          </Item>
        ))}
      </div>
    </div>
  );
}
