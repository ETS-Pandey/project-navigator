import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

interface AITextAssistProps {
  fieldName: string;
  context?: string;
  onSuggestion: (text: string) => void;
  disabled?: boolean;
}

export function AITextAssist({ fieldName, context, onSuggestion, disabled }: AITextAssistProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const generateSuggestions = async () => {
    setIsLoading(true);
    setSuggestions([]);

    try {
      const { data, error } = await supabase.functions.invoke("ai-text-assist", {
        body: { fieldName, context },
      });

      if (error) throw error;
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("AI assist error:", err);
      setSuggestions(["Unable to generate suggestions. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && suggestions.length === 0) {
      generateSuggestions();
    }
  };

  const selectSuggestion = (suggestion: string) => {
    onSuggestion(suggestion);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          disabled={disabled}
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="end">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">AI Suggestions</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={generateSuggestions}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                No suggestions available
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
