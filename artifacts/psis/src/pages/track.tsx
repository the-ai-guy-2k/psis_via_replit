import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateEntry,
  useListEntries,
  useGetCurrentInning,
  useStartNewGame,
  getListEntriesQueryKey,
  getGetDashboardQueryKey,
  getGetCurrentInningQueryKey,
} from "@workspace/api-client-react";
import type { OutcomeCategory, OutcomeType, OutcomeDetail, BaseState } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, ShieldCheck, Swords, Circle, PartyPopper, ChevronLeft, RotateCcw, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  describeOutcome,
  outcomesForCategory,
  detailOptionsForOutcomeType,
  labelForOutcomeValue,
} from "@/lib/outcome";

type WizardState = {
  started: boolean;
  outcomeCategory?: OutcomeCategory;
  outcomeType?: OutcomeType;
  outcomeDetail?: OutcomeDetail;
};

const emptyWizard: WizardState = { started: false };

const SCOREBOARD_INNINGS = 9;

type ScoreboardSlot =
  | { inningNumber: number; completed: true; delta: number; goodCount: number; badCount: number }
  | { inningNumber: number; completed: false };

/**
 * Compact 9-box line-score scoreboard slots for the Game Status Panel,
 * derived purely client-side from the full entries list — an inning counts
 * as "completed" once its at-bats' outsAdded sum to 3, mirroring the
 * server's own completion rule (see computeInningState in psisStore.ts)
 * without adding a new API endpoint. Only entries belonging to the current
 * game (matching `currentGameId`, with legacy entries treated as game 1,
 * mirroring the server's isEntryInGame rule) are counted, so a New Game
 * always starts this scoreboard fresh even though old entries stay in
 * storage for the season Dashboard. Always returns exactly 9 slots —
 * innings with no at-bats yet, or not yet at 3 outs, render as empty
 * placeholders (row 1/2 blank, row 3 shows the inning number).
 */
function computeScoreboardSlots(
  entries: { inningNumber?: number; delta: number; outsAdded?: number; goodCount: number; badCount: number; gameId?: number }[] | undefined,
  currentGameId: number | undefined,
): ScoreboardSlot[] {
  const byInning = new Map<number, { delta: number; outs: number; goodCount: number; badCount: number }>();
  for (const entry of entries ?? []) {
    if (entry.inningNumber === undefined) continue;
    if (currentGameId !== undefined && (entry.gameId ?? 1) !== currentGameId) continue;
    const current = byInning.get(entry.inningNumber) ?? { delta: 0, outs: 0, goodCount: 0, badCount: 0 };
    current.delta += entry.delta;
    current.outs += entry.outsAdded ?? 0;
    current.goodCount += entry.goodCount;
    current.badCount += entry.badCount;
    byInning.set(entry.inningNumber, current);
  }
  return Array.from({ length: SCOREBOARD_INNINGS }, (_, i) => {
    const inningNumber = i + 1;
    const v = byInning.get(inningNumber);
    if (v && v.outs >= 3) {
      return { inningNumber, completed: true as const, delta: v.delta, goodCount: v.goodCount, badCount: v.badCount };
    }
    return { inningNumber, completed: false as const };
  });
}

