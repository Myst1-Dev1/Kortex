import { z } from "zod";

export const CreateProjectSchema = z.object({
  author_id: z
    .string()
    .min(1, "ID do autor é obrigatório"),
  name: z
    .string()
    .min(1, "Nome do projeto é obrigatório"),
  description: z
    .string()
    .optional(),
  deadline_for_completion: z
    .string()
    .optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export const InviteEmailSchema = z.object({
  email: z
    .string()
    .email("E-mail inválido")
    .optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type InviteEmailInput = z.infer<typeof InviteEmailSchema>;
