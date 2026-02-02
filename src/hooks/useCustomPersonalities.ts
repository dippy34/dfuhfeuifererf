import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "chaos-custom-personalities";

export interface CustomPersonality {
  id: string;
  name: string;
  description: string;
  emoji: string;
  systemPrompt: string;
  createdAt: number;
}

export const useCustomPersonalities = () => {
  const [customPersonalities, setCustomPersonalities] = useState<CustomPersonality[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customPersonalities));
  }, [customPersonalities]);

  const addCustomPersonality = useCallback((personality: Omit<CustomPersonality, "id" | "createdAt">) => {
    const newPersonality: CustomPersonality = {
      ...personality,
      id: `custom-${Date.now()}`,
      createdAt: Date.now(),
    };
    setCustomPersonalities((prev) => [...prev, newPersonality]);
    return newPersonality.id;
  }, []);

  const updateCustomPersonality = useCallback((id: string, updates: Partial<Omit<CustomPersonality, "id" | "createdAt">>) => {
    setCustomPersonalities((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteCustomPersonality = useCallback((id: string) => {
    setCustomPersonalities((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getCustomPersonality = useCallback((id: string) => {
    return customPersonalities.find((p) => p.id === id);
  }, [customPersonalities]);

  return {
    customPersonalities,
    addCustomPersonality,
    updateCustomPersonality,
    deleteCustomPersonality,
    getCustomPersonality,
  };
};
