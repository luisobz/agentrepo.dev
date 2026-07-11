export interface PlaygroundToken {
  id: string;
  token: string;
  label: string;
  maxUses: number;
  usesCount: number;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaygroundDeployment {
  id: string;
  tokenId: string | null;
  title: string;
  prompt: string;
  code: string;
  url: string;
  createdAt: Date;
}

export function isPlaygroundTokenUsable(
  token: PlaygroundToken,
  now: Date = new Date()
): boolean {
  return (
    token.isActive && token.usesCount < token.maxUses && token.expiresAt > now
  );
}
