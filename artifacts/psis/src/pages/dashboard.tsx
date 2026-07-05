import { useGetDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Target, CheckCircle2, XCircle, ActivitySquare } from "lucide-react";
import { describeOutcome } from "@/lib/outcome";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-sm" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full rounded-sm" />
          <Skeleton className="h-64 w-full rounded-sm" />
        </div>
        <Skeleton className="h-96 w-full rounded-sm" />
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

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="rounded-none">
          <CardHeader className="bg-muted/30 pb-4 border-b">
            <CardTitle className="uppercase tracking-wider text-sm">Top Sequences</CardTitle>
            <CardDescription>Highest average delta</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-xs">SEQ</TableHead>
                  <TableHead className="text-right font-mono text-xs">COUNT</TableHead>
                  <TableHead className="text-right font-mono text-xs">AVG Δ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.bestSequences.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground h-24">No data</TableCell>
                  </TableRow>
                ) : (
                  dashboard.bestSequences.map(seq => (
                    <TableRow key={seq.pitchSequence}>
                      <TableCell className="font-mono font-bold uppercase">{seq.pitchSequence}</TableCell>
                      <TableCell className="text-right font-mono">{seq.occurrences}</TableCell>
                      <TableCell className="text-right font-mono text-success font-bold">
                        {seq.averageDelta > 0 ? '+' : ''}{seq.averageDelta.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader className="bg-muted/30 pb-4 border-b">
            <CardTitle className="uppercase tracking-wider text-sm">Worst Sequences</CardTitle>
            <CardDescription>Lowest average delta</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-xs">SEQ</TableHead>
                  <TableHead className="text-right font-mono text-xs">COUNT</TableHead>
                  <TableHead className="text-right font-mono text-xs">AVG Δ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.worstSequences.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground h-24">No data</TableCell>
                  </TableRow>
                ) : (
                  dashboard.worstSequences.map(seq => (
                    <TableRow key={seq.pitchSequence}>
                      <TableCell className="font-mono font-bold uppercase">{seq.pitchSequence}</TableCell>
                      <TableCell className="text-right font-mono">{seq.occurrences}</TableCell>
                      <TableCell className="text-right font-mono text-destructive font-bold">
                        {seq.averageDelta.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="uppercase tracking-wider text-sm">Recent Entries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono text-xs">TIME</TableHead>
                <TableHead className="font-mono text-xs">M/U</TableHead>
                <TableHead className="font-mono text-xs">SEQUENCE</TableHead>
                <TableHead className="font-mono text-xs">RESULT</TableHead>
                <TableHead className="text-right font-mono text-xs">Δ</TableHead>
                <TableHead className="text-right font-mono text-xs">K</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard.recentEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground h-24">No entries logged</TableCell>
                </TableRow>
              ) : (
                dashboard.recentEntries.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {format(new Date(entry.createdAt), "HH:mm")}
                    </TableCell>
                    <TableCell className="font-mono font-bold">
                      {entry.pitcherHandedness && entry.batterHandedness
                        ? `${entry.pitcherHandedness}v${entry.batterHandedness}`
                        : "—"}
                    </TableCell>
                    <TableCell className="font-mono font-bold uppercase">
                      {entry.pitchSequence || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={entry.resultCategory === 'good' ? "default" : "destructive"} className="rounded-sm px-1.5 py-0 text-[10px] uppercase tracking-wider">
                          {entry.resultCategory}
                        </Badge>
                        <span className="text-sm capitalize">{describeOutcome(entry)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      <span className={entry.delta > 0 ? "text-success" : entry.delta < 0 ? "text-destructive" : ""}>
                        {entry.delta > 0 ? '+' : ''}{entry.delta}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {entry.strikeoutCount}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
