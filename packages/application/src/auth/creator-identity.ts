export interface ContributorIdentity {
  providerUserId: string;
  email: string;
  name: string;
  provider: 'github' | 'email';
}

export interface ContributorSessionVerifier {
  verify(token: string): Promise<ContributorIdentity | null>;
}

export interface ContributorRepository {
  findOrCreate(identity: ContributorIdentity): Promise<string | null>;
}

export class ResolveCreatorIdentity {
  constructor(
    private readonly dependencies: {
      sessions: ContributorSessionVerifier;
      contributors: ContributorRepository;
    },
  ) {}

  async execute(token: string): Promise<string | null> {
    const identity = await this.dependencies.sessions.verify(token);
    return identity
      ? this.dependencies.contributors.findOrCreate(identity)
      : null;
  }
}
