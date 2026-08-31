"use client";

import { useState, useTransition } from "react";
import { applySurplusSweep, dismissGrannyNote } from "@/lib/actions";
import type { SurplusSweepPrompt } from "@/lib/data/granny-notes";

type Target = { id: string; name: string };

function money(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}

type Option = "sinking_fund" | "goal" | "carryover";

/**
 * Granny's Notes-styled card for the Surplus Sweep prompt. Unlike the
 * plain dismiss-only GrannysNote, this one offers three real actions —
 * each creates a queryable contribution/carryover row, never a silent
 * reallocation (see handoff's "one hard rule").
 */
export function SurplusSweepNote({
  prompt,
  sinkingFunds,
  goals,
  currency,
}: {
  prompt: SurplusSweepPrompt;
  sinkingFunds: Target[];
  goals: Target[];
  currency: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Option | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [pending, startTransition] = useTransition();

  if (dismissed) return null;

  function apply(option: Option, targetId: string | null, targetLabel: string) {
    setError(null);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("trigger_key", prompt.triggerKey);
        fd.set("source_month", prompt.sourceMonth);
        fd.set("option", option);
        fd.set("amount", String(prompt.leftover));
        if (targetId) fd.set("target_id", targetId);
        await applySurplusSweep(fd);
        setDone(
          option === "carryover"
            ? `Rolled ${money(prompt.leftover, currency)} into this month's flexible budget.`
            : `Moved ${money(prompt.leftover, currency)} to ${targetLabel}.`
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      }
    });
  }

  async function handleDismiss() {
    startTransition(async () => {
      try {
        await dismissGrannyNote(prompt.triggerKey);
        setDismissed(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      }
    });
  }

  function openPicker(option: Option, list: Target[]) {
    setSelectedId("");
    // A single available target needs no picker — sweep straight to it.
    if (list.length === 1) {
      apply(option, list[0].id, list[0].name);
      return;
    }
    setExpanded((e) => (e === option ? null : option));
  }

  function renderPicker(option: Option, list: Target[]) {
    if (list.length === 0) {
      return (
        <p className="text-xs text-ink-soft mt-2">
          None set up yet — head to Budget or Goals to create one first.
        </p>
      );
    }
    return (
      <div className="flex items-center gap-2 mt-2">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="border border-rule bg-white px-2 py-1 text-xs"
        >
          <option value="">Choose one&hellip;</option>
          {list.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!selectedId || pending}
          onClick={() => apply(option, selectedId, list.find((t) => t.id === selectedId)?.name ?? "")}
          className="text-xs border border-plum text-plum px-3 py-1 hover:bg-plum hover:text-parchment transition-colors disabled:opacity-50"
        >
          Confirm
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-plum-soft px-4 py-3 mb-8">
      <p className="font-display text-lg text-plum">Granny says:</p>
      <p className="text-sm text-ink mt-0.5">
        {`You have ${money(prompt.leftover, currency)} left over from last month’s flexible budget (${prompt.sourceMonth}). Where should Granny move it?`}
      </p>

      {done ? (
        <p className="text-sm text-sage mt-3">{done}</p>
      ) : (
        <>
          {error && <p className="text-xs text-rust mt-2">{error}</p>}

          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              disabled={pending}
              onClick={() => openPicker("sinking_fund", sinkingFunds)}
              className="text-xs border border-plum text-plum px-3 py-1.5 hover:bg-plum hover:text-parchment transition-colors disabled:opacity-50"
            >
              Add to a sinking fund
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => openPicker("goal", goals)}
              className="text-xs border border-plum text-plum px-3 py-1.5 hover:bg-plum hover:text-parchment transition-colors disabled:opacity-50"
            >
              Boost a savings goal
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => apply("carryover", null, "")}
              className="text-xs border border-plum text-plum px-3 py-1.5 hover:bg-plum hover:text-parchment transition-colors disabled:opacity-50"
            >
              Roll into next month&rsquo;s fun money
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleDismiss}
              className="text-xs text-plum hover:underline disabled:opacity-50"
            >
              Dismiss
            </button>
          </div>

          {expanded === "sinking_fund" && renderPicker("sinking_fund", sinkingFunds)}
          {expanded === "goal" && renderPicker("goal", goals)}
        </>
      )}
    </div>
  );
}
