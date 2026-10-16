"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";

type WeekPickerItem = {
  id: number;
};

export function WeekPicker({
  locale,
  selectedWeek,
  weekLabel,
  weeks,
}: {
  locale: Locale;
  selectedWeek: number | null;
  weekLabel: string;
  weeks: WeekPickerItem[];
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const selectedLink = useRef<HTMLAnchorElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateControls = useCallback(() => {
    const element = scroller.current;
    if (!element) return;
    const maximum = Math.max(0, element.scrollWidth - element.clientWidth);
    setCanScrollLeft(element.scrollLeft > 2);
    setCanScrollRight(element.scrollLeft < maximum - 2);
  }, []);

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    selectedLink.current?.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "center",
    });
    updateControls();
    const resizeObserver = new ResizeObserver(updateControls);
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [selectedWeek, updateControls]);

  function scroll(direction: -1 | 1) {
    const element = scroller.current;
    if (!element) return;
    element.scrollBy({
      behavior: "smooth",
      left: direction * Math.max(220, element.clientWidth * 0.75),
    });
  }

  return (
    <div className="week-picker-shell">
      <div
        aria-label={
          locale === "tr" ? "Hafta listesi kontrolleri" : "Week list controls"
        }
        className="week-picker-controls"
      >
        {canScrollLeft && (
          <button
            aria-label={
              locale === "tr"
                ? "Önceki haftaları göster"
                : "Show previous weeks"
            }
            onClick={() => scroll(-1)}
            type="button"
          >
            ←
          </button>
        )}
        {canScrollRight && (
          <button
            aria-label={
              locale === "tr"
                ? "Sonraki haftaları göster"
                : "Show later weeks"
            }
            onClick={() => scroll(1)}
            type="button"
          >
            →
          </button>
        )}
      </div>
      <div
        aria-label={
          locale === "tr" ? "Hafta seçimi" : "Choose a week"
        }
        className="week-picker"
        onScroll={updateControls}
        ref={scroller}
      >
        {weeks.map((week) => (
          <Link
            className={week.id === selectedWeek ? "active" : ""}
            href={`/konusma-konulari?hafta=${week.id}`}
            key={week.id}
            ref={week.id === selectedWeek ? selectedLink : undefined}
          >
            <small>{weekLabel}</small>
            <strong>{week.id}</strong>
          </Link>
        ))}
      </div>
    </div>
  );
}
