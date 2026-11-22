"use client";

import { Pencil, Settings2, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteSlideAction } from "@/app/actions/admin-courses";
import { Link, useRouter } from "@/i18n/navigation";

/** Shown to admins above a slide: jump to the editors, or delete the slide in place. */
export function AdminSlideBar({
  course,
  slideId,
  slideSlug,
  afterDeleteHref,
}: {
  course: string;
  slideId: string;
  slideSlug: string;
  /** Where to go once the slide is gone: the next slide, the previous one, or the course. */
  afterDeleteHref: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm(`Delete slide "${slideSlug}" and learners' progress on it? This can't be undone.`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await deleteSlideAction(slideId);
      if (!res.ok) {
        setError(res.errors.join(" "));
        return;
      }
      router.replace(afterDeleteHref);
      router.refresh();
    } catch {
      setError("The server didn't respond. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const pill =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-gold-500/70 bg-gold-100/50 px-3 py-2">
      <span className="inline-flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-800">
        <ShieldCheck aria-hidden className="h-4 w-4" />
        Admin
      </span>
      <Link href={`/admin/courses/${course}/slides/${slideId}`} className={`${pill} bg-forest-700 text-white hover:bg-forest-800`}>
        <Pencil aria-hidden className="h-3.5 w-3.5" /> Edit slide
      </Link>
      <Link href={`/admin/courses/${course}`} className={`${pill} border border-paper-3 bg-white text-forest-700 hover:border-forest-600`}>
        <Settings2 aria-hidden className="h-3.5 w-3.5" /> Edit course
      </Link>
      <button type="button" onClick={remove} disabled={busy} className={`${pill} ml-auto border border-danger/30 bg-white text-danger hover:bg-danger-soft`}>
        <Trash2 aria-hidden className="h-3.5 w-3.5" /> {busy ? "Deleting…" : "Delete slide"}
      </button>
      {error ? (
        <p role="alert" className="w-full px-1 text-xs font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
