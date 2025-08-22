import { z } from 'zod';

export const pacienteSchema = z.object({
  nome: z.string().min(1, 'Obrigatório'),
  data_nascimento: z.string().min(1, 'Obrigatório'),
  nacionalidade: z.enum(['brasileira', 'estrangeira']).default('brasileira'),
  documento_tipo: z.enum(['cpf', 'passaporte']).default('cpf'),
  cpf: z.string().optional().nullable(),
  rg: z.string().optional().nullable(),
  passaporte: z.string().optional().nullable(),
  sexo: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  celular: z.string().optional().nullable(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  responsavel_nome: z.string().optional().nullable(),
  responsavel_parentesco: z.string().optional().nullable(),
  responsavel_telefone: z.string().optional().nullable(),
  responsavel_cpf: z.string().optional().nullable(),
  responsavel_rg: z.string().optional().nullable(),
  responsavel_idade: z.number().optional().nullable(),
  endereco: z.object({
    cep: z.string().optional().nullable(),
    logradouro: z.string().optional().nullable(),
    numero: z.string().optional().nullable(),
    complemento: z.string().optional().nullable(),
    bairro: z.string().optional().nullable(),
    cidade: z.string().optional().nullable(),
    uf: z.string().max(2).optional().nullable(),
  }),
  tipo_atendimento: z.enum(['particular', 'convenio']).default('particular'),
  convenio_id: z.string().optional().nullable(),
  plano_id: z.string().optional().nullable(),
  numero_convenio: z.string().optional().nullable(),
  validade_convenio: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  ativo: z.boolean().default(true),
});

export type PacienteForm = z.infer<typeof pacienteSchema>;
