import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string(),
  SUPABASE_JWT_SECRET: z.string(),
  PORT: z.string().default('3001'),
});

export const env = envSchema.parse(process.env);
