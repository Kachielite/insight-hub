import { z } from 'zod';

export const projectCreateSchema = z.object({
  projectName: z
    .string()
    .min(3, { message: 'Project name must be at least 3 characters' }),
});

export type ProjectCreateSchema = z.infer<typeof projectCreateSchema>;

export const projectUpdateSchema = z.object({
  projectId: z.number().min(1, { message: 'Project ID is required' }),
  projectName: z
    .string()
    .min(3, { message: 'Project name must be at least 3 characters' }),
});

export type ProjectUpdateSchema = z.infer<typeof projectUpdateSchema>;

export const projectMemberAddOrRemove = z.object({
  projectId: z.number().min(1, { message: 'Project ID is required' }),
  memberEmail: z.string().email({ message: 'Invalid email address' }),
});

export type ProjectMemberAddOrRemove = z.infer<typeof projectMemberAddOrRemove>;
