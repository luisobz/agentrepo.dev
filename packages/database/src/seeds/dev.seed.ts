import { PrismaClient } from '@prisma/client';
import { seedRoles } from './roles.seed';

export async function seed(prisma: PrismaClient) {
  await seedRoles(prisma);
  console.log('dev.seed: Starting development seed');

  try {
    const skillCount = await prisma.skill.count();
    if (skillCount === 0) {
      await prisma.skill.create({
        data: {
          slug: 'dev-welcome',
          title: 'Welcome (dev seed)',
          description: 'Seeded skill for local development',
          content: 'This is a development seed.',
          type: 'system',
          isPublished: true,
        },
      });
      console.log('dev.seed: Created sample Skill');
    } else {
      console.log('dev.seed: Skills already present — skipping');
    }

    const postCount = await prisma.blogPost.count();
    if (postCount === 0) {
      await prisma.blogPost.create({
        data: {
          slug: 'dev-welcome-post',
          title: 'Welcome Post (dev seed)',
          excerpt: 'Seeded blog post for local development',
          content: 'This is a development seed blog post.',
          isPublished: true,
        },
      });
      console.log('dev.seed: Created sample BlogPost');
    } else {
      console.log('dev.seed: BlogPosts already present — skipping');
    }

    console.log('dev.seed: Completed');
  } catch (err) {
    console.error('dev.seed: Error', err);
    throw err;
  }
}
