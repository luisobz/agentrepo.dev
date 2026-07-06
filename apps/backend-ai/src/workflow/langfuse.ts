import { BackendEnvironments } from '@agentrepo/config';
import { CallbackHandler } from '@langfuse/langchain';
import { LangfuseSpanProcessor } from '@langfuse/otel';
import { Logger } from '@nestjs/common';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

let tracingInitialised = false;

function isLangfuseConfigured(): boolean {
  return (
    BackendEnvironments.LANGFUSE_PUBLIC_KEY !== '' &&
    BackendEnvironments.LANGFUSE_SECRET_KEY !== ''
  );
}

/**
 * The Langfuse v5 SDK exports spans over OpenTelemetry: without a registered
 * span processor the CallbackHandler is a silent no-op, so both are set up
 * together here.
 */
export function initLangfuseTracing(): void {
  if (tracingInitialised || !isLangfuseConfigured()) {
    return;
  }
  const provider = new NodeTracerProvider({
    spanProcessors: [
      new LangfuseSpanProcessor({
        publicKey: BackendEnvironments.LANGFUSE_PUBLIC_KEY,
        secretKey: BackendEnvironments.LANGFUSE_SECRET_KEY,
        baseUrl: BackendEnvironments.LANGFUSE_BASE_URL,
      }),
    ],
  });
  provider.register();
  tracingInitialised = true;
  new Logger('Langfuse').log('Langfuse tracing enabled');
}

export function createLangfuseCallbackIfConfigured():
  | CallbackHandler
  | undefined {
  if (!isLangfuseConfigured()) {
    return undefined;
  }
  initLangfuseTracing();
  return new CallbackHandler({ tags: ['contact-workflow'] });
}
