"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BOOKS, toShelves, withAmazonTag, type Book } from "@/lib/books";

/**
 * Granny's Bookcase — CSS-built wooden shelf displaying book covers,
 * click-through to a detail card with summary + purchase links.
 *
 * Reused on both the landing page (public, builds trust/credibility) and
 * inside the dashboard (signed-in users, cross-sell) — same component,
 * different surrounding context. Pass `variant` to adjust the heading
 * copy for each placement.
 */

interface GrannysBookcaseProps {
  variant?: "landing" | "dashboard";
}

export default function GrannysBookcase({ variant = "landing" }: GrannysBookcaseProps) {
  const [selected, setSelected] = useState<Book | null>(null);
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const shelves = toShelves(BOOKS, 4);

  function openBook(book: Book, e: React.MouseEvent<HTMLElement>) {
    setTriggerEl(e.currentTarget);
    setSelected(book);
  }

  function closeBook() {
    setSelected(null);
    triggerEl?.focus();
  }

  useEffect(() => {
    if (!selected) return;
    closeButtonRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeBook();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <section
      className={variant === "landing" ? "mx-auto max-w-4xl px-6 py-12" : ""}
    >
      <div className="gilt-flourish mb-4" />
      <p className="tabular text-xs uppercase tracking-wide text-sage">
        {variant === "landing" ? "From the team behind the app" : "Recommended reading"}
      </p>
      <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
        Granny&rsquo;s Bookcase
      </h2>
      <p className="mt-2 max-w-xl text-ink/80">
        {variant === "landing"
          ? "Granny May's Ledger comes from the same place as these books — real, practical money guidance, no jargon required."
          : "A few books worth having on the shelf, from the same people behind this app."}
      </p>

      <div className="relative mt-10 mx-1">
        {/* crown moulding */}
        <div className="h-5 rounded-[2px] bg-gradient-to-b from-[#8a5c3c] to-[#5c3a24] shadow-[0_4px_10px_rgba(0,0,0,0.45)]" />

        <div className="relative bg-gradient-to-b from-[#5c3a24] via-[#43290f] to-[#2c1a0a] px-4 pb-2 pt-4 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] ring-1 ring-black/40 sm:px-6">
          {shelves.map((shelfBooks, shelfIndex) => (
            <div key={shelfIndex} className="relative mb-2 last:mb-0">
              <div className="flex items-end justify-start gap-4 overflow-x-auto px-2 pb-3 sm:gap-6 sm:px-4">
                {shelfBooks.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    onClick={(e) => openBook(book, e)}
                    className="group relative shrink-0 transition-transform duration-150 hover:-translate-y-1.5"
                    style={{ transform: "rotate(-1.5deg)" }}
                    aria-label={`View details for ${book.title}`}
                  >
                    <div className="relative h-32 w-[88px] overflow-hidden rounded-sm shadow-md ring-1 ring-black/30 sm:h-48 sm:w-32">
                      <Image
                        src={book.coverImage}
                        alt={book.title}
                        fill
                        sizes="(min-width: 640px) 128px, 88px"
                        className="object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
              {/* wooden shelf plank */}
              <div className="h-3 w-full rounded-[1px] bg-gradient-to-b from-[#4a2f1a] to-[#2c1a0a] shadow-[0_4px_6px_rgba(0,0,0,0.4)]" />
            </div>
          ))}
        </div>

        {/* base plinth */}
        <div className="h-5 rounded-[2px] bg-gradient-to-b from-[#5c3a24] to-[#2c1a0a] shadow-[0_6px_14px_rgba(0,0,0,0.45)]" />
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeBook}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bookcase-dialog-title"
            className="ledger-card relative max-w-md p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeBook}
              className="absolute right-4 top-4 text-ink/50 hover:text-ink"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="flex gap-4">
              <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-sm shadow-md">
                <Image
                  src={selected.coverImage}
                  alt={selected.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div>
                <h3 id="bookcase-dialog-title" className="font-display text-xl text-ink">
                  {selected.title}
                </h3>
                <p className="mt-1 text-sm text-ink/60">{selected.author}</p>
              </div>
            </div>

            <p className="mt-4 text-ink/90">{selected.summary}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={withAmazonTag(selected.amazonUrl)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-block rounded-full bg-gilt-bright px-5 py-2.5 font-medium text-white transition hover:brightness-95"
              >
                Buy on Amazon
              </a>
              {selected.bnUrl && (
                <a
                  href={selected.bnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-full border border-rule px-5 py-2.5 font-medium text-ink transition hover:bg-parchment-dim"
                >
                  Buy at Barnes &amp; Noble
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
