export class InstallerError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'InstallerError';
  }
}
