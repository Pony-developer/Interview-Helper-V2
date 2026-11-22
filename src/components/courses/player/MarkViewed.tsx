"use client";

import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";
import { markLectureViewedAction } from "@/app/actions/course";

/** Marks a lecture as read once it has been open for a moment, then refreshes the sidebar. */
export function MarkViewed({ slideId }: { slideId: string }) {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      markLectureViewedAction(slideId).then((r) => {
        if (r.ok) router.refresh();
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [slideId, router]);
  return null;
}
