import {
  PublishVersionInput,
  RecordDownloadInput,
  SetLatestVersionInput,
  SkillVersionRepository,
} from '@agentrepo/application';
import {
  compareSemver,
  EntityNotFoundError,
  SkillVersion,
  VersionAlreadyExistsError,
  VersionListEntry,
} from '@agentrepo/domain';
import { Prisma, PrismaClient, SkillVersion as SkillVersionRow } from '@prisma/client';
import { isUniqueConstraintError, todayUtc, weekWindowStart } from './version-stats';

type RowWithDays = SkillVersionRow & { downloadDays: { count: number }[] };

function toDomain(row: SkillVersionRow): SkillVersion {
  const { ...version } = row;
  return version;
}

function toEntry(row: RowWithDays, latestVersionId: string | null): VersionListEntry<SkillVersion> {
  const { downloadDays, ...version } = row;
  return {
    version: toDomain(version),
    downloadsWeekly: downloadDays.reduce((sum, dayRow) => sum + dayRow.count, 0),
    isLatest: row.id === latestVersionId,
  };
}

export class PrismaSkillVersionRepository implements SkillVersionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private async listFor(
    skillId: string,
    latestVersionId: string | null
  ): Promise<VersionListEntry<SkillVersion>[]> {
    const rows = await this.prisma.skillVersion.findMany({
      where: { skillId },
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

  async listByAssetId(skillId: string): Promise<VersionListEntry<SkillVersion>[]> {
    const head = await this.prisma.skill.findUnique({
      where: { id: skillId },
      select: { latestVersionId: true },
    });
    if (!head) {
      throw new EntityNotFoundError('Skill', skillId);
    }
    return this.listFor(skillId, head.latestVersionId);
  }

  async listPublishedBySlug(
    slug: string
  ): Promise<VersionListEntry<SkillVersion>[] | null> {
    const head = await this.prisma.skill.findUnique({
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
  ): Promise<SkillVersion | null> {
    const row = await this.prisma.skillVersion.findFirst({
      where: { version, skill: { slug, isPublished: true } },
    });
    return row ? toDomain(row) : null;
  }

  async publishFromHead(input: PublishVersionInput): Promise<SkillVersion> {
    return this.prisma.$transaction(async (tx) => {
      const head = await tx.skill.findUnique({ where: { id: input.assetId } });
      if (!head) {
        throw new EntityNotFoundError('Skill', input.assetId);
      }
      let created: SkillVersionRow;
      try {
        created = await tx.skillVersion.create({
          data: {
            skillId: head.id,
            version: input.version,
            content: head.content,
            changelog: input.changelog,
          },
        });
      } catch (error: unknown) {
        if (isUniqueConstraintError(error)) {
          throw new VersionAlreadyExistsError('Skill', input.version);
        }
        throw error;
      }
      await tx.skill.update({
        where: { id: head.id },
        data: { latestVersionId: created.id, version: created.version },
      });
      return toDomain(created);
    });
  }

  async setLatest(input: SetLatestVersionInput): Promise<SkillVersion> {
    return this.prisma.$transaction(async (tx) => {
      const row = await tx.skillVersion.findFirst({
        where: { id: input.versionId, skillId: input.assetId },
      });
      if (!row) {
        throw new EntityNotFoundError('SkillVersion', input.versionId);
      }
      // The head row mirrors the latest-tagged snapshot for display/search.
      await tx.skill.update({
        where: { id: input.assetId },
        data: {
          latestVersionId: row.id,
          version: row.version,
          content: row.content,
        },
      });
      return toDomain(row);
    });
  }

  async recordDownload(input: RecordDownloadInput): Promise<void> {
    const where: Prisma.SkillVersionWhereInput = input.version
      ? { version: input.version, skill: { slug: input.slug, isPublished: true } }
      : { latestOf: { slug: input.slug, isPublished: true } };
    const row = await this.prisma.skillVersion.findFirst({
      where,
      select: { id: true },
    });
    if (!row) {
      return;
    }
    const day = todayUtc();
    await this.prisma.$transaction([
      this.prisma.skillVersion.update({
        where: { id: row.id },
        data: { downloadsTotal: { increment: 1 } },
      }),
      this.prisma.skillVersionDownloadDay.upsert({
        where: { versionId_day: { versionId: row.id, day } },
        create: { versionId: row.id, day, count: 1 },
        update: { count: { increment: 1 } },
      }),
    ]);
  }
}
