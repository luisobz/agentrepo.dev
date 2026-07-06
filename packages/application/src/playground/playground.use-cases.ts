import type { PlaygroundDeployment, PlaygroundToken } from '@agentrepo/domain';
import type { Paginated } from '../catalog/ports/content.repository';
import { UseCase } from '../shared/base.use-case';
import type {
  CodeGenerationPort,
  CodeValidatorPort,
} from './ports/code-generation.port';
import type { PlaygroundDeploymentRepository } from './ports/playground-deployment.repository';
import type {
  ListPlaygroundTokensParams,
  PlaygroundTokenRepository,
} from './ports/playground-token.repository';
import { ExecuteAgentFlow } from './use-cases/execute-agent-flow.use-case';
import {
  CheckPlaygroundToken,
  ConsumePlaygroundToken,
  CreatePlaygroundToken,
  CreatePlaygroundTokenRequest,
  DeletePlaygroundToken,
  ListPlaygroundTokens,
  SetPlaygroundTokenActive,
  SetPlaygroundTokenActiveRequest,
  ValidateTokenResult,
} from './use-cases/playground-token.use-cases';
import {
  SavePlaygroundDeployment,
  SavePlaygroundDeploymentRequest,
} from './use-cases/save-playground-deployment.use-case';

export interface PlaygroundUseCases {
  createToken: UseCase<CreatePlaygroundTokenRequest, PlaygroundToken>;
  listTokens: UseCase<ListPlaygroundTokensParams, Paginated<PlaygroundToken>>;
  setTokenActive: UseCase<SetPlaygroundTokenActiveRequest, PlaygroundToken>;
  deleteToken: UseCase<string, void>;
  checkToken: UseCase<string, ValidateTokenResult>;
  consumeToken: UseCase<string, ValidateTokenResult>;
  saveDeployment: UseCase<SavePlaygroundDeploymentRequest, PlaygroundDeployment>;
  executeAgentFlow: ExecuteAgentFlow;
}

export interface PlaygroundDependencies {
  tokenRepository: PlaygroundTokenRepository;
  deploymentRepository: PlaygroundDeploymentRepository;
  codeGenerator: CodeGenerationPort;
  codeValidator: CodeValidatorPort;
}

export function createPlaygroundUseCases({
  tokenRepository,
  deploymentRepository,
  codeGenerator,
  codeValidator,
}: PlaygroundDependencies): PlaygroundUseCases {
  return {
    createToken: new CreatePlaygroundToken(tokenRepository),
    listTokens: new ListPlaygroundTokens(tokenRepository),
    setTokenActive: new SetPlaygroundTokenActive(tokenRepository),
    deleteToken: new DeletePlaygroundToken(tokenRepository),
    checkToken: new CheckPlaygroundToken(tokenRepository),
    consumeToken: new ConsumePlaygroundToken(tokenRepository),
    saveDeployment: new SavePlaygroundDeployment(deploymentRepository),
    executeAgentFlow: new ExecuteAgentFlow(codeGenerator, codeValidator),
  };
}
