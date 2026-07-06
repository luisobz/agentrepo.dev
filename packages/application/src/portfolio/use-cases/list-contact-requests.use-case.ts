import type { ContactRequest } from '@agentrepo/domain';
import type { Paginated } from '../../catalog/ports/content.repository';
import { UseCase } from '../../shared/base.use-case';
import type {
  ContactRequestRepository,
  ListContactRequestsParams,
} from '../ports/contact-request.repository';

export class ListContactRequests
  implements UseCase<ListContactRequestsParams, Paginated<ContactRequest>>
{
  constructor(private readonly contactRequests: ContactRequestRepository) {}

  execute(params: ListContactRequestsParams): Promise<Paginated<ContactRequest>> {
    return this.contactRequests.list(params);
  }
}
