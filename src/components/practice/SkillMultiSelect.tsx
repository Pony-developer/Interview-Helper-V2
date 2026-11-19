"use client";

import "@/lib/react-aria-dev-shim";

import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  Button,
  ComboBox,
  Header,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover,
  Tag,
  TagGroup,
  TagList,
  Text,
} from "react-aria-components";
import type { Skill } from "@/lib/content/schema";

export const MAX_SKILLS = 12;

type Props = {
  catalog: Skill[];
  withContent: Set<string>;
  selected: string[];
  onChange: (slugs: string[]) => void;
  error?: string;
};

function normalize(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

export function SkillMultiSelect({ catalog, withContent, selected, onChange, error }: Props) {
  const t = useTranslations("practice.skills");
  const tc = useTranslations("categories");
  const [query, setQuery] = useState("");
  const bySlug = useMemo(() => new Map(catalog.map((s) => [s.slug, s])), [catalog]);
  const full = selected.length >= MAX_SKILLS;

  const sections = useMemo(() => {
    const q = normalize(query.trim());
    const matches = catalog
      .filter((s) => !selected.includes(s.slug))
      .filter((s) => !q || normalize(s.name).includes(q) || s.aliases.some((a) => normalize(a).includes(q)))
      .sort(
        (a, b) =>
          Number(withContent.has(b.slug)) - Number(withContent.has(a.slug)) ||
          (q ? Number(normalize(b.name).startsWith(q)) - Number(normalize(a.name).startsWith(q)) : 0) ||
          b.popularity - a.popularity,
      );
    const groups = new Map<string, Skill[]>();
    for (const s of matches.slice(0, 80)) {
      const list = groups.get(s.category) ?? [];
      list.push(s);
      groups.set(s.category, list);
    }
    return [...groups.entries()].map(([category, items]) => ({ category, items }));
  }, [catalog, query, selected, withContent]);

  const popular = useMemo(
    () =>
      catalog
        .filter((s) => withContent.has(s.slug) && !selected.includes(s.slug))
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 10),
    [catalog, selected, withContent],
  );

  const add = (slug: string) => {
    if (!slug || selected.includes(slug) || full) return;
    onChange([...selected, slug]);
  };

  return (
    <div className="space-y-5">
      <ComboBox
        aria-describedby={error ? "skills-error" : undefined}
        selectedKey={null}
        inputValue={query}
        onInputChange={setQuery}
        onSelectionChange={(key) => {
          if (key != null) add(String(key));
          setQuery("");
        }}
        defaultFilter={() => true}
        menuTrigger="focus"
        allowsEmptyCollection
        isDisabled={full}
        className="group"
      >
        <Label className="block font-semibold text-ink">{t("label")}</Label>
        <Text slot="description" className="mt-1 block text-sm text-ink-muted">
          {full ? t("max") : t("help")}
        </Text>
        <div className="relative mt-3">
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
          <Input
            placeholder={t("placeholder")}
            className="w-full rounded-2xl border border-paper-3 bg-white py-4 pl-12 pr-12 text-base text-ink shadow-card outline-none transition placeholder:text-ink-soft focus:border-forest-600 data-[disabled]:opacity-60"
          />
          <Button className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl text-ink-muted hover:bg-paper">
            <ChevronDown aria-hidden className="h-5 w-5" />
          </Button>
        </div>
        <Popover
          offset={6}
          className="max-h-80 w-[var(--trigger-width)] overflow-auto rounded-2xl border border-paper-3 bg-white p-2 shadow-lift data-[entering]:animate-fade"
        >
          <ListBox
            className="outline-none"
            renderEmptyState={() => <p className="px-3 py-4 text-sm text-ink-muted">{t("noResults", { query })}</p>}
          >
            {sections.map(({ category, items }) => (
              <ListBoxSection key={category} id={category} className="mb-1">
                <Header className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
                  {tc.has(category as never) ? tc(category as never) : category}
                </Header>
                {items.map((s) => (
                  <ListBoxItem
                    key={s.slug}
                    id={s.slug}
                    textValue={s.name}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-ink outline-none data-[focused]:bg-forest-50 data-[focused]:text-forest-800"
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        aria-hidden
                        className={`h-2 w-2 rounded-full ${withContent.has(s.slug) ? "bg-gold-500" : "bg-paper-3"}`}
                      />
                      {s.name}
                    </span>
                    <span className="text-xs text-ink-soft">{withContent.has(s.slug) ? t("hasContent") : t("noContent")}</span>
                  </ListBoxItem>
                ))}
              </ListBoxSection>
            ))}
          </ListBox>
        </Popover>
      </ComboBox>

      <TagGroup
        onRemove={(keys) => onChange(selected.filter((s) => !keys.has(s)))}
        className="rounded-2xl border border-dashed border-paper-3 bg-white/60 p-4"
      >
        <Label className="text-sm font-semibold text-ink-muted">
          {t("selected")} ({selected.length}/{MAX_SKILLS})
        </Label>
        <TagList
          className="mt-3 flex flex-wrap gap-2"
          renderEmptyState={() => <span className="text-sm text-ink-soft">{t("empty")}</span>}
        >
          {selected.map((slug) => {
            const skill = bySlug.get(slug);
            const name = skill?.name ?? slug;
            return (
              <Tag
                key={slug}
                id={slug}
                textValue={name}
                className="flex items-center gap-1.5 rounded-full bg-forest-700 py-1.5 pl-3.5 pr-1.5 text-sm font-medium text-white outline-none data-[focus-visible]:ring-[3px] data-[focus-visible]:ring-gold-500"
              >
                {withContent.has(slug) ? <Check aria-hidden className="h-3.5 w-3.5 text-gold-300" /> : null}
                {name}
                <Button
                  slot="remove"
                  aria-label={t("remove", { name })}
                  className="grid h-6 w-6 place-items-center rounded-full hover:bg-white/15"
                >
                  <X aria-hidden className="h-3.5 w-3.5" />
                </Button>
              </Tag>
            );
          })}
        </TagList>
      </TagGroup>

      {popular.length ? (
        <div>
          <p className="text-sm font-semibold text-ink-muted" id="popular-label">
            {t("popular")}
          </p>
          <ul aria-labelledby="popular-label" className="mt-2 flex flex-wrap gap-2">
            {popular.map((s) => (
              <li key={s.slug}>
                <button
                  type="button"
                  disabled={full}
                  onClick={() => add(s.slug)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-paper-3 bg-white px-3.5 py-1.5 text-sm text-ink transition hover:border-forest-600 hover:text-forest-700 disabled:opacity-50"
                >
                  <Plus aria-hidden className="h-3.5 w-3.5" />
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? (
        <p id="skills-error" role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
