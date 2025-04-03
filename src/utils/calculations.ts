import { DataItem } from '../types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const parseCurrency = (value: string): number => {
  const numericValue = value.replace(/[^\d,-]/g, '').replace(',', '.');
  return parseFloat(numericValue) || 0;
};

export const calculateTotals = (data: DataItem[]) => {
  // Encontra o valor do orçamento disponível (Total)
  const orcamentoDisponivel = data.find(item => item.categoria === 'Total')?.valor || 0;
  
  // Soma todas as despesas (excluindo 'Total' e 'Sobra')
  const totalDespesas = data
    .filter(item => !['Total', 'Sobra'].includes(item.categoria))
    .reduce((sum, item) => sum + item.valor, 0);
  
  // Calcula a sobra (Orçamento Disponível - Total de Despesas)
  const sobra = orcamentoDisponivel - totalDespesas;
  
  return { orcamentoDisponivel, totalDespesas, sobra };
};

export const updateSobra = (data: DataItem[], orcamentoDisponivel: number, totalDespesas: number): DataItem[] => {
  const sobra = orcamentoDisponivel - totalDespesas;
  const sobraIndex = data.findIndex(item => item.categoria === 'Sobra');
  
  if (sobraIndex !== -1) {
    data[sobraIndex].valor = sobra;
  } else {
    data.push({ categoria: 'Sobra', valor: sobra });
  }
  
  return data;
}; 