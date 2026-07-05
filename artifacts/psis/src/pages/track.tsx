import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateEntry,
  useListEntries,
  getListEntriesQueryKey,
  getGetDashboardQueryKey,
} from "@workspace/api-client-react";
import type { OutcomeCategory, OutcomeType, OutcomeDetail } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, ShieldCheck, Swords } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { describeOutcome, outcomesForCategory, outcomeAsksLeftOnBase } from "@/lib/outcome";

type WizardState = {
  outcomeCategory?: OutcomeCategory;
  outcomeType?: OutcomeType;
  outcomeDetail?: OutcomeDetail;
  hasPlayersLeftOnBase?: boolean;
  playersLeftOnBase?: number;
};

const emptyWizard: WizardState = {};

export default function Track() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries, isLoading: entriesLoading } = useListEntries();
  const createEntry = useCreateEntry();

  const [notes, setNotes] = useState("");
  const [wizard, setWizard] = useState<WizardState>(emptyWizard);

  const showLeftOnBaseQuestion = outcomeAsksLeftOnBase(wizard.outcomeCategory, wizard.outcomeType);
  const showExtraBaseHitDetail = wizard.outcomeCategory === "offense" && wizard.outcomeType === "extra_base_hit";

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

  const selectHasPlayersLeftOnBase = (hasPlayers: boolean) => {
    setWizard(prev => ({
      ...prev,
      hasPlayersLeftOnBase: hasPlayers,
      playersLeftOnBase: hasPlayers ? prev.playersLeftOnBase : undefined,
    }));
  };

  const isWizardComplete =
    !!wizard.outcomeCategory &&
    !!wizard.outcomeType &&
    (!showExtraBaseHitDetail || !!wizard.outcomeDetail) &&
    (!showLeftOnBaseQuestion ||
      wizard.hasPlayersLeftOnBase === false ||
      (wizard.hasPlayersLeftOnBase === true && wizard.playersLeftOnBase !== undefined && wizard.playersLeftOnBase >= 0));

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
          playersLeftOnBase: wizard.hasPlayersLeftOnBase ? wizard.playersLeftOnBase : undefined,
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
          queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
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

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="rounded-none border-t-4 border-t-primary">
          <CardHeader className="bg-muted/50 pb-4">
            <CardTitle className="uppercase tracking-wider">Log At-Bat Outcome</CardTitle>
            <CardDescription>Fast outcome entry — no pitcher, batter, or pitch sequence details required.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
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

            {showLeftOnBaseQuestion && (
              <div className="space-y-3">
                <Label className="uppercase tracking-wider text-xs text-muted-foreground">Players left on base?</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => selectHasPlayersLeftOnBase(true)}
                    data-testid="btn-lob-yes"
                    className={`border-2 rounded-sm py-3 font-bold uppercase tracking-wider transition-colors ${
                      wizard.hasPlayersLeftOnBase === true ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => selectHasPlayersLeftOnBase(false)}
                    data-testid="btn-lob-no"
                    className={`border-2 rounded-sm py-3 font-bold uppercase tracking-wider transition-colors ${
                      wizard.hasPlayersLeftOnBase === false ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    No
                  </button>
                </div>
                {wizard.hasPlayersLeftOnBase === true && (
                  <div className="space-y-2 pt-1">
                    <Label>How many?</Label>
                    <Input
                      type="number"
                      min={0}
                      max={3}
                      className="font-mono rounded-sm w-32"
                      value={wizard.playersLeftOnBase ?? ""}
                      onChange={e =>
                        setWizard(prev => ({
                          ...prev,
                          playersLeftOnBase: e.target.value === "" ? undefined : Number(e.target.value),
                        }))
                      }
                      data-testid="input-players-left-on-base"
                    />
                  </div>
                )}
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
