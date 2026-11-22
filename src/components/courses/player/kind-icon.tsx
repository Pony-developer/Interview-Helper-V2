import { CircleHelp, Code2, FileText } from "lucide-react";
import type { SlideKind } from "@/lib/data/course-player";

const ICONS = { lecture: FileText, quiz: CircleHelp, practice: Code2 } as const;

export function KindIcon({ kind, className = "h-4 w-4" }: { kind: SlideKind; className?: string }) {
  const Icon = ICONS[kind];
  return <Icon aria-hidden className={className} />;
}
