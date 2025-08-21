'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type Profile = { 
  nome: string | null; 
  is_master: boolean; 
  clinica_id: string | null;
  permissoes?: {
    agendamento: boolean;
    checkout: boolean;
    pacientes: boolean;
    profissionais: boolean;
  };
};

export function useProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const sb = supabaseBrowser;
    let mounted = true;

    async function load() {
      setLoading(true);
      const { data: { user } } = await sb.auth.getUser();
      if (!user) {
        if (mounted) { 
          setProfile(null); 
          setLoading(false); 
        }
        return;
      }
      
      // Buscar dados do usuário
      const { data: userData, error: userError } = await sb
        .from('usuarios')
        .select('nome, is_master, clinica_id, auth_user_id')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      
      if (!mounted) return;
      
      if (userError || !userData) {
        setProfile({ nome: user.email ?? 'Usuário', is_master: false, clinica_id: null });
        setLoading(false);
        return;
      }

      let permissoes = undefined;
      
      // Se não é master, buscar permissões específicas
      if (!userData.is_master) {
        const { data: permissoesData } = await sb
          .from('permissoes_usuarios')
          .select('agendamento, checkout, pacientes, profissionais')
          .eq('usuario_id', userData.auth_user_id)
          .maybeSingle();
        
        permissoes = {
          agendamento: permissoesData?.agendamento ?? false,
          checkout: permissoesData?.checkout ?? false,
          pacientes: permissoesData?.pacientes ?? false,
          profissionais: permissoesData?.profissionais ?? false,
        };
      }

      setProfile({ 
        nome: userData.nome ?? (user.email ?? 'Usuário'), 
        is_master: !!userData.is_master,
        clinica_id: userData.clinica_id,
        permissoes
      });
      setLoading(false);
    }

    load();
    const { data: sub } = sb.auth.onAuthStateChange((_e) => { load(); });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  return { loading, profile };
}
