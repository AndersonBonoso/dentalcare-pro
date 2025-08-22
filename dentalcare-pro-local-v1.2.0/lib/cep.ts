// lib/cep.ts
export type Endereco = {
    cep?: string | null;
    logradouro?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    uf?: string | null;
  };
  
  function normDigits8(v: string) {
    return (v || '').replace(/\D/g, '').slice(0, 8);
  }
  
  // Abort com timeout simples
  async function fetchWithTimeout(url: string, ms = 6000) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), ms);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      return r;
    } finally {
      clearTimeout(id);
    }
  }
  
  /**
   * Busca CEP usando provedores estáveis (sem ViaCEP):
   * 1) BrasilAPI v2  https://brasilapi.com.br/api/cep/v2/{cep}
   * 2) AwesomeAPI    https://cep.awesomeapi.com.br/json/{cep}
   * 3) API CEP       https://cdn.apicep.com/file/apicep/{cep}.json
   */
  export async function fetchCepBrasilAPI(cepRaw: string): Promise<Endereco | null> {
    const cep = normDigits8(cepRaw);
    if (cep.length !== 8) return null;
  
    // 1) BrasilAPI v2
    try {
      const r = await fetchWithTimeout(`https://brasilapi.com.br/api/cep/v2/${cep}`);
      if (r.ok) {
        const j: any = await r.json();
        return {
          cep,
          logradouro: j.street ?? null,
          bairro: j.neighborhood ?? null,
          cidade: j.city ?? null,
          uf: j.state ?? null,
        };
      }
    } catch {}
  
    // 2) AwesomeAPI
    try {
      const r = await fetchWithTimeout(`https://cep.awesomeapi.com.br/json/${cep}`);
      if (r.ok) {
        const j: any = await r.json();
        if (!j.erro && !j.error) {
          return {
            cep,
            logradouro: j.address ?? null,
            bairro: j.district ?? null,
            cidade: j.city ?? null,
            uf: j.state ?? null,
          };
        }
      }
    } catch {}
  
    // 3) API CEP (apicep)
    try {
      const r = await fetchWithTimeout(`https://cdn.apicep.com/file/apicep/${cep}.json`);
      if (r.ok) {
        const j: any = await r.json();
        if (!j?.status || j?.status === 200) {
          return {
            cep,
            logradouro: j.address ?? null,
            bairro: j.district ?? null,
            cidade: j.city ?? null,
            uf: j.state ?? null,
          };
        }
      }
    } catch {}
  
    return null;
  }
  