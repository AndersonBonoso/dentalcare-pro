'use client';
import { useState, useEffect, useRef } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

interface SearchResult {
  id: string;
  nome: string;
  tipo: 'Paciente' | 'Profissional';
  email?: string;
  especialidade?: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        // Buscar pacientes
        const { data: pacientes } = await supabaseBrowser
          .from('pacientes')
          .select('id, nome, email')
          .ilike('nome', `%${query}%`)
          .limit(5);

        // Buscar profissionais
        const { data: profissionais } = await supabaseBrowser
          .from('profissionais')
          .select('id, nome, email, especialidade')
          .ilike('nome', `%${query}%`)
          .limit(5);

        const searchResults: SearchResult[] = [
          ...(pacientes || []).map(p => ({
            id: p.id,
            nome: p.nome,
            tipo: 'Paciente' as const,
            email: p.email
          })),
          ...(profissionais || []).map(p => ({
            id: p.id,
            nome: p.nome,
            tipo: 'Profissional' as const,
            email: p.email,
            especialidade: p.especialidade
          }))
        ];

        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
      } catch (error) {
        console.error('Erro na busca:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Buscar pacientes ou profissionais..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          {results.map((result) => (
            <div
              key={`${result.tipo}-${result.id}`}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50"
              onClick={() => {
                // Aqui você pode implementar a navegação para a página específica
                console.log('Clicou em:', result);
                setIsOpen(false);
                setQuery('');
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">{result.nome}</span>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      result.tipo === 'Paciente' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {result.tipo}
                    </span>
                  </div>
                  {result.email && (
                    <p className="text-sm text-gray-500">{result.email}</p>
                  )}
                  {result.especialidade && (
                    <p className="text-sm text-gray-500">{result.especialidade}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

