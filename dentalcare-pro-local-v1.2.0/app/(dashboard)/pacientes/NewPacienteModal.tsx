// components/pacientes/NewPacienteModal.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { pacienteSchema as pacienteValidationSchema } from '../../../lib/schemas/paciente';

import ToggleIOS from '../../../components/ui/ToggleIOS';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { fetchCepBrasilAPI } from '../../../lib/cep';
import { getConvenios, getPlanosByConvenio } from '../../../lib/convenios';

// -----------------------------------------------------------------------------
// Schema (zod) – mantém alinhado com a tabela e validações do formulário
// (Se você já tem `pacienteSchema` em '@/lib/schemas/paciente', pode importar e
// trocar este schema por aquele.)
const enderecoSchema = z.object({
  cep: z.string().optional().nullable(),
  logradouro: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  uf: z.string().max(2, 'UF inválida').optional().nullable(),
});

const pacienteSchema = z.object({
  nome: z.string().min(2, 'Informe o nome completo'),
  data_nascimento: z.string().min(10, 'Data inválida (dd/mm/aaaa)'),
  // Documento: condicionado por nacionalidade abaixo
  cpf: z.string().optional().nullable(),
  rg: z.string().optional().nullable(),
  passaporte: z.string().optional().nullable(),

  sexo: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  celular: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable(),

  nacionalidade: z.enum(['brasileira', 'estrangeira']),
  documento_tipo: z.enum(['cpf', 'passaporte']),

  // Responsável (só aparece < 18)
  responsavel_nome: z.string().optional().nullable(),
  responsavel_parentesco: z.string().optional().nullable(),
  responsavel_telefone: z.string().optional().nullable(),
  responsavel_cpf: z.string().optional().nullable(),
  responsavel_rg: z.string().optional().nullable(),
  responsavel_idade: z.number().optional().nullable(),

  endereco: enderecoSchema,

  // Financeiro
  tipo_atendimento: z.enum(['particular', 'convenio']),
  convenio_id: z.string().optional().nullable(),
  plano_id: z.string().optional().nullable(),
  numero_convenio: z.string().optional().nullable(),
  validade_convenio: z.string().optional().nullable(),

  observacoes: z.string().optional().nullable(),
  ativo: z.boolean().default(true),
});

type FormValues = z.infer<typeof pacienteSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  clinicaId?: string; // opcional – se não vier, o payload é inserido sem clinica_id
};

