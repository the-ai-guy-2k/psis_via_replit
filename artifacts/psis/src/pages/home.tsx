import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Activity, Target, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <section className="text-center py-16 space-y-6">
        <div className="mx-auto w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mb-8">
          <Target className="w-8 h-8" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-primary">Pitch Sequence Intelligence</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A no-nonsense tool for baseball pitching coaches and analysts to track and evaluate pitch sequencing effectiveness in real-time.
        </p>
        <div className="pt-8">
          <Button asChild size="lg" className="h-14 px-8 text-lg rounded-none uppercase font-bold tracking-wider">
            <Link href="/track" data-testid="btn-start-tracking">
              Start Tracking
            </Link>
          </Button>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-8 pt-12 border-t border-border">
        <div className="space-y-4">
          <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center text-primary">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-lg">Inning Tracking</h3>
          <p className="text-muted-foreground text-sm">
            Quickly log pitcher/batter matchups, sequences, and results right from the dugout.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center text-primary">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-lg">Outcome Analysis</h3>
          <p className="text-muted-foreground text-sm">
            Categorize results instantly. Track strikeouts, weak contact, and hard hit rates to evaluate sequencing success.
          </p>
        </div>

        <div className="space-y-4">
          <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center text-primary">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-lg">Sequence Dashboard</h3>
          <p className="text-muted-foreground text-sm">
            Identify your most effective pitch patterns and worst sequences with real-time aggregate dashboard data.
          </p>
        </div>
      </div>
    </div>
  );
}
