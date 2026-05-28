import { z } from 'zod';

const configSchema = z.object({
  databaseUrl: z.string(),
  nodeEnv: z.enum(['development', 'production', 'test']),
});

export const config = configSchema.parse({
  databaseUrl: process.env['DATABASE_URL'],
  nodeEnv: process.env['NODE_ENV'],
});
