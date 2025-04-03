export interface DataItem {
  categoria: string;
  valor: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
}