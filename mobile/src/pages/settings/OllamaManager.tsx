import StageNotice from '../../components/StageNotice';

export default function OllamaManager() {
  return <StageNotice title="Ollama Models" backHref="/settings" text="Local model management arrives in Stage 4. Note that a backend hosted on Render cannot reach Ollama running on your laptop; local models need the backend on your own machine or a secure tunnel." />;
}
