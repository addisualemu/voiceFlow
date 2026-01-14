"use client";

import * as React from "react";
import { ChevronDown, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContexts } from "@/hooks/use-contexts";
import { useCurrentContext } from "@/components/current-context-provider";
import { cn } from "@/lib/utils";

export function ContextSelector() {
  const { contexts, isLoading } = useContexts();
  const { currentContext, setCurrentContext, isLoaded } = useCurrentContext();

  if (!isLoaded || isLoading) {
    return null;
  }

  const selectedContextObj = contexts.find(c => c.name === currentContext);

  return (
    <div className="inline-flex items-center gap-1">
      <Select
        value={currentContext || "none"}
        onValueChange={(value) => {
          if (value === "none") {
            setCurrentContext(null);
          } else {
            setCurrentContext(value);
          }
        }}
      >
        <SelectTrigger
          className={cn(
            "h-7 px-2 py-1 text-xs border rounded-full gap-1.5 hover:bg-accent transition-colors",
            currentContext ? "bg-background" : "bg-muted/50 border-muted"
          )}
        >
          <SelectValue>
            <div className="flex items-center gap-1.5">
              {selectedContextObj?.color && (
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedContextObj.color }}
                />
              )}
              <span className="truncate max-w-[80px]">
                {currentContext || "Any"}
              </span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground text-xs">Any</span>
          </SelectItem>
          {contexts.map((context) => (
            <SelectItem key={context.name} value={context.name}>
              <div className="flex items-center gap-2">
                {context.color && (
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: context.color }}
                  />
                )}
                <span className="text-xs">{context.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentContext && (
        <button
          className="h-5 w-5 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          onClick={() => setCurrentContext(null)}
          title="Clear"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
