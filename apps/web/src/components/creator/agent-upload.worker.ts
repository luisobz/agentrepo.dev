import { readAgentFiles } from './agent-package';

self.onmessage = async (event: MessageEvent<File[]>) => {
  try {
    self.postMessage({ files: await readAgentFiles(event.data) });
  } catch (error) {
    self.postMessage({
      error:
        error instanceof Error
          ? error.message
          : 'Could not read source package',
    });
  }
};