// -----------------------------------------------------------------------------
// Helpers
function maskCPF(v: string) {
  return v
    .replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
function maskCEP(v: string) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}
function maskTel(v: string) {
  const n = v.replace(/\D/g, '').slice(0, 11);
  if (n.length <= 10) return n.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  return n.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
}
function maskDate(v: string) {
  return v.replace(/\D/g, '').slice(0, 8)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
}
function ddmmyyyyToISO(d: string | null | undefined) {
  if (!d) return null;
  const [dd, mm, yyyy] = d.split('/');
  if (!dd || !mm || !yyyy) return null;
  return `${yyyy}-${mm}-${dd}`;
}
function calcAgeFromDDMMYYYY(d: string) {
  const iso = ddmmyyyyToISO(d);
  if (!iso) return 0;
  const birth = new Date(iso);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// -----------------------------------------------------------------------------
export default function NewPacienteModal({ open, onClose, clinicaId }: Props) {
  const [tab, setTab] = useState<'gerais' | 'endereco' | 'financeiro'>('gerais');
  const [nacionalBrasileira, setNacionalBrasileira] = useState(true);
  const [tipoParticular, setTipoParticular] = useState(true);
  const [convenios, setConvenios] = useState<{ id: string; nome: string }[]>([]);
  const [planos, setPlanos] = useState<{ id: string; nome: string }[]>([]);
  const [loadingCEP, setLoadingCEP] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: {
      nome: '',
      data_nascimento: '',
      cpf: '',
      rg: '',
      passaporte: '',
      sexo: '',
      telefone: '',
      celular: '',
      email: '',
      nacionalidade: 'brasileira',
      documento_tipo: 'cpf',
      responsavel_nome: '',
      responsavel_parentesco: '',
      responsavel_telefone: '',
      responsavel_cpf: '',
      responsavel_rg: '',
      responsavel_idade: undefined,
      endereco: {
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: '',
      },
      tipo_atendimento: 'particular',
      convenio_id: null,
      plano_id: null,
      numero_convenio: '',
      validade_convenio: '',
      observacoes: '',
      ativo: true,
    },
    mode: 'onBlur',
  });

  // idade & responsável condicional
  const idade = useMemo(
    () => calcAgeFromDDMMYYYY(form.watch('data_nascimento')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.watch('data_nascimento')]
  );
  const showResponsavel = idade > 0 && idade < 18;

  // carrega convênios
  useEffect(() => {
    getConvenios().then(setConvenios).catch(console.error);
  }, []);

  // carrega planos quando muda o convênio
  useEffect(() => {
    const cid = form.watch('convenio_id');
    if (!cid) { setPlanos([]); return; }
    getPlanosByConvenio(cid).then(setPlanos).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch('convenio_id')]);

  // sync toggles -> campos zod
  useEffect(() => {
    form.setValue('nacionalidade', nacionalBrasileira ? 'brasileira' : 'estrangeira');
    form.setValue('documento_tipo', nacionalBrasileira ? 'cpf' : 'passaporte');
  }, [nacionalBrasileira, form]);

  useEffect(() => {
    form.setValue('tipo_atendimento', tipoParticular ? 'particular' : 'convenio');
  }, [tipoParticular, form]);

  if (!open) return null;

  const onCepBlur = async () => {
    const cepMasked = form.getValues('endereco.cep') || '';
    const cep = cepMasked.replace(/\D/g, '');
    if (cep.length !== 8) return;
    try {
      setLoadingCEP(true);
      const addr = await fetchCepBrasilAPI(cep);
      if (addr) {
        form.setValue('endereco.logradouro', addr.logradouro || '');
        form.setValue('endereco.bairro', addr.bairro || '');
        form.setValue('endereco.cidade', addr.cidade || '');
        form.setValue('endereco.uf', addr.uf || '');
      }
    } finally {
      setLoadingCEP(false);
    }
  };

  const onSubmit = async (values: PacienteForm) => {
    // normalização do payload
    const payload: any = {
      clinica_id: clinicaId ?? null,

      nome: values.nome,
      cpf: values.documento_tipo === 'cpf' ? values.cpf?.replace(/\D/g, '') || null : null,
      rg: values.documento_tipo === 'cpf' ? values.rg || null : null,
      passaporte: values.documento_tipo === 'passaporte' ? values.passaporte || null : null,
      data_nascimento: ddmmyyyyToISO(values.data_nascimento),

      sexo: values.sexo || null,
      telefone: values.telefone || null,
      celular: values.celular || null,
      email: values.email || null,

      nacionalidade: values.nacionalidade,
      documento_tipo: values.documento_tipo,

      responsavel_nome: showResponsavel ? values.responsavel_nome || null : null,
      responsavel_parentesco: showResponsavel ? values.responsavel_parentesco || null : null,
      responsavel_telefone: showResponsavel ? values.responsavel_telefone || null : null,
      responsavel_cpf: showResponsavel
        ? values.responsavel_cpf?.replace(/\D/g, '') || null
        : null,
      responsavel_rg: showResponsavel ? values.responsavel_rg || null : null,
      responsavel_idade: showResponsavel
        ? (values.responsavel_idade ?? null)
        : null,

      endereco: {
        cep: values.endereco?.cep?.replace(/\D/g, '') || null,
        logradouro: values.endereco?.logradouro || null,
        numero: values.endereco?.numero || null,
        complemento: values.endereco?.complemento || null,
        bairro: values.endereco?.bairro || null,
        cidade: values.endereco?.cidade || null,
        uf: values.endereco?.uf || null,
      },
      cep: values.endereco?.cep?.replace(/\D/g, '') || null,

      tipo_atendimento: values.tipo_atendimento,
      convenio_id: values.tipo_atendimento === 'convenio' ? values.convenio_id : null,
      plano_id: values.tipo_atendimento === 'convenio' ? values.plano_id : null,
      numero_convenio:
        values.tipo_atendimento === 'convenio' ? values.numero_convenio || null : null,
      validade_convenio:
        values.tipo_atendimento === 'convenio'
          ? ddmmyyyyToISO(values.validade_convenio || '')
          : null,

      observacoes: values.observacoes || null,
      ativo: !!values.ativo,
    };

    const { error } = await supabaseBrowser.from('pacientes').insert(payload);
    if (error) {
      alert(`Erro ao salvar: ${error.message}`);
      return;
    }
    onClose();
    form.reset();
    setTab('gerais');
    setTipoParticular(true);
    setNacionalBrasileira(true);
  };

  // -----------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold">Novo Paciente</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {[
              { k: 'gerais', label: 'Dados Gerais' },
              { k: 'endereco', label: 'Endereço' },
              { k: 'financeiro', label: 'Financeiro' },
            ].map(({ k, label }) => (
              <button
                key={k}
                onClick={() => setTab(k as any)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition
                ${tab === k
                  ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-6 pt-4">
          {/* TAB: DADOS GERAIS */}
          {tab === 'gerais' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Nome Completo *</label>
                <input
                  {...form.register('nome')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
                <p className="text-xs text-red-500">{form.formState.errors.nome?.message}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Data de Nascimento *</label>
                <input
                  {...form.register('data_nascimento')}
                  onChange={(e) =>
                    form.setValue('data_nascimento', maskDate(e.target.value))
                  }
                  placeholder="dd/mm/aaaa"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500">Idade: {idade || '—'}</p>
              </div>

              {/* Nacionalidade / Documento */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Nacionalidade / Documento</label>
                <ToggleIOS
                  checked={nacionalBrasileira}
                  onChange={setNacionalBrasileira}
                  labelLeft="Estrangeira"
                  labelRight="Brasileira"
                />

                {nacionalBrasileira ? (
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">CPF *</label>
                      <input
                        {...form.register('cpf')}
                        onChange={(e) =>
                          form.setValue('cpf', maskCPF(e.target.value))
                        }
                        placeholder="000.000.000-00"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                      />
                      <p className="text-xs text-red-500">
                        {form.formState.errors.cpf?.message as any}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">RG</label>
                      <input
                        {...form.register('rg')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <label className="text-sm font-medium">Passaporte *</label>
                    <input
                      {...form.register('passaporte')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-red-500">
                      {form.formState.errors.passaporte?.message as any}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Telefone</label>
                <input
                  {...form.register('telefone')}
                  onChange={(e) =>
                    form.setValue('telefone', maskTel(e.target.value))
                  }
                  placeholder="(00) 0000-0000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Celular</label>
                <input
                  {...form.register('celular')}
                  onChange={(e) =>
                    form.setValue('celular', maskTel(e.target.value))
                  }
                  placeholder="(00) 00000-0000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  {...form.register('email')}
                  type="email"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
                <p className="text-xs text-red-500">{form.formState.errors.email?.message}</p>
              </div>

              {/* Responsável (só <18) */}
              {showResponsavel && (
                <>
                  <div className="col-span-2 mt-4 border-t pt-2 text-sm font-semibold">
                    Responsável
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <input
                      {...form.register('responsavel_nome')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Parentesco</label>
                    <input
                      {...form.register('responsavel_parentesco')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Telefone</label>
                    <input
                      {...form.register('responsavel_telefone')}
                      onChange={(e) =>
                        form.setValue('responsavel_telefone', maskTel(e.target.value))
                      }
                      placeholder="(00) 00000-0000"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">CPF</label>
                    <input
                      {...form.register('responsavel_cpf')}
                      onChange={(e) =>
                        form.setValue('responsavel_cpf', maskCPF(e.target.value))
                      }
                      placeholder="000.000.000-00"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">RG</label>
                    <input
                      {...form.register('responsavel_rg')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Idade</label>
                    <input
                      type="number"
                      min={0}
                      {...form.register('responsavel_idade', { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB: ENDEREÇO */}
          {tab === 'endereco' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">CEP</label>
                <input
                  {...form.register('endereco.cep')}
                  onChange={(e) =>
                    form.setValue('endereco.cep', maskCEP(e.target.value))
                  }
                  onBlur={onCepBlur}
                  placeholder="00000-000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
                {loadingCEP && (
                  <p className="text-xs text-gray-500">Buscando endereço…</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Logradouro</label>
                <input
                  {...form.register('endereco.logradouro')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Número</label>
                <input
                  {...form.register('endereco.numero')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Complemento</label>
                <input
                  {...form.register('endereco.complemento')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bairro</label>
                <input
                  {...form.register('endereco.bairro')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cidade</label>
                <input
                  {...form.register('endereco.cidade')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium">UF</label>
                <input
                  {...form.register('endereco.uf')}
                  maxLength={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 uppercase outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB: FINANCEIRO */}
          {tab === 'financeiro' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Tipo de Atendimento</label>
                <ToggleIOS
                  checked={tipoParticular}
                  onChange={setTipoParticular}
                  labelLeft="Convênio"
                  labelRight="Particular"
                />
              </div>

              {tipoParticular ? (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Observações</label>
                  <textarea
                    {...form.register('observacoes')}
                    className="min-h-[96px] w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium">Convênio *</label>
                    <select
                      {...form.register('convenio_id')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                    >
                      <option value="">Selecione…</option>
                      {convenios.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Plano *</label>
                    <select
                      {...form.register('plano_id')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                    >
                      <option value="">Selecione…</option>
                      {planos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Número da carteirinha *</label>
                    <input
                      {...form.register('numero_convenio')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Validade</label>
                    <input
                      {...form.register('validade_convenio')}
                      onChange={(e) =>
                        form.setValue('validade_convenio', maskDate(e.target.value))
                      }
                      placeholder="dd/mm/aaaa"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Rodapé */}
          <div className="mt-6 flex items-center justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2 font-medium text-white hover:opacity-95"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
