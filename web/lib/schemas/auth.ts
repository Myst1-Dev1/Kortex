import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail obrigatório")
    .email("E-mail inválido"),
  password: z
    .string()
    .min(1, "Senha obrigatória"),
});

export const RegisterSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z
      .string()
      .min(1, "E-mail obrigatório")
      .email("E-mail inválido"),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
      .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
