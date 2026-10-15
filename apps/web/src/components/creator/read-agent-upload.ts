import {
  InvalidAgentFilesError,
  type AgentSourceFile,
} from '@agentrepo/trpc/schemas';

/** Keep untrusted ZIP parsing off the UI thread; terminate it on timeout. */
export function readAgentUpload(files: File[]): Promise<AgentSourceFile[]> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./agent-upload.worker.ts', import.meta.url),
    );
    const finish = () => {
      clearTimeout(timer);
      worker.terminate();
    };
    const timer = setTimeout(() => {
      finish();
      reject(new InvalidAgentFilesError('Source package processing timed out'));
    }, 20_000);
    worker.onmessage = (
      event: MessageEvent<{ files?: AgentSourceFile[]; error?: string }>,
    ) => {
      finish();
      if (event.data.files) resolve(event.data.files);
      else
        reject(
          new InvalidAgentFilesError(
            event.data.error ?? 'Could not read source package',
          ),
        );
    };
    worker.onerror = () => {
      finish();
      reject(new InvalidAgentFilesError('Could not read source package'));
    };
    worker.postMessage(files);
  });
}
