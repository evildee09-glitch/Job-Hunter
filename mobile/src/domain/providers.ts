export type ProviderKind = 'ollama' | 'openai' | 'gemini' | 'anthropic';

export interface ProviderConfig {
  id: ProviderKind;
  name: string;
  local: boolean;
  enabled: boolean;
  maskedKey?: string;
  models: string[];
  defaultModel: string;
}

export const tasks = [
  'Job classification', 'Job matching', 'Resume tailoring', 'Cover letter generation',
  'Screening answer suggestions', 'Profile document extraction',
] as const;
export type TaskName = (typeof tasks)[number];
