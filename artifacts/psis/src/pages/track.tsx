import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateEntry,
  useUpdateEntry,
  useListEntries,
  useGetCurrentInning,
  getListEntriesQueryKey,
  getGetDashboardQueryKey,
  getGetCurrentInningQueryKey,
} from "@workspace/api-client-react";
import type { OutcomeCategory, OutcomeType, OutcomeDetail } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, ShieldCheck, Swords, Circle, PartyPopper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { describeOutcome, outcomesForCategory } from "@/lib/outcome";

type WizardState = {
  outcomeCategory?: OutcomeCategory;
  outcomeType?: OutcomeType;
  outcomeDetail?: OutcomeDetail;
  runsScored?: number;
};

const emptyWizard: WizardState = {};

export default function Track() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries, isLoading: entriesLoading } = useListEntries();
  const { data: inning, isLoading: inningLoading } = useGetCurrentInning();
  const createEntry = useCreateEntry();
  const updateEntry = useUpdateEntry();

  const [notes, setNotes] = useState("");
  const [wizard, setWizard] = useState<WizardState>(emptyWizard);
  const [acknowledgedInning, setAcknowledgedInning] = useState<number | undefined>(undefined);
  const [lobAwaitingCount, setLobAwaitingCount] = useState(false);

  const showExtraBaseHitDetail = wizard.outcomeCategory === "offense" && wizard.outcomeType === "extra_base_hit";
  const showRunsScoredDetail = wizard.outcomeCategory === "offense" && wizard.outcomeType === "run_scored";

  const selectCategory = (category: OutcomeCategory) => {
    setWizard({ outcomeCategory: category });
  };

  const selectOutcomeType = (type: OutcomeType) => {
    setWizard(prev => ({
      outcomeCategory: prev.outcomeCategory,
      outcomeType: type,
    }));
  };

  const selectOutcomeDetail = (detail: OutcomeDetail) => {
    setWizard(prev => ({ ...prev, outcomeDetail: detail }));
  };

  const selectRunsScored = (runs: number) => {
    setWizard(prev => ({ ...prev, runsScored: runs }));
  };

  const isWizardComplete =
    !!wizard.outcomeCategory &&
    !!wizard.outcomeType &&
    (!showExtraBaseHitDetail || !!wizard.outcomeDetail) &&
    (!showRunsScoredDetail || wizard.runsScored !== undefined);

  const isFormComplete = isWizardComplete;

  const resetForm = () => {
    setNotes("");
    setWizard(emptyWizard);
  };

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
          runsScored: wizard.runsScored,
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
          setLobAwaitingCount(false);
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

  const waitingForNextInning = !!inning?.completed && acknowledgedInning === inning.inningNumber;
  const showCompletedSummary = !!inning?.completed && !waitingForNextInning;
  const displayInningNumber = waitingForNextInning ? (inning?.inningNumber ?? 1) + 1 : inning?.inningNumber ?? 1;
  const displayOuts = waitingForNextInning ? 0 : inning?.outs ?? 0;
  const displayDelta = waitingForNextInning ? 0 : inning?.inningDelta ?? 0;

  const lastAtBat = inning?.atBats[inning.atBats.length - 1];
  const needsLobAnswer = showCompletedSummary && !!lastAtBat && lastAtBat.playersLeftOnBase === undefined;

  const submitLob = (count: number) => {
    if (!lastAtBat) return;
    updateEntry.mutate(
      { id: lastAtBat.id, data: { playersLeftOnBase: count } },
      {
        onSuccess: () => {
          setLobAwaitingCount(false);
          queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetCurrentInningQueryKey() });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to record runners left on base.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const startNextInning = () => {
    if (inning) setAcknowledgedInning(inning.inningNumber);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="rounded-none border-t-4 border-t-primary">
          <CardHeader className="bg-muted/50 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="uppercase tracking-wider">Log At-Bat Outcome</CardTitle>
                <CardDescription>Fast outcome entry — no pitcher, batter, or pitch sequence details required.</CardDescription>
              </div>
              {!inningLoading && (
                <div
                  className="flex items-center gap-4 bg-card border rounded-sm px-4 py-2"
                  data-testid="inning-status-bar"
                >
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
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Inning Δ</div>
                    <div
                      className={`font-mono font-bold text-lg ${displayDelta > 0 ? "text-success" : displayDelta < 0 ? "text-destructive" : ""}`}
                      data-testid="text-inning-delta"
                    >
                      {displayDelta > 0 ? "+" : ""}
                      {displayDelta}
                    </div>
                  </div>
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
                      {needsLobAnswer ? "—" : inning.playersLeftOnBase}
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

                {needsLobAnswer ? (
                  <div className="border-2 border-primary/30 rounded-sm p-4 space-y-3" data-testid="lob-question">
                    <Label className="uppercase tracking-wider text-xs text-muted-foreground">
                      Were there any runners left on base?
                    </Label>
                    {!lobAwaitingCount ? (
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => submitLob(0)}
                          disabled={updateEntry.isPending}
                          data-testid="btn-lob-inning-no"
                          className="border-2 rounded-sm py-3 font-bold uppercase tracking-wider transition-colors border-border hover:border-primary/50 disabled:opacity-50"
                        >
                          No
                        </button>
                        <button
                          type="button"
                          onClick={() => setLobAwaitingCount(true)}
                          disabled={updateEntry.isPending}
                          data-testid="btn-lob-inning-yes"
                          className="border-2 rounded-sm py-3 font-bold uppercase tracking-wider transition-colors border-border hover:border-primary/50 disabled:opacity-50"
                        >
                          Yes
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">How many runners were left on base?</Label>
                        <div className="grid grid-cols-3 gap-4">
                          {[1, 2, 3].map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => submitLob(n)}
                              disabled={updateEntry.isPending}
                              data-testid={`btn-lob-count-${n}`}
                              className="border-2 rounded-sm py-3 font-bold uppercase tracking-wider transition-colors border-border hover:border-primary/50 disabled:opacity-50"
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={startNextInning}
                    className="w-full rounded-none font-bold uppercase tracking-wider"
                    data-testid="btn-start-next-inning"
                  >
                    Start Next Inning
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <Label className="uppercase tracking-wider text-xs text-muted-foreground">Step 1 — Outcome Category</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => selectCategory("defense")}
                      data-testid="btn-category-defense"
                      className={`flex items-center justify-center gap-2 border-2 rounded-sm py-4 font-bold uppercase tracking-wider transition-colors ${
                        wizard.outcomeCategory === "defense"
                          ? "border-success bg-success/10 text-success"
                          : "border-border hover:border-success/50"
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Defense
                    </button>
                    <button
                      type="button"
                      onClick={() => selectCategory("offense")}
                      data-testid="btn-category-offense"
                      className={`flex items-center justify-center gap-2 border-2 rounded-sm py-4 font-bold uppercase tracking-wider transition-colors ${
                        wizard.outcomeCategory === "offense"
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : "border-border hover:border-destructive/50"
                      }`}
                    >
                      <Swords className="w-4 h-4" />
                      Offense
                    </button>
                  </div>
                </div>

                {wizard.outcomeCategory && (
                  <div className="space-y-2">
                    <Label className="uppercase tracking-wider text-xs text-muted-foreground">
                      Step 2 — {wizard.outcomeCategory === "defense" ? "Defensive" : "Offensive"} Outcome
                    </Label>
                    <Select
                      onValueChange={v => selectOutcomeType(v as OutcomeType)}
                      value={wizard.outcomeType}
                    >
                      <SelectTrigger data-testid="select-outcome-type" className="rounded-sm">
                        <SelectValue placeholder="Select specific outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        {outcomesForCategory(wizard.outcomeCategory).map(o => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {showExtraBaseHitDetail && (
                  <div className="space-y-2">
                    <Label className="uppercase tracking-wider text-xs text-muted-foreground">Step 3 — Extra Base Hit Detail</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => selectOutcomeDetail("double")}
                        data-testid="btn-detail-double"
                        className={`border-2 rounded-sm py-3 font-bold uppercase tracking-wider transition-colors ${
                          wizard.outcomeDetail === "double" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                        }`}
                      >
                        Double
                      </button>
                      <button
                        type="button"
                        onClick={() => selectOutcomeDetail("triple")}
                        data-testid="btn-detail-triple"
                        className={`border-2 rounded-sm py-3 font-bold uppercase tracking-wider transition-colors ${
                          wizard.outcomeDetail === "triple" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                        }`}
                      >
                        Triple
                      </button>
                    </div>
                  </div>
                )}

                {showRunsScoredDetail && (
                  <div className="space-y-2">
                    <Label className="uppercase tracking-wider text-xs text-muted-foreground">Step 3 — How Many Runs Scored?</Label>
                    <div className="grid grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => selectRunsScored(n)}
                          data-testid={`btn-runs-scored-${n}`}
                          className={`border-2 rounded-sm py-3 font-bold uppercase tracking-wider transition-colors ${
                            wizard.runsScored === n ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
            ) : entries?.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">No entries logged yet.</div>
            ) : (
              entries?.slice(0, 8).map(entry => (
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
