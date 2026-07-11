import {
  AgentVersionRepository,
  PublishVersionInput,
  RecordDownloadInput,
  SetLatestVersionInput,
} from '@agentrepo/application';
import {
  AgentVersion,
  compareSemver,
  DataIntegrityError,
  EntityNotFoundError,
  FileTree,
  isFileTree,
  VersionAlreadyExistsError,
  VersionListEntry,
} from '@agentrepo/domain';
import { AgentVersion as AgentVersionRow, Prisma, PrismaClient } from '@prisma/client';
import { isUniqueConstraintError, todayUtc, weekWindowStart } from './version-stats';

type RowWithDays = AgentVersionRow & { downloadDays: { count: number }[] };

function fileTreeFromJson(value: Prisma.JsonValue, versionId: string): FileTree {
  if (!isFileTree(value)) {
    throw new DataIntegrityError(
      `agent version ${versionId} has a malformed fileTree`
    );
  }
  return value;
}

function toDomain(row: AgentVersionRow): AgentVersion {
  return { ...row, fileTree: fileTreeFromJson(row.fileTree, row.id) };
}

function toEntry(
  row: RowWithDays,
  latestVersionId: string | null
): VersionListEntry<AgentVersion> {
  const { downloadDays, ...version } = row;
  return {
    version: toDomain(version),
    downloadsWeekly: downloadDays.reduce((sum, dayRow) => sum + dayRow.count, 0),
    isLatest: row.id === latestVersionId,
  };
}

export class PrismaAgentVersionRepository implements AgentVersionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private async listFor(
    agentId: string,
    latestVersionId: string | null
  ): Promise<VersionListEntry<AgentVersion>[]> {
    const rows = await this.prisma.agentVersion.findMany({
      where: { agentId },
      include: {
        downloadDays: {
          where: { day: { gte: weekWindowStart() } },
          select: { count: true },
        },
      },
    });
    return rows
      .map((row) => toEntry(row, latestVersionId))
      .sort((a, b) => compareSemver(b.version.version, a.version.version));
  }

  async listByAssetId(agentId: string): Promise<VersionListEntry<AgentVersion>[]> {
    const head = await this.prisma.agent.findUnique({
      where: { id: agentId },
      select: { latestVersionId: true },
    });
    if (!head) {
      throw new EntityNotFoundError('Agent', agentId);
    }
    return this.listFor(agentId, head.latestVersionId);
  }

  async listPublishedBySlug(
    slug: string
  ): Promise<VersionListEntry<AgentVersion>[] | null> {
    const head = await this.prisma.agent.findUnique({
      where: { slug },
      select: { id: true, isPublished: true, latestVersionId: true },
    });
    if (!head || !head.isPublished) {
      return null;
    }
    return this.listFor(head.id, head.latestVersionId);
  }

  async findPublishedBySlugAndVersion(
    slug: string,
    version: string
  ): Promise<AgentVersion | null> {
    const row = await this.prisma.agentVersion.findFirst({
      where: { version, agent: { slug, isPublished: true } },
    });
    return row ? toDomain(row) : null;
  }

  async publishFromHead(input: PublishVersionInput): Promise<AgentVersion> {
    return this.prisma.$transaction(async (tx) => {
      const head = await tx.agent.findUnique({ where: { id: input.assetId } });
      if (!head) {
        throw new EntityNotFoundError('Agent', input.assetId);
      }
      let created: AgentVersionRow;
      try {
        created = await tx.agentVersion.create({
          data: {
            agentId: head.id,
            version: input.version,
            readmeContent: head.readmeContent,
            fileTree: head.fileTree as Prisma.InputJsonValue,
            changelog: input.changelog,
          },
        });
      } catch (error: unknown) {
        if (isUniqueConstraintError(error)) {
          throw new VersionAlreadyExistsError('Agent', input.version);
        }
        throw error;
      }
      await tx.agent.update({
        where: { id: head.id },
        data: { latestVersionId: created.id, version: created.version },
      });
      return toDomain(created);
    });
  }

  async setLatest(input: SetLatestVersionInput): Promise<AgentVersion> {
    return this.prisma.$transaction(async (tx) => {
      const row = await tx.agentVersion.findFirst({
        where: { id: input.versionId, agentId: input.assetId },
      });
      if (!row) {
        throw new EntityNotFoundError('AgentVersion', input.versionId);
      }
      await tx.agent.update({
        where: { id: input.assetId },
        data: {
          latestVersionId: row.id,
          version: row.version,
          readmeContent: row.readmeContent,
          fileTree: row.fileTree as Prisma.InputJsonValue,
        },
      });
      return toDomain(row);
    });
  }

  async recordDownload(input: RecordDownloadInput): Promise<void> {
    const where: Prisma.AgentVersionWhereInput = input.version
      ? { version: input.version, agent: { slug: input.slug, isPublished: true } }
      : { latestOf: { slug: input.slug, isPublished: true } };
    const row = await this.prisma.agentVersion.findFirst({
      where,
      select: { id: true },
    });
    if (!row) {
      return;
    }
    const day = todayUtc();
    await this.prisma.$transaction([
      this.prisma.agentVersion.update({
        where: { id: row.id },
        data: { downloadsTotal: { increment: 1 } },
      }),
      this.prisma.agentVersionDownloadDay.upsert({
        where: { versionId_day: { versionId: row.id, day } },
        create: { versionId: row.id, day, count: 1 },
        update: { count: { increment: 1 } },
      }),
    ]);
  }
}
