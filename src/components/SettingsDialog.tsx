import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { personalities, PersonalityId, Personality } from "@/types/personality";
import { cn } from "@/lib/utils";

interface SettingsDialogProps {
  currentPersonalityId: PersonalityId;
  onPersonalityChange: (id: PersonalityId) => void;
}

export const SettingsDialog = ({
  currentPersonalityId,
  onPersonalityChange,
}: SettingsDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-primary text-glow">
            AI Personality
          </DialogTitle>
          <DialogDescription>
            Choose how you want the AI to respond. Your selection is saved automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {personalities.map((personality) => (
            <PersonalityOption
              key={personality.id}
              personality={personality}
              isSelected={currentPersonalityId === personality.id}
              onSelect={() => onPersonalityChange(personality.id)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface PersonalityOptionProps {
  personality: Personality;
  isSelected: boolean;
  onSelect: () => void;
}

const PersonalityOption = ({
  personality,
  isSelected,
  onSelect,
}: PersonalityOptionProps) => {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
        isSelected
          ? "border-primary bg-primary/10 box-glow"
          : "border-border bg-secondary/50 hover:border-primary/50 hover:bg-secondary"
      )}
    >
      <span className="text-2xl">{personality.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium",
            isSelected ? "text-primary" : "text-foreground"
          )}>
            {personality.name}
          </span>
          {isSelected && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
              Active
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {personality.description}
        </p>
      </div>
    </button>
  );
};
