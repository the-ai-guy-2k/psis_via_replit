import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useCreateEntry, 
  useListEntries, 
  getListEntriesQueryKey,
  getGetDashboardQueryKey,
  ResultOutcome,
  Handedness,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  pitcherHandedness: z.enum(["L", "R"] as const, { required_error: "Required" }),
  batterHandedness: z.enum(["L", "R"] as const, { required_error: "Required" }),
  pitchSequence: z.string().min(1, "Pitch sequence is required"),
  result: z.enum([
    "strikeout", "ground_out", "fly_out", "pop_out", "double_play", "weak_contact", 
    "hit", "walk", "home_run", "hard_contact", "run_scored", "pressure_error"
  ] as const, { required_error: "Required" }),
  goodCount: z.coerce.number().min(0),
  badCount: z.coerce.number().min(0),
  strikeoutCount: z.coerce.number().min(0),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const GOOD_OUTCOMES = ["strikeout", "ground_out", "fly_out", "pop_out", "double_play", "weak_contact"];
const BAD_OUTCOMES = ["hit", "walk", "home_run", "hard_contact", "run_scored", "pressure_error"];

export default function Track() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: entries, isLoading: entriesLoading } = useListEntries();
  const createEntry = useCreateEntry();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pitchSequence: "",
      goodCount: 0,
      badCount: 0,
      strikeoutCount: 0,
      notes: ""
    }
  });

  const onSubmit = (data: FormValues) => {
    createEntry.mutate({
      data: {
        pitcherHandedness: data.pitcherHandedness,
        batterHandedness: data.batterHandedness,
        pitchSequence: data.pitchSequence,
        result: data.result,
        goodCount: data.goodCount,
        badCount: data.badCount,
        strikeoutCount: data.strikeoutCount,
        notes: data.notes || undefined
      }
    }, {
      onSuccess: (newEntry) => {
        toast({
          title: "Entry Logged",
          description: `Sequence ${newEntry.pitchSequence} recorded successfully.`,
        });
        form.reset({
          pitcherHandedness: data.pitcherHandedness, // keep context
          batterHandedness: data.batterHandedness,
          pitchSequence: "",
          result: undefined as any,
          goodCount: 0,
          badCount: 0,
          strikeoutCount: 0,
          notes: ""
        });
        queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to log entry.",
          variant: "destructive"
        });
      }
    });
  };

  const recentEntry = entries?.[0];

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="rounded-none border-t-4 border-t-primary">
          <CardHeader className="bg-muted/50 pb-4">
            <CardTitle className="uppercase tracking-wider">Log Plate Appearance</CardTitle>
            <CardDescription>Record pitch sequencing and immediate outcome.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pitcherHandedness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pitcher</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-pitcher" className="rounded-sm">
                              <SelectValue placeholder="Handedness" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="R">Right (R)</SelectItem>
                            <SelectItem value="L">Left (L)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="batterHandedness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batter</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-batter" className="rounded-sm">
                              <SelectValue placeholder="Handedness" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="R">Right (R)</SelectItem>
                            <SelectItem value="L">Left (L)</SelectItem>
                            <SelectItem value="S">Switch (S)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="pitchSequence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sequence (e.g. FB-SL-CH)</FormLabel>
                      <FormControl>
                        <Input placeholder="FB-SL-CH" className="font-mono uppercase rounded-sm" {...field} data-testid="input-sequence" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="result"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PA Result</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-result" className="rounded-sm">
                            <SelectValue placeholder="Select outcome" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">Good Outcomes</div>
                          {GOOD_OUTCOMES.map(r => (
                            <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>
                          ))}
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase border-t mt-1">Bad Outcomes</div>
                          {BAD_OUTCOMES.map(r => (
                            <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="goodCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Good</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} className="font-mono rounded-sm" {...field} data-testid="input-good" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="badCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bad</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} className="font-mono rounded-sm" {...field} data-testid="input-bad" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="strikeoutCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Strikeouts</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} className="font-mono rounded-sm" {...field} data-testid="input-k" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any mechanical or situational observations..." className="resize-none rounded-sm" {...field} data-testid="input-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full rounded-none font-bold uppercase tracking-wider" 
                  disabled={createEntry.isPending}
                  data-testid="btn-submit-entry"
                >
                  {createEntry.isPending ? "Logging..." : "Log PA Entry"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {recentEntry && (
          <Alert className={recentEntry.resultCategory === 'good' ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'}>
            {recentEntry.resultCategory === 'good' ? <CheckCircle2 className="w-4 h-4 text-success" /> : <AlertCircle className="w-4 h-4 text-destructive" />}
            <AlertTitle className="uppercase tracking-wider font-bold">
              Last Entry: {recentEntry.pitchSequence}
            </AlertTitle>
            <AlertDescription className="font-mono text-sm mt-2">
              <div className="flex gap-4">
                <span>Good: {recentEntry.goodCount}</span>
                <span>Bad: {recentEntry.badCount}</span>
                <span className={recentEntry.delta > 0 ? "text-success font-bold" : recentEntry.delta < 0 ? "text-destructive font-bold" : ""}>
                  Delta: {recentEntry.delta > 0 ? '+' : ''}{recentEntry.delta}
                </span>
                <span>K: {recentEntry.strikeoutCount}</span>
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
              Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-sm" />
              ))
            ) : entries?.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">No entries logged yet.</div>
            ) : (
              entries?.slice(0, 8).map(entry => (
                <div key={entry.id} className="flex justify-between items-center bg-card border p-3 rounded-sm text-sm" data-testid={`log-entry-${entry.id}`}>
                  <div>
                    <div className="font-mono font-bold uppercase">{entry.pitchSequence}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span className="font-semibold">{entry.pitcherHandedness}v{entry.batterHandedness}</span>
                      <span>•</span>
                      <span className="capitalize">{entry.result.replace("_", " ")}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={entry.resultCategory === 'good' ? "default" : "destructive"} className="rounded-sm px-1.5 py-0 text-[10px] uppercase tracking-wider bg-opacity-10">
                      {entry.resultCategory}
                    </Badge>
                    <div className="font-mono text-xs mt-1 text-muted-foreground">
                      Δ {entry.delta > 0 ? '+' : ''}{entry.delta}
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
