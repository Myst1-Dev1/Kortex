import { z } from "zod";

export const CreateTaskSchema = z.object({
  project_id: z.string().uuid("ID do projeto é obrigatório"),
  assigned_user_id: z.string().uuid().optional(),
  name: z
    .string()
    .min(1, "Nome da tarefa é obrigatório")
    .max(255, "Nome deve ter no máximo 255 caracteres"),
  description: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(5000, "Descrição deve ter no máximo 5000 caracteres"),
  time_estimated: z
    .string()
    .max(100, "Tempo estimado deve ter no máximo 100 caracteres")
    .optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

export const UpdateTaskStatusSchema = z.object({
  status: z.string().min(1, "Status é obrigatório"),
  time_concluded: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusSchema>;
