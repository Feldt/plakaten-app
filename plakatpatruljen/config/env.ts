import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional().default(''),
  EXPO_PUBLIC_APP_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
});

type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  const raw = {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY:
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  };

  const result = envSchema.safeParse(raw);

  if (!result.success) {
    console.warn(
      'Missing or invalid environment variables:',
      result.error.flatten().fieldErrors,
    );
    // Return defaults for development
    return {
      EXPO_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'placeholder-key',
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: '',
      EXPO_PUBLIC_APP_ENV: 'development',
    };
  }

  return result.data;
}

export const env = getEnv();