/** Compact "Bases: 1B ● | 2B ○ | 3B ●" visual so the user can see why LOB/runs were calculated. */
function BaseStateDisplay({ baseState }: { baseState: BaseState | undefined }) {
  const bases: { label: string; occupied: boolean; testId: string }[] = [
    { label: "1B", occupied: !!baseState?.firstBase, testId: "base-first" },
    { label: "2B", occupied: !!baseState?.secondBase, testId: "base-second" },
    { label: "3B", occupied: !!baseState?.thirdBase, testId: "base-third" },
  ];
  return (
    <div className="flex items-center gap-2 font-mono text-sm" data-testid="base-state-display">
      {bases.map((base, i) => (
        <span key={base.label} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground">|</span>}
          {base.label}
          <Circle
            data-testid={base.testId}
            className={`w-2.5 h-2.5 ${base.occupied ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
          />
        </span>
      ))}
    </div>
  );
}

export default function Track() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries, isLoading: entriesLoading } = useListEntries();
  const { data: inning, isLoading: inningLoading } = useGetCurrentInning();
  const createEntry = useCreateEntry();
  const startNewGameMutation = useStartNewGame();

  const [notes, setNotes] = useState("");
  const [wizard, setWizard] = useState<WizardState>(emptyWizard);
  const [acknowledgedInning, setAcknowledgedInning] = useState<number | undefined>(undefined);

  // Outcome types that need a follow-up click before an EABR (End of At-Bat
  // Result) is reached. Everything else (strikeout, walk) is itself the
  // EABR the instant it's clicked.
  const detailOptions = wizard.outcomeType ? detailOptionsForOutcomeType(wizard.outcomeType) : undefined;
  const needsDetail = !!detailOptions;

  const startOutcome = () => {
    setWizard({ started: true });
  };

  const selectCategory = (category: OutcomeCategory) => {
    setWizard({ started: true, outcomeCategory: category });
  };

  const selectOutcomeType = (type: OutcomeType) => {
    const next: WizardState = { started: true, outcomeCategory: wizard.outcomeCategory, outcomeType: type };
    setWizard(next);
    // No follow-up click needed for this type (e.g. strikeout, walk) — the
    // EABR is reached the instant it's clicked, so auto-save immediately.
    if (!detailOptionsForOutcomeType(type)) {
      autoSave(next);
    }
  };

  const selectOutcomeDetail = (detail: OutcomeDetail) => {
    const next: WizardState = { ...wizard, outcomeDetail: detail };
    setWizard(next);
    // Selecting the follow-up detail (catch location / play result / hit
    // type) is always the EABR for these branches — auto-save immediately.
    autoSave(next);
  };

  // Reached only once every required click in the path has been made — the
  // "EABR" (End of At-Bat Result). Nothing is ever saved before this.
  const isEabrReached =
    !!wizard.outcomeCategory && !!wizard.outcomeType && (!needsDetail || !!wizard.outcomeDetail);

  const resetForm = () => {
    setNotes("");
    setWizard(emptyWizard);
  };

  const goBack = () => {
    setWizard(prev => {
      if (prev.outcomeDetail !== undefined) {
        return { started: true, outcomeCategory: prev.outcomeCategory, outcomeType: prev.outcomeType };
      }
      if (prev.outcomeType !== undefined) {
        return { started: true, outcomeCategory: prev.outcomeCategory };
      }
      if (prev.outcomeCategory !== undefined) {
        return { started: true };
      }
      return { started: false };
    });
  };

  const breadcrumb: string[] = ["Outcome"];
  if (wizard.outcomeCategory) breadcrumb.push(wizard.outcomeCategory === "defense" ? "Defense" : "Offense");
  if (wizard.outcomeType) breadcrumb.push(labelForOutcomeValue(wizard.outcomeType));
  if (wizard.outcomeDetail) breadcrumb.push(labelForOutcomeValue(wizard.outcomeDetail));

  // Guards against a double auto-save from a stray double-click or a rapid
  // repeat call before the mutation settles — auto-save should fire exactly
  // once per EABR.
  const autoSaveInFlightRef = useRef(false);

  // Fires the instant an EABR (End of At-Bat Result) is reached — the user
  // never has to click a submit button. Takes the just-computed wizard
  // state explicitly (rather than reading component state) so it always
  // saves the outcome that was just clicked, not a stale value.
  const autoSave = (finalWizard: WizardState) => {
    if (!finalWizard.outcomeCategory || !finalWizard.outcomeType) return;
    if (autoSaveInFlightRef.current) return;
    autoSaveInFlightRef.current = true;

    createEntry.mutate(
      {
        data: {
          outcomeCategory: finalWizard.outcomeCategory,
          outcomeType: finalWizard.outcomeType,
          outcomeDetail: finalWizard.outcomeDetail,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Entry Logged",
            description: "At-bat outcome recorded automatically.",
          });
          resetForm();
          setAcknowledgedInning(undefined);
          queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetCurrentInningQueryKey() });
          autoSaveInFlightRef.current = false;
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to log entry.",
            variant: "destructive",
          });
          autoSaveInFlightRef.current = false;
        },
      },
    );
  };

  const recentEntry = entries?.[0];
  const scoreboardSlots = computeScoreboardSlots(entries, inning?.gameId);

  // Bumps the server-side game boundary (see startNewGame in psisStore.ts)
  // and resets every piece of local Tracker UI state, so the page looks
  // exactly like a brand-new game: wizard back to Outcome, notes cleared,
  // no stale "waiting to start next inning" flag, and the inning/outs/
  // delta/bases/completed-innings display (all derived from entries scoped
  // to the current gameId) reads as empty the moment the query refetches.
  const startNewGame = () => {
    startNewGameMutation.mutate(undefined, {
      onSuccess: () => {
        resetForm();
        setAcknowledgedInning(undefined);
        queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCurrentInningQueryKey() });
        toast({
          title: "New Game Started",
          description: "Tracker reset — inning 1, 0 outs, bases empty.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to start new game.",
          variant: "destructive",
        });
      },
    });
  };

  const waitingForNextInning = !!inning?.completed && acknowledgedInning === inning.inningNumber;
  // Players left on base and the final delta are both computed server-side
  // the instant the 3rd out is recorded, so the completed summary (incl.
  // base-state-derived LOB) can be shown immediately — no separate
  // confirmation step or manual question is needed.
  const showCompletedSummary = !!inning?.completed && !waitingForNextInning;
  const displayInningNumber = waitingForNextInning ? (inning?.inningNumber ?? 1) + 1 : inning?.inningNumber ?? 1;
  const displayOuts = waitingForNextInning ? 0 : inning?.outs ?? 0;
  const displayDelta = waitingForNextInning ? 0 : inning?.inningDelta ?? 0;
  const displayBaseState = waitingForNextInning ? undefined : inning?.baseState;

  const startNextInning = () => {
    if (inning) setAcknowledgedInning(inning.inningNumber);
  };

  const recentLogEntries =
    !inning || showCompletedSummary || waitingForNextInning
      ? []
      : (entries ?? []).filter(
          entry => entry.inningNumber === inning.inningNumber && (entry.gameId ?? 1) === (inning.gameId ?? 1),
        );

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="rounded-none border-t-4 border-t-primary">
          <CardHeader className="bg-muted/50 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="uppercase tracking-wider">Log At-Bat Outcome</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={startNewGame}
                disabled={startNewGameMutation.isPending}
                data-testid="button-new-game"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                New Game
              </Button>
            </div>
            {!inningLoading && (
              <div className="mt-3 space-y-2">
                <div
                  className="flex items-center divide-x border overflow-x-auto"
                  data-testid="game-status-panel"
                >
                  <div className="px-4 py-2 shrink-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Game Status</div>
                  </div>
                  <div className="px-4 py-2 text-center shrink-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Inning</div>
                    <div className="font-mono font-bold text-lg" data-testid="text-inning-number">
                      {displayInningNumber}
                    </div>
                  </div>
                  <div className="px-4 py-2 text-center shrink-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Outs</div>
                    <div className="flex items-center gap-1 font-mono font-bold text-lg" data-testid="text-inning-outs">
                      {displayOuts} / 3
                      <span className="flex gap-0.5 ml-1">
                        {[0, 1, 2].map(i => (
                          <Circle
                            key={i}
                            className={`w-2.5 h-2.5 ${i < displayOuts ? "fill-destructive text-destructive" : "text-muted-foreground/30"}`}
                          />
                        ))}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-2 text-center shrink-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Current Δ</div>
                    <div
                      className={`font-mono font-bold text-lg ${displayDelta > 0 ? "text-success" : displayDelta < 0 ? "text-destructive" : ""}`}
                      data-testid="text-inning-delta"
                    >
                      {displayDelta > 0 ? "+" : ""}
                      {displayDelta}
                    </div>
                  </div>
                  <div className="px-4 py-2 text-center shrink-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">LOB</div>
                    <BaseStateDisplay baseState={displayBaseState} />
                  </div>
                </div>
                <div className="border overflow-x-auto" data-testid="line-score-scoreboard">
                  <table className="w-full table-fixed border-collapse">
                    <colgroup>
                      <col style={{ width: "6.5rem" }} />
                      {scoreboardSlots.map(slot => (
                        <col key={slot.inningNumber} style={{ width: `calc((100% - 6.5rem) / ${SCOREBOARD_INNINGS})` }} />
                      ))}
                    </colgroup>
                    <tbody>
                      <tr className="border-b">
                        <th
                          scope="row"
                          className="border-r-2 border-success h-7 px-2 text-left align-middle text-[10px] uppercase tracking-wider text-muted-foreground font-semibold whitespace-nowrap"
                        >
                          EABR Delta
                        </th>
                        {scoreboardSlots.map(slot => (
                          <td
                            key={slot.inningNumber}
                            className={`border-l h-7 px-1 text-center align-middle font-mono font-bold text-sm ${
                              slot.completed
                                ? slot.delta > 0
                                  ? "text-success"
                                  : slot.delta < 0
                                    ? "text-destructive"
                                    : "text-foreground"
                                : "text-muted-foreground/30"
                            }`}
                            data-testid={`scoreboard-delta-${slot.inningNumber}`}
                          >
                            {slot.completed ? `${slot.delta > 0 ? "+" : ""}${slot.delta}` : ""}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <th
                          scope="row"
                          className="border-r-2 border-sky-500 h-7 px-2 text-left align-middle text-[10px] uppercase tracking-wider text-muted-foreground font-semibold whitespace-nowrap"
                        >
                          EABR Fraction
                        </th>
                        {scoreboardSlots.map(slot => (
                          <td
                            key={slot.inningNumber}
                            className="border-l h-7 px-1 text-center align-middle font-mono text-[10px] text-muted-foreground"
                            data-testid={`scoreboard-fraction-${slot.inningNumber}`}
                          >
                            {slot.completed ? `${slot.goodCount}/${slot.badCount}` : ""}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <th
                          scope="row"
                          className="border-r-2 border-purple-500 h-7 px-2 text-left align-middle text-[10px] uppercase tracking-wider text-muted-foreground font-semibold whitespace-nowrap bg-muted/40"
                        >
                          Inning Number
                        </th>
                        {scoreboardSlots.map(slot => (
                          <td
                            key={slot.inningNumber}
                            className="border-l h-7 px-1 text-center align-middle text-[10px] font-semibold text-muted-foreground bg-muted/40"
                            data-testid={`scoreboard-inning-${slot.inningNumber}`}
                          >
                            {slot.inningNumber}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {showCompletedSummary && inning ? (
              <div className="space-y-4" data-testid="inning-summary">
                <div className="flex items-center gap-2 text-success">
                  <PartyPopper className="w-5 h-5" />
                  <span className="font-bold uppercase tracking-wider">Inning {inning.inningNumber} Complete</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-sm p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">At-Bats</div>
                    <div className="font-mono font-bold text-xl" data-testid="summary-total-at-bats">
                      {inning.totalAtBats}
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-sm p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Defensive Outs</div>
                    <div className="font-mono font-bold text-xl">{inning.outs}</div>
                  </div>
                  <div className="bg-muted/50 rounded-sm p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Good</div>
                    <div className="font-mono font-bold text-xl text-success">{inning.goodCount}</div>
                  </div>
                  <div className="bg-muted/50 rounded-sm p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Bad</div>
                    <div className="font-mono font-bold text-xl text-destructive">{inning.badCount}</div>
                  </div>
                  <div className="bg-muted/50 rounded-sm p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Runs Scored</div>
                    <div className="font-mono font-bold text-xl" data-testid="summary-runs-scored">
                      {inning.runsScored}
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-sm p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Runners Left On Base</div>
                    <div className="font-mono font-bold text-xl" data-testid="summary-players-left-on-base">
                      {inning.playersLeftOnBase}
                    </div>
                  </div>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-sm p-4 flex items-center justify-between">
                  <span className="uppercase tracking-wider text-xs text-muted-foreground font-semibold">Final Inning Delta</span>
                  <span
                    className={`font-mono font-bold text-2xl ${inning.inningDelta > 0 ? "text-success" : inning.inningDelta < 0 ? "text-destructive" : ""}`}
                    data-testid="summary-inning-delta"
                  >
                    {inning.inningDelta > 0 ? "+" : ""}
                    {inning.inningDelta}
                  </span>
                </div>

                <Button
                  type="button"
                  onClick={startNextInning}
                  className="w-full rounded-none font-bold uppercase tracking-wider"
                  data-testid="btn-start-next-inning"
                >
                  Start Next Inning
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap" data-testid="outcome-breadcrumb">
                    {breadcrumb.map((crumb, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        {i > 0 && <span className="text-muted-foreground">›</span>}
                        <span
                          className={`text-xs uppercase tracking-wider font-semibold ${
                            i === breadcrumb.length - 1 ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {crumb}
                        </span>
                      </span>
                    ))}
                    {isEabrReached && (
                      <Badge className="ml-1 rounded-sm bg-success/10 text-success border-success" data-testid="badge-eabr-reached">
                        EABR Reached
                      </Badge>
                    )}
                  </div>
                  {wizard.started && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={goBack}
                        className="rounded-sm"
                        data-testid="btn-outcome-back"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                        Back
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetForm}
                        className="rounded-sm"
                        data-testid="btn-outcome-reset"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Reset
                      </Button>
                    </div>
                  )}
                </div>

                {!wizard.started && (
                  <button
                    type="button"
                    onClick={startOutcome}
                    data-testid="btn-start-outcome"
                    className="w-full border-2 border-dashed rounded-sm py-8 font-bold uppercase tracking-wider text-lg transition-colors border-border hover:border-primary/50 hover:bg-primary/5"
                  >
                    Outcome
                  </button>
                )}

                {wizard.started && (
                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      placeholder="Any mechanical or situational observations..."
                      className="resize-none rounded-sm"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      data-testid="input-notes"
                    />
                    <p className="text-xs text-muted-foreground">
                      Add notes before selecting the outcome — the at-bat saves automatically the moment an outcome is reached.
                    </p>
                  </div>
                )}

                {wizard.started && !wizard.outcomeCategory && (
                  <div className="space-y-2">
                    <Label className="uppercase tracking-wider text-xs text-muted-foreground">Defense or Offense?</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => selectCategory("defense")}
                        data-testid="btn-category-defense"
                        className="flex items-center justify-center gap-2 border-2 rounded-sm py-4 font-bold uppercase tracking-wider transition-colors border-border hover:border-success/50 hover:bg-success/5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Defense
                      </button>
                      <button
                        type="button"
                        onClick={() => selectCategory("offense")}
                        data-testid="btn-category-offense"
                        className="flex items-center justify-center gap-2 border-2 rounded-sm py-4 font-bold uppercase tracking-wider transition-colors border-border hover:border-destructive/50 hover:bg-destructive/5"
                      >
                        <Swords className="w-4 h-4" />
                        Offense
                      </button>
                    </div>
                  </div>
                )}

                {wizard.outcomeCategory && !wizard.outcomeType && (
                  <div className="space-y-2">
                    <Label className="uppercase tracking-wider text-xs text-muted-foreground">
                      {wizard.outcomeCategory === "defense" ? "Defensive" : "Offensive"} Outcome
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      {outcomesForCategory(wizard.outcomeCategory).map(o => (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => selectOutcomeType(o.value)}
                          data-testid={`btn-outcome-type-${o.value}`}
                          className="border-2 rounded-sm py-4 font-bold uppercase tracking-wider transition-colors border-border hover:border-primary/50 hover:bg-primary/5"
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {wizard.outcomeType && detailOptions && !wizard.outcomeDetail && (
                  <div className="space-y-2">
                    <Label className="uppercase tracking-wider text-xs text-muted-foreground">
                      {wizard.outcomeType === "fly_out"
                        ? "Where Was The Catch Made?"
                        : wizard.outcomeType === "ground_out"
                          ? "Play Result?"
                          : "Hit Type?"}
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      {detailOptions.map(d => (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => selectOutcomeDetail(d.value)}
                          data-testid={`btn-detail-${d.value}`}
                          className="border-2 rounded-sm py-3 font-bold uppercase tracking-wider transition-colors border-border hover:border-primary/50 hover:bg-primary/5"
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isEabrReached && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-auto-saving">
                      {createEntry.isPending ? "Saving at-bat..." : "Saved."}
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {recentEntry && (
          <Alert className={recentEntry.resultCategory === "good" ? "border-success bg-success/5" : "border-destructive bg-destructive/5"}>
            {recentEntry.resultCategory === "good" ? (
              <CheckCircle2 className="w-4 h-4 text-success" />
            ) : (
              <AlertCircle className="w-4 h-4 text-destructive" />
            )}
            <AlertTitle className="uppercase tracking-wider font-bold">
              Last Entry{recentEntry.pitchSequence ? `: ${recentEntry.pitchSequence}` : ""}
            </AlertTitle>
            <AlertDescription className="font-mono text-sm mt-2">
              <div className="flex flex-wrap gap-4">
                <span className="capitalize">{describeOutcome(recentEntry)}</span>
                <span className={recentEntry.delta > 0 ? "text-success font-bold" : recentEntry.delta < 0 ? "text-destructive font-bold" : ""}>
                  Delta: {recentEntry.delta > 0 ? "+" : ""}
                  {recentEntry.delta}
                </span>
                {recentEntry.runsScored !== undefined && <span>Runs: {recentEntry.runsScored}</span>}
                {recentEntry.playersLeftOnBase !== undefined && <span>LOB: {recentEntry.playersLeftOnBase}</span>}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div>
        <Card className="rounded-none border-0 shadow-none bg-transparent">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="uppercase tracking-wider text-sm text-muted-foreground">Recent Log</CardTitle>
            <Separator className="mt-2" />
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            {entriesLoading ? (
              Array(5)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-sm" />)
            ) : recentLogEntries.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8" data-testid="recent-log-empty">
                No at-bats logged for this inning yet.
              </div>
            ) : (
              recentLogEntries.slice(0, 8).map(entry => (
                <div
                  key={entry.id}
                  className="flex justify-between items-center bg-card border p-3 rounded-sm text-sm"
                  data-testid={`log-entry-${entry.id}`}
                >
                  <div>
                    <div className="font-mono font-bold uppercase">
                      {entry.pitchSequence || describeOutcome(entry)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      {entry.pitcherHandedness && entry.batterHandedness && (
                        <>
                          <span className="font-semibold">
                            {entry.pitcherHandedness}v{entry.batterHandedness}
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span className="capitalize">{describeOutcome(entry)}</span>
                      {entry.inningNumber !== undefined && (
                        <>
                          <span>•</span>
                          <span>Inn {entry.inningNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={entry.resultCategory === "good" ? "default" : "destructive"}
                      className="rounded-sm px-1.5 py-0 text-[10px] uppercase tracking-wider bg-opacity-10"
                    >
                      {entry.resultCategory}
                    </Badge>
                    <div className="font-mono text-xs mt-1 text-muted-foreground">
                      Δ {entry.delta > 0 ? "+" : ""}
                      {entry.delta}
                      {entry.outsAdded ? ` · ${entry.outsAdded} out${entry.outsAdded > 1 ? "s" : ""}` : ""}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
