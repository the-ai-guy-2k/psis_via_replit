import type { Entry, OutcomeCategory, OutcomeType, OutcomeDetail } from "@workspace/api-client-react";

export interface OutcomeOption {
  value: OutcomeType;
  label: string;
}

export interface DetailOption {
  value: OutcomeDetail;
  label: string;
}

/**
 * Top-level defense options shown after clicking "Defense" in the EABR click
 * flow. `infield_out` was removed from this list per the approved tracker
 * logic update — it is kept in the OutcomeType schema enum purely so
 * pre-existing entries that used it keep validating; the wizard never
 * produces it anymore.
 */
export const DEFENSE_OUTCOMES: OutcomeOption[] = [
  { value: "strikeout", label: "Strikeout" },
  { value: "fly_out", label: "Fly Out" },
  { value: "ground_out", label: "Ground Out" },
];

/**
 * Top-level offense options shown after clicking "Offense" in the EABR click
 * flow. "Run Scored" was removed per the base-state auto-calculation patch —
 * runs are now derived automatically from Hit/Walk base advancement instead
 * of being logged as their own manual outcome. It is kept in the
 * OutcomeType schema enum purely so pre-existing entries keep validating.
 */
export const OFFENSE_OUTCOMES: OutcomeOption[] = [
  { value: "hit", label: "Hit" },
  { value: "walk", label: "Walk" },
];

export function outcomesForCategory(category: OutcomeCategory): OutcomeOption[] {
  return category === "defense" ? DEFENSE_OUTCOMES : OFFENSE_OUTCOMES;
}

/** Follow-up "where was the catch made" options for Fly Out. */
export const FLY_OUT_LOCATIONS: DetailOption[] = [
  { value: "infield", label: "Infield" },
  { value: "outfield", label: "Outfield" },
];

/** Follow-up "play result" options for Ground Out. */
export const GROUND_OUT_RESULTS: DetailOption[] = [
  { value: "single_play", label: "Single Play" },
  { value: "double_play", label: "Double Play" },
  { value: "triple_play", label: "Triple Play" },
];

/** Follow-up "hit type" options for Hit. */
export const HIT_TYPES: DetailOption[] = [
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "triple", label: "Triple" },
  { value: "home_run", label: "Home Run" },
];

/**
 * Outcome types that require a follow-up click before the EABR (End of
 * At-Bat Result) is reached and the entry can be saved.
 */
export function detailOptionsForOutcomeType(type: OutcomeType): DetailOption[] | undefined {
  switch (type) {
    case "fly_out":
      return FLY_OUT_LOCATIONS;
    case "ground_out":
      return GROUND_OUT_RESULTS;
    case "hit":
      return HIT_TYPES;
    default:
      return undefined;
  }
}

function labelFor(type: OutcomeType | OutcomeDetail | string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

export { labelFor as labelForOutcomeValue };

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
