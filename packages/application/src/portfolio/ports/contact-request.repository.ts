import type {
  ContactRequest,
  ContactRequestStatus,
  ContactSubject,
} from '@agentrepo/domain';
import type { Paginated } from '../../catalog/ports/content.repository';

export interface CreateContactRequestInput {
  email: string;
  subject: ContactSubject;
  message: string;
}

export interface ListContactRequestsParams {
  page: number;
  pageSize: number;
  status?: ContactRequestStatus;
}

export interface ContactRequestRepository {
  create(input: CreateContactRequestInput): Promise<ContactRequest>;
  list(params: ListContactRequestsParams): Promise<Paginated<ContactRequest>>;
  updateStatus(id: string, status: ContactRequestStatus): Promise<void>;
}
