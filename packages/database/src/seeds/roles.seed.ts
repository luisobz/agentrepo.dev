import { PrismaClient } from '@prisma/client';

const PERMISSIONS = [
  { key: 'content.manage', description: 'Create, edit and delete catalog content' },
  { key: 'content.publish', description: 'Publish and unpublish catalog content' },
  { key: 'asset.purchase', description: 'Buy premium skills and agents' },
] as const;

const ROLES: { name: string; description: string; permissions: string[] }[] = [
  {
    name: 'admin',
    description: 'Full platform access',
    permissions: ['content.manage', 'content.publish', 'asset.purchase'],
  },
  {
    name: 'editor',
    description: 'Manages catalog content',
    permissions: ['content.manage', 'content.publish'],
  },
  {
    name: 'member',
    description: 'Registered community member',
    permissions: ['asset.purchase'],
  },
];

/** Idempotent baseline for roles and permissions (runs in every environment). */
export async function seedRoles(prisma: PrismaClient) {
  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { description: permission.description },
      create: permission,
    });
  }

  for (const role of ROLES) {
    const saved = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: { name: role.name, description: role.description },
    });
    for (const key of role.permissions) {
      const permission = await prisma.permission.findUniqueOrThrow({ where: { key } });
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: saved.id, permissionId: permission.id },
        },
        update: {},
        create: { roleId: saved.id, permissionId: permission.id },
      });
    }
  }
  console.log('roles.seed: roles and permissions in place');
}
