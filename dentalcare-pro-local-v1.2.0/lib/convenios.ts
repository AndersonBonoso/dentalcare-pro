// lib/convenios.ts
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export type Convenio = { id: string; nome: string };
export type Plano = { id: string; convenio_id: string; nome: string };

// ==== Fallback estático (pode ser ampliado depois) ====
const STATIC_CONVENIOS: Convenio[] = [
  { id: 'amil', nome: 'Amil Dental' },
  { id: 'bradesco', nome: 'Bradesco Dental' },
  { id: 'sulamerica', nome: 'SulAmérica Odonto' },
  { id: 'porto', nome: 'Porto Seguro Odonto' },
  { id: 'odontoprev', nome: 'OdontoPrev' },
  { id: 'unimed', nome: 'Unimed Odonto' },
  { id: 'hapvida', nome: 'Hapvida NotreDame Odonto' },
  { id: 'allianz', nome: 'Allianz Dental' },
];

const STATIC_PLANOS: Plano[] = [
  // Amil
  { id: 'amil-essencial', convenio_id: 'amil', nome: 'Essencial' },
  { id: 'amil-plus', convenio_id: 'amil', nome: 'Plus' },
  { id: 'amil-premium', convenio_id: 'amil', nome: 'Premium' },
  // Bradesco
  { id: 'brad-essencial', convenio_id: 'bradesco', nome: 'Essencial' },
  { id: 'brad-top', convenio_id: 'bradesco', nome: 'Top' },
  // SulAmérica
  { id: 'sula-basic', convenio_id: 'sulamerica', nome: 'Basic' },
  { id: 'sula-max', convenio_id: 'sulamerica', nome: 'Max' },
  // Porto
  { id: 'porto-light', convenio_id: 'porto', nome: 'Light' },
  { id: 'porto-total', convenio_id: 'porto', nome: 'Total' },
  // OdontoPrev
  { id: 'oprev-empresa', convenio_id: 'odontoprev', nome: 'Empresa' },
  { id: 'oprev-familia', convenio_id: 'odontoprev', nome: 'Família' },
  // Unimed
  { id: 'uni-essencial', convenio_id: 'unimed', nome: 'Essencial' },
  { id: 'uni-executivo', convenio_id: 'unimed', nome: 'Executivo' },
  // Hapvida
  { id: 'hap-odonto', convenio_id: 'hapvida', nome: 'Odonto' },
  { id: 'hap-odonto-plus', convenio_id: 'hapvida', nome: 'Odonto Plus' },
  // Allianz
  { id: 'all-basic', convenio_id: 'allianz', nome: 'Basic' },
  { id: 'all-premium', convenio_id: 'allianz', nome: 'Premium' },
];

// cache simples em memória
let cacheConvenios: Convenio[] | null = null;
const cachePlanos = new Map<string, Plano[]>();

export async function getConvenios(): Promise<Convenio[]> {
  // cache
  if (cacheConvenios) return cacheConvenios;

  // tenta no Supabase
  try {
    const { data, error } = await supabaseBrowser
      .from('convenios')
      .select('id,nome')
      .order('nome', { ascending: true });

    if (!error && data && data.length) {
      cacheConvenios = data as Convenio[];
      return cacheConvenios;
    }
  } catch {
    // ignora e usa fallback
  }

  // fallback estático
  cacheConvenios = STATIC_CONVENIOS;
  return cacheConvenios;
}

export async function getPlanosByConvenio(convenioId: string): Promise<Plano[]> {
  if (!convenioId) return [];

  // cache
  if (cachePlanos.has(convenioId)) return cachePlanos.get(convenioId)!;

  // tenta no Supabase
  try {
    const { data, error } = await supabaseBrowser
      .from('planos')
      .select('id,convenio_id,nome')
      .eq('convenio_id', convenioId)
      .order('nome', { ascending: true });

    if (!error && data && data.length) {
      cachePlanos.set(convenioId, data as Plano[]);
      return data as Plano[];
    }
  } catch {
    // ignora e usa fallback
  }

  // fallback estático
  const planos = STATIC_PLANOS.filter((p) => p.convenio_id === convenioId);
  cachePlanos.set(convenioId, planos);
  return planos;
}
