import {
  ContactRequestRepository,
  CreateContactRequestInput,
  ListContactRequestsParams,
  Paginated,
} from '@agentrepo/application';
import {
  assertContactRequestStatus,
  assertContactSubject,
  ContactRequest,
  ContactRequestStatus,
} from '@agentrepo/domain';
import { ContactRequest as ContactRequestRow, Prisma, PrismaClient } from '@prisma/client';

function toDomain(row: ContactRequestRow): ContactRequest {
  return {
    ...row,
    subject: assertContactSubject(row.subject),
    status: assertContactRequestStatus(row.status),
  };
}

export class PrismaContactRequestRepository implements ContactRequestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateContactRequestInput): Promise<ContactRequest> {
    const row = await this.prisma.contactRequest.create({ data: input });
    return toDomain(row);
  }

  async list(
    params: ListContactRequestsParams
  ): Promise<Paginated<ContactRequest>> {
    const where: Prisma.ContactRequestWhereInput = params.status
      ? { status: params.status }
      : {};

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.contactRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      this.prisma.contactRequest.count({ where }),
    ]);

    return {
      items: rows.map(toDomain),
      total,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  async updateStatus(id: string, status: ContactRequestStatus): Promise<void> {
    await this.prisma.contactRequest.update({
      where: { id },
      data: { status },
    });
  }
}
