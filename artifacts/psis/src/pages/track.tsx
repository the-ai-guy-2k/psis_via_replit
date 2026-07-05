import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateEntry,
  useListEntries,
  useGetCurrentInning,
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
import { CheckCircle2, AlertCircle, ShieldCheck, Swords, Circle, PartyPopper, ChevronLeft, RotateCcw } from "lucide-react";
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

type CompletedInningTile = { inningNumber: number; delta: number; goodCount: number; totalAtBats: number };

/**
 * Completed-inning scoreboard tiles for the Game Status Panel, derived
 * purely client-side from the full entries list — an inning counts as
 * "completed" once its at-bats' outsAdded sum to 3, mirroring the server's
 * own completion rule (see computeInningState in psisStore.ts) without
 * adding a new API endpoint.
 */
function computeCompletedInningTiles(
  entries: { inningNumber?: number; delta: number; outsAdded?: number; goodCount: number }[] | undefined,
): CompletedInningTile[] {
  if (!entries) return [];
  const byInning = new Map<number, { delta: number; outs: number; goodCount: number; totalAtBats: number }>();
  for (const entry of entries) {
    if (entry.inningNumber === undefined) continue;
    const current = byInning.get(entry.inningNumber) ?? { delta: 0, outs: 0, goodCount: 0, totalAtBats: 0 };
    current.delta += entry.delta;
    current.outs += entry.outsAdded ?? 0;
    current.goodCount += entry.goodCount;
    current.totalAtBats += 1;
    byInning.set(entry.inningNumber, current);
  }
  return Array.from(byInning.entries())
    .filter(([, v]) => v.outs >= 3)
    .map(([inningNumber, v]) => ({ inningNumber, delta: v.delta, goodCount: v.goodCount, totalAtBats: v.totalAtBats }))
    .sort((a, b) => a.inningNumber - b.inningNumber);
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
    setWizard(prev => ({
      started: true,
      outcomeCategory: prev.outcomeCategory,
      outcomeType: type,
    }));
  };

  const selectOutcomeDetail = (detail: OutcomeDetail) => {
    setWizard(prev => ({ ...prev, outcomeDetail: detail }));
  };

  // Reached only once every required click in the path has been made — the
  // "EABR" (End of At-Bat Result). Nothing is ever saved before this.
  const isEabrReached =
    !!wizard.outcomeCategory && !!wizard.outcomeType && (!needsDetail || !!wizard.outcomeDetail);

  const isFormComplete = isEabrReached;

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

  const onSubmit = () => {
    if (!isFormComplete || !wizard.outcomeCategory || !wizard.outcomeType) {
      return;
    }

    createEntry.mutate(
      {
        data: {
          outcomeCategory: wizard.outcomeCategory,
          outcomeType: wizard.outcomeType,
          outcomeDetail: wizard.outcomeDetail,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Entry Logged",
            description: "At-bat outcome recorded successfully.",
          });
          resetForm();
          setAcknowledgedInning(undefined);
          queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetCurrentInningQueryKey() });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to log entry.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const recentEntry = entries?.[0];
  const completedInningTiles = computeCompletedInningTiles(entries);

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
      : (entries ?? []).filter(entry => entry.inningNumber === inning.inningNumber);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="rounded-none border-t-4 border-t-primary">
          <CardHeader className="bg-muted/50 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="uppercase tracking-wider">Log At-Bat Outcome</CardTitle>
              {!inningLoading && (
                <div
                  className="flex items-start gap-4 bg-card border rounded-sm px-4 py-3 flex-wrap"
                  data-testid="game-status-panel"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Game Status</div>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-10 hidden sm:block" />
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Inning</div>
                      <div className="font-mono font-bold text-lg" data-testid="text-inning-number">
                        {displayInningNumber}
                      </div>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div className="text-center">
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
                    <Separator orientation="vertical" className="h-8" />
                    <div className="text-center">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Current Δ</div>
                      <div
                        className={`font-mono font-bold text-lg ${displayDelta > 0 ? "text-success" : displayDelta < 0 ? "text-destructive" : ""}`}
                        data-testid="text-inning-delta"
                      >
                        {displayDelta > 0 ? "+" : ""}
                        {displayDelta}
                      </div>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div className="text-center">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Bases</div>
                      <BaseStateDisplay baseState={displayBaseState} />
                    </div>
                  </div>
                  {completedInningTiles.length > 0 && (
                    <>
                      <Separator orientation="vertical" className="h-10 hidden sm:block" />
                      <div className="text-center sm:text-left" data-testid="completed-inning-deltas">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Completed</div>
                        <div className="flex flex-wrap gap-2 max-w-sm">
                          {completedInningTiles.map(({ inningNumber, delta, goodCount, totalAtBats }) => (
                            <div
                              key={inningNumber}
                              className="flex flex-col items-center border rounded-sm px-2 py-1 bg-muted/30 leading-tight"
                              data-testid={`completed-inning-tile-${inningNumber}`}
                            >
                              <span
                                className={`font-mono font-bold text-sm ${delta > 0 ? "text-success" : delta < 0 ? "text-destructive" : ""}`}
                                data-testid={`completed-inning-delta-${inningNumber}`}
                              >
                                {delta > 0 ? "+" : ""}
                                {delta}
                              </span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {goodCount}/{totalAtBats}
                              </span>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                Inn {inningNumber}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
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

                    <div className="space-y-2">
                      <Label>Notes (Optional)</Label>
                      <Textarea
                        placeholder="Any mechanical or situational observations..."
                        className="resize-none rounded-sm"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        data-testid="input-notes"
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={onSubmit}
                      className="w-full rounded-none font-bold uppercase tracking-wider"
                      disabled={!isFormComplete || createEntry.isPending}
                      data-testid="btn-submit-entry"
                    >
                      {createEntry.isPending ? "Logging..." : "Log PA Entry"}
                    </Button>
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
