import type { ContactRequest } from '@agentrepo/domain';
import type { Paginated } from '../catalog/ports/content.repository';
import { UseCase } from '../shared/base.use-case';
import type { AppLoggerPort } from './ports/app-logger.port';
import type {
  ContactRequestRepository,
  ListContactRequestsParams,
} from './ports/contact-request.repository';
import type { ContactWorkflowDispatcher } from './ports/contact-workflow-dispatcher';
import { ListContactRequests } from './use-cases/list-contact-requests.use-case';
import {
  SubmitContact,
  SubmitContactInput,
  SubmitContactResult,
} from './use-cases/submit-contact.use-case';

export interface PortfolioUseCases {
  submitContact: UseCase<SubmitContactInput, SubmitContactResult>;
  listContactRequests: UseCase<
    ListContactRequestsParams,
    Paginated<ContactRequest>
  >;
}

export interface PortfolioDependencies {
  contactRequestRepository: ContactRequestRepository;
  contactWorkflowDispatcher: ContactWorkflowDispatcher;
  logger: AppLoggerPort;
}

export function createPortfolioUseCases({
  contactRequestRepository,
  contactWorkflowDispatcher,
  logger,
}: PortfolioDependencies): PortfolioUseCases {
  return {
    submitContact: new SubmitContact(
      contactRequestRepository,
      contactWorkflowDispatcher,
      logger
    ),
    listContactRequests: new ListContactRequests(contactRequestRepository),
  };
}
