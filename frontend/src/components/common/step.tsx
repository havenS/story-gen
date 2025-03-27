import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, ArrowRight, Loader2 } from "lucide-react";

interface StepProps {
  title: string;
  done: boolean;
  callMethod?: () => void;
  canProceed?: boolean;
  canRetry?: boolean;
  previousStepDone?: boolean;
  isPending?: boolean;
}

export function Step({
  title,
  done,
  callMethod,
  canProceed = true,
  canRetry = false,
  previousStepDone = true,
  isPending = false,
}: StepProps) {
  return (
    <div className={cn(
      "flex flex-row justify-between items-center",
      "p-4 rounded-lg transition-all duration-200",
      "hover:bg-accent/50",
      (!previousStepDone || !canProceed) && "opacity-50"
    )}>
      <div className="flex flex-row items-center gap-3">
        <span className="text-foreground/50">
          {done ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </span>
        <div className="flex flex-col">
          <p className="text-sm font-medium">{title}</p>
          {!done && previousStepDone && canProceed && !isPending && (
            <p className="text-xs text-muted-foreground">Ready to proceed</p>
          )}
          {!previousStepDone && (
            <p className="text-xs text-muted-foreground">Waiting for previous step</p>
          )}
          {done && canRetry && !isPending && (
            <p className="text-xs text-muted-foreground">Can be refreshed</p>
          )}
          {isPending && (
            <p className="text-xs text-muted-foreground">Processing...</p>
          )}
        </div>
      </div>
      {(!done || canRetry) && canProceed && callMethod && previousStepDone && !isPending && (
        <Button
          variant={done ? "outline" : "default"}
          size="sm"
          className="gap-2"
          onClick={callMethod}
        >
          {done && canRetry ? "Refresh" : "Proceed"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
} 