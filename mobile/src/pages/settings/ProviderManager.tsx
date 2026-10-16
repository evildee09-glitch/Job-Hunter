import StageNotice from '../../components/StageNotice';

export default function ProviderManager() {
  return <StageNotice title="AI Providers" backHref="/settings" text="No AI providers are configured. Provider management (OpenAI, Gemini, Claude, Ollama), task routing, and fallback arrive in Stage 3. Job search, matching, and tracking work without AI." />;
}
