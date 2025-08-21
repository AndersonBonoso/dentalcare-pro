'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type Servico = { id: string; nome: string; preco_base: number; duracao_min: number | null; comissao_padrao_percent: number | null; };

export default function ServicosPage() {
  const [items, setItems] = useState<Servico[]>([]);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState<number | ''>('');
  const [duracao, setDuracao] = useState<number | ''>('');
  const [comissao, setComissao] = useState<number | ''>('');

  async function load() {
    const { data } = await supabaseBrowser.from('catalogo_servicos').select('id,nome,preco_base,duracao_min,comissao_padrao_percent').order('created_at', { ascending: false });
    setItems(data ?? []);
  }
  useEffect(()=>{ load(); }, []);

  async function add() {
    const clinica = await supabaseBrowser.from('usuarios').select('clinica_id').limit(1).maybeSingle();
    const { error } = await supabaseBrowser.from('catalogo_servicos').insert([{
      nome,
      preco_base: Number(preco || 0),
      duracao_min: duracao === '' ? null : Number(duracao),
      comissao_padrao_percent: comissao === '' ? null : Number(comissao),
      clinica_id: clinica.data?.clinica_id
    }]);
    if (!error) { setNome(''); setPreco(''); setDuracao(''); setComissao(''); load(); }
  }

  async function remove(id: string) {
    await supabaseBrowser.from('catalogo_servicos').delete().eq('id', id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="dc-card">
        <h2 className="text-lg font-semibold mb-4">Novo Serviço</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="dc-input" placeholder="Nome" value={nome} onChange={e=>setNome(e.target.value)} />
          <input className="dc-input" placeholder="Preço base (R$)" value={preco} onChange={e=>setPreco(e.target.value === '' ? '' : Number(e.target.value))} />
          <input className="dc-input" placeholder="Duração (min)" value={duracao} onChange={e=>setDuracao(e.target.value === '' ? '' : Number(e.target.value))} />
          <input className="dc-input" placeholder="Comissão padrão (%)" value={comissao} onChange={e=>setComissao(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <div className="mt-3"><button className="dc-btn-primary" onClick={add}>Adicionar</button></div>
      </div>

      <div className="dc-card">
        <h2 className="text-lg font-semibold mb-4">Serviços</h2>
        <div className="divide-y">
          {items.map(s => (
            <div key={s.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{s.nome}</div>
                <div className="text-sm text-slate-500">R$ {s.preco_base?.toFixed?.(2) ?? s.preco_base} · {s.duracao_min ?? '—'} min · Comissão {s.comissao_padrao_percent ?? '—'}%</div>
              </div>
              <button onClick={()=>remove(s.id)} className="text-sm text-red-600 hover:underline">Excluir</button>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-slate-500">Nenhum serviço.</div>}
        </div>
      </div>
    </div>
  );
}
