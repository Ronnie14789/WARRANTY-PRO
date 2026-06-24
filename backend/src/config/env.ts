import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  JWT_SECRET: z.string().min(16).default('change-this-super-secret-key'),
  DATABASE_URL: z.string().min(1).default('******localhost:5432/wcims?schema=public'),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local')
});

export const env = envSchema.parse(process.env);
