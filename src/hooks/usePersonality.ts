import { useState, useEffect, useCallback } from "react";
import { PersonalityId, getPersonality } from "@/types/personality";

const STORAGE_KEY = "chaos-ai-personality";

export const usePersonality = () => {
  const [personalityId, setPersonalityId] = useState<PersonalityId>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as PersonalityId) || "nice";
  });

  const personality = getPersonality(personalityId);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, personalityId);
  }, [personalityId]);

  const changePersonality = useCallback((id: PersonalityId) => {
    setPersonalityId(id);
  }, []);

  return { personality, personalityId, changePersonality };
};
