import { useState } from "react";
import { Settings, Plus, Trash2 } from "lucide-react";
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
import { CustomPersonalityDialog } from "./CustomPersonalityDialog";
import { CustomPersonality } from "@/hooks/useCustomPersonalities";

interface SettingsDialogProps {
  currentPersonalityId: PersonalityId;
  onPersonalityChange: (id: PersonalityId) => void;
  customPersonalities: CustomPersonality[];
  onAddCustomPersonality: (personality: Omit<CustomPersonality, "id" | "createdAt">) => string;
  onDeleteCustomPersonality: (id: string) => void;
}

export const SettingsDialog = ({
  currentPersonalityId,
  onPersonalityChange,
  customPersonalities,
  onAddCustomPersonality,
  onDeleteCustomPersonality,
}: SettingsDialogProps) => {
  const [showCustomDialog, setShowCustomDialog] = useState(false);

  const handleSaveCustom = (personality: Omit<CustomPersonality, "id" | "createdAt">) => {
    const newId = onAddCustomPersonality(personality);
    onPersonalityChange(newId);
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteCustomPersonality(id);
    if (currentPersonalityId === id) {
      onPersonalityChange("nice");
    }
  };

  return (
    <>
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
        <DialogContent className="sm:max-w-md bg-card border-border max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-primary text-glow">
              AI Personality
            </DialogTitle>
            <DialogDescription>
              Choose how you want the AI to respond. Your selection is saved automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-3 py-4">
              {personalities.map((personality) => (
                <PersonalityOption
                  key={personality.id}
                  personality={personality}
                  isSelected={currentPersonalityId === personality.id}
                  onSelect={() => onPersonalityChange(personality.id)}
                />
              ))}
              
              {customPersonalities.length > 0 && (
                <>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-2 mb-1">
                    Custom Personalities
                  </div>
                  {customPersonalities.map((custom) => (
                    <CustomPersonalityOption
                      key={custom.id}
                      personality={custom}
                      isSelected={currentPersonalityId === custom.id}
                      onSelect={() => onPersonalityChange(custom.id)}
                      onDelete={(e) => handleDeleteCustom(custom.id, e)}
                    />
                  ))}
                </>
              )}
              
              <button
                onClick={() => setShowCustomDialog(true)}
                className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary transition-all text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Create Custom Personality</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CustomPersonalityDialog
        open={showCustomDialog}
        onOpenChange={setShowCustomDialog}
        onSave={handleSaveCustom}
      />
    </>
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

interface CustomPersonalityOptionProps {
  personality: CustomPersonality;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const CustomPersonalityOption = ({
  personality,
  isSelected,
  onSelect,
  onDelete,
}: CustomPersonalityOptionProps) => {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border text-left transition-all group",
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
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {personality.description}
        </p>
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
        title="Delete personality"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </button>
    </button>
  );
};
