import type { Entry, OutcomeCategory, OutcomeType, OutcomeDetail } from "@workspace/api-client-react";

export interface OutcomeOption {
  value: OutcomeType;
  label: string;
  asksLeftOnBase: boolean;
}

export const DEFENSE_OUTCOMES: OutcomeOption[] = [
  { value: "strikeout", label: "Strikeout", asksLeftOnBase: false },
  { value: "fly_out", label: "Fly Out", asksLeftOnBase: true },
  { value: "ground_out", label: "Ground Out", asksLeftOnBase: true },
  { value: "infield_catch", label: "Infield Catch", asksLeftOnBase: false },
  { value: "double_play", label: "Double Play", asksLeftOnBase: true },
  { value: "triple_play", label: "Triple Play", asksLeftOnBase: true },
];

export const OFFENSE_OUTCOMES: OutcomeOption[] = [
  { value: "run_scored", label: "Run Scored", asksLeftOnBase: false },
  { value: "hit", label: "Hit", asksLeftOnBase: false },
  { value: "walk", label: "Walk", asksLeftOnBase: false },
  { value: "home_run", label: "Home Run", asksLeftOnBase: false },
  { value: "extra_base_hit", label: "Extra Base Hit", asksLeftOnBase: false },
];

export function outcomesForCategory(category: OutcomeCategory): OutcomeOption[] {
  return category === "defense" ? DEFENSE_OUTCOMES : OFFENSE_OUTCOMES;
}

export function outcomeAsksLeftOnBase(category: OutcomeCategory | undefined, type: OutcomeType | undefined): boolean {
  if (category !== "defense" || !type) return false;
  return DEFENSE_OUTCOMES.find(o => o.value === type)?.asksLeftOnBase ?? false;
}

function labelFor(type: OutcomeType | string): string {
  return type.replace(/_/g, " ");
}

/**
 * Produces a human-readable outcome label for an entry, supporting both
 * wizard-created entries (outcomeCategory/outcomeType) and legacy entries
 * created before the wizard existed (flat `result` field).
 */
export function describeOutcome(entry: Entry): string {
  if (entry.outcomeType) {
    const detail = entry.outcomeDetail ? ` (${labelFor(entry.outcomeDetail)})` : "";
    return `${labelFor(entry.outcomeType)}${detail}`;
  }
  if (entry.result) {
    return labelFor(entry.result);
  }
  return "Unknown";
}

export function describeOutcomeCategory(entry: Entry): "defense" | "offense" | undefined {
  return entry.outcomeCategory;
}

export type { OutcomeCategory, OutcomeType, OutcomeDetail };
