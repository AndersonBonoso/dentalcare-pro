'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type Pagamento = {
  id: string;
  metodo: string;
  parcelas: number;
  valor_total: number;
  status: string;
  provider: string;
  provider_reference: string | null;
  created_at: string;
};

export default function FinanceiroPage() {
  const [items, setItems] = useState<Pagamento[]>([]);
  const [amount, setAmount] = useState<number | ''>('');
  const [descricao, setDescricao] = useState('');
  const [parcelas, setParcelas] = useState(1);
  const [metodo, setMetodo] = useState<'cartao'|'pix'>('cartao');
  const [link, setLink] = useState<string>('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabaseBrowser.from('pagamentos').select('*').order('created_at', { ascending: false }).limit(50);
    setItems(data ?? []);
    setLoading(false);
  }
  useEffect(()=>{ load(); }, []);

  async function criarLink() {
    setLink('');
    if (amount === '' || Number(amount) <= 0) return;
    // cria registro pendente e chama API para gerar link
    const clinica = await supabaseBrowser.from('usuarios').select('clinica_id').limit(1).maybeSingle();
    const { data: inserted, error } = await supabaseBrowser.from('pagamentos').insert([{
      clinica_id: clinica.data?.clinica_id,
      atendimento_id: null,
      provider: 'stripe',
      metodo: metodo,
      parcelas: parcelas,
      valor_total: Number(amount),
      status: 'pendente',
      provider_reference: null
    }]).select('*').single();
    if (error) return;

    const res = await fetch('/api/payments/create-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pagamentoId: inserted.id,
        amount: Math.round(Number(amount) * 100),
        description: descricao || 'Pagamento DentalCare Pro',
        installments: parcelas,
        method: metodo
      })
    });
    const json = await res.json();
    if (json.url) setLink(json.url);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="dc-card space-y-3">
        <h2 className="text-lg font-semibold">Gerar Link de Pagamento</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="dc-input" placeholder="Valor (R$)" value={amount} onChange={e=>setAmount(e.target.value === '' ? '' : Number(e.target.value))} />
          <select className="dc-input" value={metodo} onChange={e=>setMetodo(e.target.value as any)}>
            <option value="cartao">Cartão</option>
            <option value="pix">Pix</option>
          </select>
          <input className="dc-input" placeholder="Parcelas (1..12)" type="number" min={1} max={12} value={parcelas} onChange={e=>setParcelas(Number(e.target.value))} />
          <input className="dc-input" placeholder="Descrição" value={descricao} onChange={e=>setDescricao(e.target.value)} />
        </div>
        <div><button className="dc-btn-primary" onClick={criarLink}>Criar link</button></div>
        {link && <div className="text-sm">Link: <a className="dc-link" href={link} target="_blank">Abrir Checkout</a></div>}
      </div>

      <div className="dc-card">
        <h2 className="text-lg font-semibold mb-3">Pagamentos (últimos 50)</h2>
        {loading ? <div>Carregando…</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2">Data</th><th>Método</th><th>Parcelas</th><th>Valor</th><th>Status</th><th>Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map(p => (
                  <tr key={p.id}>
                    <td className="py-2">{new Date(p.created_at).toLocaleString('pt-BR')}</td>
                    <td>{p.metodo}</td>
                    <td>{p.parcelas}</td>
                    <td>R$ {Number(p.valor_total).toFixed(2)}</td>
                    <td>{p.status}</td>
                    <td className="truncate max-w-[160px]">{p.provider_reference ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && <div className="text-sm text-slate-500">Nenhum pagamento.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
