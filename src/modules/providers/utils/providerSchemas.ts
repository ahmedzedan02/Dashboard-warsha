import { z } from 'zod';

export const providerFormSchema = z.object({
  provider_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional().or(z.literal('')),
  whatsapp: z.string().min(6),
  mobileno: z.string().min(6),
  region_id: z.string().min(1),
  fcomplogo: z.custom<FileList | undefined>((value) => value === undefined || value instanceof FileList).optional(),
  fcompAttachments: z.custom<FileList | undefined>((value) => value === undefined || value instanceof FileList).optional(),
});

export type ProviderFormSchema = z.infer<typeof providerFormSchema>;
