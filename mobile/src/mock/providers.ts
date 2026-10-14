import type { ProviderConfig } from '../domain/providers';

export const mockProviders: ProviderConfig[] = [
  { id: 'ollama', name: 'Ollama (local)', local: true, enabled: true, models: ['llama3.1:8b', 'qwen2.5:7b'], defaultModel: 'llama3.1:8b' },
  { id: 'openai', name: 'OpenAI', local: false, enabled: false, maskedKey: 'sk-••••••••3f9a', models: ['example-model-a', 'example-model-b'], defaultModel: 'example-model-a' },
  { id: 'gemini', name: 'Google Gemini', local: false, enabled: false, maskedKey: 'AI••••••••k2Qx', models: ['example-model-c'], defaultModel: 'example-model-c' },
  { id: 'anthropic', name: 'Anthropic Claude', local: false, enabled: false, maskedKey: 'sk-ant-••••••••9d1', models: ['example-model-d'], defaultModel: 'example-model-d' },
];

export const mockOllamaModels = [
  { name: 'llama3.1:8b', sizeGB: 4.9, installed: true },
  { name: 'qwen2.5:7b', sizeGB: 4.7, installed: true },
  { name: 'mistral:7b', sizeGB: 4.1, installed: false },
];
