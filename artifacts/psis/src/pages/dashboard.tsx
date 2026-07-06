import { useState } from "react";
import { useGetDashboard, useListSessions } from "@workspace/api-client-react";
import type { Session } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Target, CheckCircle2, XCircle, ActivitySquare, FileDown, FileJson, FileText, ClipboardList, ChevronRight } from "lucide-react";
import { describeOutcome } from "@/lib/outcome";

function SessionListItem({ session, onClick }: { session: Session; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left border-t first:border-t-0 p-4 hover:bg-muted/40 transition-colors flex items-center justify-between gap-4"
      data-testid={`session-item-${session.sessionId}`}
    >
      <div className="space-y-1">
        <div className="font-mono font-bold text-sm">
          Pitching Session — {format(new Date(session.endedAt), "yyyy-MM-dd HH:mm")}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
          <span>Innings: {session.inningsCompleted}</span>
          <span className={session.sessionEabrDelta > 0 ? "text-success" : session.sessionEabrDelta < 0 ? "text-destructive" : ""}>
            Delta: {session.sessionEabrDelta > 0 ? "+" : ""}{session.sessionEabrDelta}
          </span>
          <span>
            Fraction: {session.totalGoodUnits}/{session.totalBadUnits}
          </span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}

function SessionDetailDialog({ session, onOpenChange }: { session: Session | undefined; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={!!session} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-none" data-testid="session-detail-dialog">
        {session && (
          <>
            <DialogHeader>
              <DialogTitle className="uppercase tracking-wider">
                Pitching Session — {format(new Date(session.endedAt), "yyyy-MM-dd HH:mm")}
              </DialogTitle>
              <DialogDescription>
                {session.inningsCompleted} inning{session.inningsCompleted === 1 ? "" : "s"} completed
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-muted/50 rounded-sm p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">EABR Delta</div>
                <div
                  className={`font-mono font-bold text-xl ${session.sessionEabrDelta > 0 ? "text-success" : session.sessionEabrDelta < 0 ? "text-destructive" : ""}`}
                  data-testid="session-detail-delta"
                >
                  {session.sessionEabrDelta > 0 ? "+" : ""}
                  {session.sessionEabrDelta}
                </div>
              </div>
              <div className="bg-muted/50 rounded-sm p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">EABR Fraction</div>
                <div className="font-mono font-bold text-xl" data-testid="session-detail-fraction">
                  {session.totalGoodUnits}/{session.totalBadUnits}
                </div>
              </div>
              <div className="bg-muted/50 rounded-sm p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Outs Recorded</div>
                <div className="font-mono font-bold text-xl">{session.totalOutsRecorded}</div>
              </div>
              <div className="bg-muted/50 rounded-sm p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total LOB</div>
                <div className="font-mono font-bold text-xl">{session.totalLOB}</div>
              </div>
              <div className="bg-muted/50 rounded-sm p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Hits Allowed</div>
                <div className="font-mono font-bold text-xl">{session.totalHitsAllowed}</div>
              </div>
              <div className="bg-muted/50 rounded-sm p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Walks Allowed</div>
                <div className="font-mono font-bold text-xl">{session.totalWalksAllowed}</div>
              </div>
              <div className="bg-muted/50 rounded-sm p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">XBH Allowed</div>
                <div className="font-mono font-bold text-xl">{session.totalExtraBaseHitsAllowed}</div>
              </div>
              <div className="bg-muted/50 rounded-sm p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Home Runs Allowed</div>
                <div className="font-mono font-bold text-xl">{session.totalHomeRunsAllowed}</div>
              </div>
              <div className="bg-muted/50 rounded-sm p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">RBI Allowed</div>
                <div className="font-mono font-bold text-xl">{session.totalRBIAllowed}</div>
              </div>
              <div className="bg-muted/50 rounded-sm p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Runs Allowed</div>
                <div className="font-mono font-bold text-xl">{session.totalRunsAllowed}</div>
              </div>
              <div className="bg-muted/50 rounded-sm p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Strikeouts</div>
                <div className="font-mono font-bold text-xl">{session.totalStrikeouts}</div>
              </div>
              <div className="bg-muted/50 rounded-sm p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Fly / Ground Outs</div>
                <div className="font-mono font-bold text-xl">
                  {session.totalFlyOuts} / {session.totalGroundOuts}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Inning-by-Inning Results
              </h3>
              <div className="border rounded-sm divide-y">
                {session.inningSummaries.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground text-center">No completed innings</div>
                ) : (
                  session.inningSummaries.map(inning => (
                    <div
                      key={inning.inningNumber}
                      className="p-3 flex items-center justify-between gap-4 text-sm"
                      data-testid={`session-inning-${inning.inningNumber}`}
                    >
                      <span className="font-mono font-bold">Inning {inning.inningNumber}</span>
                      <span className="font-mono text-muted-foreground">
                        {inning.goodCount}/{inning.badCount} EABR
                      </span>
                      <span className={`font-mono font-bold ${inning.inningDelta > 0 ? "text-success" : inning.inningDelta < 0 ? "text-destructive" : ""}`}>
                        {inning.inningDelta > 0 ? "+" : ""}
                        {inning.inningDelta}
                      </span>
                      <span className="font-mono text-muted-foreground text-xs">LOB: {inning.playersLeftOnBase}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                EABR Records / At-Bat Entries
              </h3>
              <div className="border rounded-sm divide-y max-h-64 overflow-y-auto">
                {session.atBats.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground text-center">No at-bats logged</div>
                ) : (
                  session.atBats.map(entry => (
                    <div key={entry.id} className="p-3 flex items-center justify-between gap-3 text-sm" data-testid={`session-atbat-${entry.id}`}>
                      <span className="font-mono text-xs text-muted-foreground shrink-0">
                        {format(new Date(entry.createdAt), "HH:mm")}
                      </span>
                      <Badge
                        variant={entry.resultCategory === "good" ? "default" : "destructive"}
                        className="rounded-sm px-1.5 py-0 text-[10px] uppercase tracking-wider shrink-0"
                      >
                        {entry.resultCategory}
                      </Badge>
                      <span className="flex-1 capitalize">{describeOutcome(entry)}</span>
                      <span className="font-mono font-bold text-xs shrink-0">
                        <span className={entry.delta > 0 ? "text-success" : entry.delta < 0 ? "text-destructive" : ""}>
                          {entry.delta > 0 ? "+" : ""}
                          {entry.delta}
                        </span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard();
  const { data: sessions, isLoading: sessionsLoading } = useListSessions();
  const [selectedSession, setSelectedSession] = useState<Session | undefined>(undefined);

  const sortedSessions = [...(sessions ?? [])].sort(
    (a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime(),
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-sm" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-sm" />
      </div>
    );
  }

  if (!dashboard) {
    return <div className="text-center py-12 text-muted-foreground">Failed to load dashboard data.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-none border-t-2 border-t-primary">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ActivitySquare className="w-4 h-4" />
              Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-mono font-bold">{dashboard.entryCount}</div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-t-2 border-t-success">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Total Good
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-mono font-bold text-success">{dashboard.totalGood}</div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-t-2 border-t-destructive">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Total Bad
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-mono font-bold text-destructive">{dashboard.totalBad}</div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-t-2 border-t-primary">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4" />
              Avg Delta
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-mono font-bold">
              {dashboard.averageDelta > 0 ? '+' : ''}{dashboard.averageDelta.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="uppercase tracking-wider text-sm flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Pitching Sessions
          </CardTitle>
          <CardDescription>Saved sessions from "End Session" — click one to review its full breakdown.</CardDescription>
        </CardHeader>
        <CardContent className="p-0" data-testid="pitching-sessions-list">
          {sessionsLoading ? (
            <div className="p-4 space-y-2">
              <Skeleton className="h-14 w-full rounded-sm" />
              <Skeleton className="h-14 w-full rounded-sm" />
            </div>
          ) : sortedSessions.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No pitching sessions saved yet. End a session from the Tracker to save one here.
            </div>
          ) : (
            sortedSessions.map(session => (
              <SessionListItem key={session.sessionId} session={session} onClick={() => setSelectedSession(session)} />
            ))
          )}
        </CardContent>
      </Card>

      <SessionDetailDialog session={selectedSession} onOpenChange={open => !open && setSelectedSession(undefined)} />

      <Card className="rounded-none">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="uppercase tracking-wider text-sm flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Validation Reports
          </CardTitle>
          <CardDescription>
            Scenario-based logic tests for PSIS's game rules (outs, runs, LOB, good/bad EABR, fraction, inning delta, completed innings, reset-game-state), run against the actual game-logic module.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-sm" asChild>
            <a href={`${import.meta.env.BASE_URL}reports/PSIS_Test_Report.md`} download>
              <FileText className="w-4 h-4 mr-2" />
              Download Test Report (.md)
            </a>
          </Button>
          <Button variant="outline" className="rounded-sm" asChild>
            <a href={`${import.meta.env.BASE_URL}reports/PSIS_Test_Report.json`} download>
              <FileJson className="w-4 h-4 mr-2" />
              Download Test Report (.json)
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
