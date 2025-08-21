'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type Prof = { id: string; nome: string; conselho: string | null; comissao_padrao_percent: number | null; };

export default function ProfissionaisPage() {
  const [items, setItems] = useState<Prof[]>([]);
  const [nome, setNome] = useState('');
  const [conselho, setConselho] = useState('');
  const [comissao, setComissao] = useState<number | ''>('');

  async function load() {
    const { data } = await supabaseBrowser.from('profissionais').select('id,nome,conselho,comissao_padrao_percent').order('created_at', { ascending: false });
    setItems(data ?? []);
  }
  useEffect(()=>{ load(); }, []);

  async function add() {
    const clinica = await supabaseBrowser.from('usuarios').select('clinica_id').limit(1).maybeSingle();
    const { error } = await supabaseBrowser.from('profissionais').insert([{
      nome, conselho: conselho || null,
      comissao_padrao_percent: comissao === '' ? null : Number(comissao),
      clinica_id: clinica.data?.clinica_id
    }]);
    if (!error) { setNome(''); setConselho(''); setComissao(''); load(); }
  }
  async function remove(id: string) {
    await supabaseBrowser.from('profissionais').delete().eq('id', id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="dc-card">
        <h2 className="text-lg font-semibold mb-4">Novo Profissional</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="dc-input" placeholder="Nome" value={nome} onChange={e=>setNome(e.target.value)} />
          <input className="dc-input" placeholder="Conselho (CRO)" value={conselho} onChange={e=>setConselho(e.target.value)} />
          <input className="dc-input" placeholder="Comissão (%)" value={comissao} onChange={e=>setComissao(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <div className="mt-3"><button className="dc-btn-primary" onClick={add}>Adicionar</button></div>
      </div>

      <div className="dc-card">
        <h2 className="text-lg font-semibold mb-4">Profissionais</h2>
        <div className="divide-y">
          {items.map(p => (
            <div key={p.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.nome}</div>
                <div className="text-sm text-slate-500">{p.conselho ?? '—'} · Comissão: {p.comissao_padrao_percent ?? '—'}%</div>
              </div>
              <button onClick={()=>remove(p.id)} className="text-sm text-red-600 hover:underline">Excluir</button>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-slate-500">Nenhum profissional.</div>}
        </div>
      </div>
    </div>
  );
}
