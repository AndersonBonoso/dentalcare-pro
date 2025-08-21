'use client';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { useProfile } from '@/lib/useProfile';

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  codigo_barras: string;
  unidade_medida: string;
  quantidade_atual: number;
  quantidade_minima: number;
  preco_custo: number;
  preco_venda: number;
  data_validade: string;
  lote: string;
  ativo: boolean;
  categoria_nome?: string;
  fornecedor_nome?: string;
}

interface Categoria {
  id: string;
  nome: string;
}

interface Fornecedor {
  id: string;
  nome: string;
}

export default function EstoquePage() {
  const { profile } = useProfile();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    codigo_barras: '',
    unidade_medida: 'unidade',
    quantidade_atual: 0,
    quantidade_minima: 0,
    preco_custo: 0,
    preco_venda: 0,
    data_validade: '',
    lote: '',
    categoria_id: '',
    fornecedor_id: '',
    ativo: true
  });

  useEffect(() => {
    if (profile?.clinica_id) {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar produtos com joins
      const { data: produtosData, error: produtosError } = await supabase
        .from('produtos_estoque')
        .select(`
          *,
          categorias_estoque(nome),
          fornecedores(nome)
        `)
        .eq('clinica_id', profile?.clinica_id)
        .order('nome');

      if (produtosError) throw produtosError;

      const produtosFormatados = produtosData?.map(produto => ({
        ...produto,
        categoria_nome: produto.categorias_estoque?.nome || 'Sem categoria',
        fornecedor_nome: produto.fornecedores?.nome || 'Sem fornecedor'
      })) || [];

      setProdutos(produtosFormatados);

      // Carregar categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias_estoque')
        .select('*')
        .eq('clinica_id', profile?.clinica_id)
        .order('nome');

      if (categoriasError) throw categoriasError;
      setCategorias(categoriasData || []);

      // Carregar fornecedores
      const { data: fornecedoresData, error: fornecedoresError } = await supabase
        .from('fornecedores')
        .select('*')
        .eq('clinica_id', profile?.clinica_id)
        .order('nome');

      if (fornecedoresError) throw fornecedoresError;
      setFornecedores(fornecedoresData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados do estoque');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const produtoData = {
        ...formData,
        clinica_id: profile?.clinica_id,
        categoria_id: formData.categoria_id || null,
        fornecedor_id: formData.fornecedor_id || null
      };

      if (editingProduto) {
        const { error } = await supabase
          .from('produtos_estoque')
          .update(produtoData)
          .eq('id', editingProduto.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('produtos_estoque')
          .insert([produtoData]);

        if (error) throw error;
      }

      setShowModal(false);
      setEditingProduto(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto');
    }
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao || '',
      codigo_barras: produto.codigo_barras || '',
      unidade_medida: produto.unidade_medida,
      quantidade_atual: produto.quantidade_atual,
      quantidade_minima: produto.quantidade_minima,
      preco_custo: produto.preco_custo || 0,
      preco_venda: produto.preco_venda || 0,
      data_validade: produto.data_validade || '',
      lote: produto.lote || '',
      categoria_id: '',
      fornecedor_id: '',
      ativo: produto.ativo
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('produtos_estoque')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      codigo_barras: '',
      unidade_medida: 'unidade',
      quantidade_atual: 0,
      quantidade_minima: 0,
      preco_custo: 0,
      preco_venda: 0,
      data_validade: '',
      lote: '',
      categoria_id: '',
      fornecedor_id: '',
      ativo: true
    });
  };

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.codigo_barras?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.categoria_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const produtosEmFalta = produtos.filter(p => p.quantidade_atual <= p.quantidade_minima);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Carregando...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Estoque</h1>
            <p className="text-white/80">Gerencie produtos e materiais da clínica</p>
          </div>
          <button
            onClick={() => {
              setEditingProduto(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            + Novo Produto
          </button>
        </div>

        {/* Alertas */}
        {produtosEmFalta.length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <strong>Atenção!</strong> {produtosEmFalta.length} produto(s) em falta ou abaixo do estoque mínimo.
          </div>
        )}

        {/* Busca */}
        <div className="bg-white rounded-lg p-4">
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Tabela de Produtos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preços
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProdutos.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                        <div className="text-sm text-gray-500">{produto.codigo_barras}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {produto.categoria_nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {produto.quantidade_atual} {produto.unidade_medida}
                      </div>
                      <div className="text-sm text-gray-500">
                        Mín: {produto.quantidade_minima}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Custo: R$ {produto.preco_custo?.toFixed(2) || '0,00'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Venda: R$ {produto.preco_venda?.toFixed(2) || '0,00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        produto.quantidade_atual <= produto.quantidade_minima
                          ? 'bg-red-100 text-red-800'
                          : produto.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {produto.quantidade_atual <= produto.quantidade_minima
                          ? 'Em Falta'
                          : produto.ativo
                          ? 'Ativo'
                          : 'Inativo'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(produto)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(produto.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  {editingProduto ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código de Barras
                      </label>
                      <input
                        type="text"
                        value={formData.codigo_barras}
                        onChange={(e) => setFormData({...formData, codigo_barras: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unidade de Medida
                      </label>
                      <select
                        value={formData.unidade_medida}
                        onChange={(e) => setFormData({...formData, unidade_medida: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="unidade">Unidade</option>
                        <option value="caixa">Caixa</option>
                        <option value="pacote">Pacote</option>
                        <option value="frasco">Frasco</option>
                        <option value="ml">ML</option>
                        <option value="g">Gramas</option>
                        <option value="kg">Quilogramas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoria
                      </label>
                      <select
                        value={formData.categoria_id}
                        onChange={(e) => setFormData({...formData, categoria_id: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecione uma categoria</option>
                        {categorias.map(categoria => (
                          <option key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantidade Atual
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.quantidade_atual}
                        onChange={(e) => setFormData({...formData, quantidade_atual: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantidade Mínima
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.quantidade_minima}
                        onChange={(e) => setFormData({...formData, quantidade_minima: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preço de Custo
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.preco_custo}
                        onChange={(e) => setFormData({...formData, preco_custo: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preço de Venda
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.preco_venda}
                        onChange={(e) => setFormData({...formData, preco_venda: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Validade
                      </label>
                      <input
                        type="date"
                        value={formData.data_validade}
                        onChange={(e) => setFormData({...formData, data_validade: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lote
                      </label>
                      <input
                        type="text"
                        value={formData.lote}
                        onChange={(e) => setFormData({...formData, lote: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      rows={3}
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ativo"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                      Produto ativo
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {editingProduto ? 'Atualizar' : 'Salvar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

