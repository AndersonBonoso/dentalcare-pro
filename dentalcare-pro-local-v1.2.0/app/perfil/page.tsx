'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function PerfilPage() {
  const [email, setEmail] = useState<string>('');
  const [nome, setNome] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (user) {
        setEmail(user.email ?? '');
        const { data } = await supabaseBrowser.from('usuarios').select('nome').eq('auth_user_id', user.id).maybeSingle();
        setNome(data?.nome ?? '');
      }
    })();
  }, []);

  async function salvar() {
    setSaving(true); setMsg('');
    const { data: { user } } = await supabaseBrowser.auth.getUser();
    if (!user) { setMsg('Não autenticado.'); setSaving(false); return; }
    const { error } = await supabaseBrowser.from('usuarios').update({ nome }).eq('auth_user_id', user.id);
    if (error) setMsg('Erro ao salvar: ' + error.message);
    else setMsg('Perfil atualizado com sucesso!');
    setSaving(false);
  }

  return (
    <div className="max-w-xl">
      <div className="dc-card space-y-4">
        <h1 className="text-xl font-semibold">Meu Perfil</h1>
        <div>
          <label className="block text-sm font-medium mb-1">E-mail</label>
          <input className="dc-input" value={email} disabled />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input className="dc-input" value={nome} onChange={e=>setNome(e.target.value)} placeholder="Seu nome" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={salvar} disabled={saving} className="dc-btn-primary">{saving ? 'Salvando...' : 'Salvar'}</button>
          {msg && <span className="text-sm text-slate-600">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
