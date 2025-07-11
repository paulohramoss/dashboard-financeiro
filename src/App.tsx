import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Container, Grid, Paper, Fade, IconButton, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { OAuth2Callback } from './pages/OAuth2Callback';
import { FinanceTable } from './components/FinanceTable';
import GoogleDriveManager from './components/GoogleDriveManager';
import { calculateTotals, updateSobra } from './utils/calculations';
import { DataItem } from './types';
import * as XLSX from 'xlsx';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts';
import CircularProgress from '@mui/material/CircularProgress';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const MainContent: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([
    { categoria: 'Total', valor: 0 },
    { categoria: 'Sobra', valor: 0 }
  ]);
  const [meses, setMeses] = useState<string[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState<number>(0); // índice do mês
  const [planilha, setPlanilha] = useState<any>(null); // worksheet para reprocessar ao trocar mês
  const [tipoGrafico, setTipoGrafico] = useState<'pizza' | 'barra'>('pizza');
  const [loading, setLoading] = useState(false);
  const [arquivoValido, setArquivoValido] = useState(false);

  const handleDataChange = (newData: DataItem[]) => {
    const { orcamentoDisponivel, totalDespesas } = calculateTotals(newData);
    const updatedData = updateSobra(newData, orcamentoDisponivel, totalDespesas);
    setData(updatedData);
  };

  const processarDados = (worksheet: any, mesIndex: number) => {
    const XLSX = require('xlsx');
    const sheetRange = XLSX.utils.decode_range(worksheet['!ref']);
    const newData: { categoria: string; valor: number }[] = [];
    for (let row = 1; row <= sheetRange.e.r; row++) {
      const categoriaCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
      const valorCell = worksheet[XLSX.utils.encode_cell({ r: row, c: mesIndex + 1 })];
      const categoria = categoriaCell ? String(categoriaCell.v) : '';
      const valor = valorCell ? parseFloat(String(valorCell.v).replace(',', '.')) : 0;
      if (categoria && categoria.toLowerCase() !== 'total' && categoria.toLowerCase() !== 'sobra') {
        newData.push({ categoria, valor });
      }
    }
    handleDataChange(newData);
  };

  const handleFileSelect = async (file: Blob) => {
    const nomeArquivo = (file as any).name || '';
    const extensao = nomeArquivo.split('.').pop()?.toLowerCase();
    if (!['pdf', 'xls', 'xlsx'].includes(extensao)) {
      alert('Por favor, selecione um arquivo .pdf, .xls ou .xlsx');
      return;
    }
    setArquivoValido(true);
    try {
      setLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      setPlanilha(worksheet);
      const ref = worksheet['!ref'];
      if (!ref) {
        throw new Error('A referência da planilha está vazia ou inválida.');
      }
      const sheetRange = XLSX.utils.decode_range(ref);
      // Pega o cabeçalho (meses)
      const mesesDetectados: string[] = [];
      for (let col = sheetRange.s.c + 1; col <= sheetRange.e.c; col++) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: col })];
        mesesDetectados.push(cell ? cell.v : '');
      }
      setMeses(mesesDetectados);
      setMesSelecionado(0); // padrão: primeiro mês
      processarDados(worksheet, 0);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMesChange = (event: any) => {
    const novoMes = event.target.value;
    setMesSelecionado(novoMes);
    if (planilha) {
      processarDados(planilha, novoMes);
    }
  };

  // Verifica se só o card está visível
  const somenteCard = !arquivoValido;

  return (
    <Box sx={{
      backgroundColor: 'background.default',
      pt: somenteCard ? 2 : 4,
      pb: somenteCard ? 2 : 8,
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflowX: 'hidden',
      overflowY: 'auto',
    }}>
      {/* Loading Overlay */}
      {loading && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: 'rgba(0,0,0,0.35)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={64} thickness={5} />
            <Box mt={2} color="#fff" fontWeight="bold">Carregando arquivo...</Box>
          </Box>
        </Box>
      )}
      <Container
        sx={{
          width: '100%',
          maxWidth: 1000,
          px: 3,
          py: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={4} justifyContent="center" sx={{ width: '100%' }}>
          <Grid item xs={12} md={8}>
            <Box mb={4}>
              <GoogleDriveManager onFileSelect={handleFileSelect} />
            </Box>
          </Grid>
          {arquivoValido && (
            <>
              <Grid item xs={6}>
                {meses.length > 0 && (
                  <FormControl fullWidth size="medium">
                    <InputLabel id="mes-select-label">Mês</InputLabel>
                    <Select
                      labelId="mes-select-label"
                      value={mesSelecionado}
                      label="Mês"
                      onChange={handleMesChange}
                      size="medium"
                    >
                      {meses.map((mes, idx) => (
                        <MenuItem key={mes} value={idx}>{mes}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item xs={6}>
                {data.length > 2 && (
                  <FormControl fullWidth size="medium">
                    <InputLabel id="tipo-grafico-label">Tipo de Gráfico</InputLabel>
                    <Select
                      labelId="tipo-grafico-label"
                      value={tipoGrafico}
                      label="Tipo de Gráfico"
                      onChange={e => setTipoGrafico(e.target.value as 'pizza' | 'barra')}
                      size="medium"
                    >
                      <MenuItem value="pizza">Pizza</MenuItem>
                      <MenuItem value="barra">Barra</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item xs={12}>
                <Box mt={4} mb={2} textAlign="center">
                  <strong style={{ fontSize: 22 }}>Gráfico de despesas</strong>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, mb: 3, width: '100%', maxWidth: 900, mx: 'auto' }}>
                  <ResponsiveContainer width="100%" height={350}>
                    {tipoGrafico === 'pizza' ? (
                      <PieChart>
                        <Pie
                          data={data.filter(d => d.categoria && d.categoria.toLowerCase() !== 'total' && d.categoria.toLowerCase() !== 'sobra')}
                          dataKey="valor"
                          nameKey="categoria"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          label={({ name }) => name}
                        >
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#fa8072'][index % 8]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                        <Legend />
                      </PieChart>
                    ) : (
                      <BarChart data={data.filter(d => d.categoria && d.categoria.toLowerCase() !== 'total' && d.categoria.toLowerCase() !== 'sobra')}>
                        <XAxis dataKey="categoria" />
                        <YAxis />
                        <Bar dataKey="valor" fill="#8884d8" />
                        <RechartsTooltip formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                        <Legend />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Box mt={4} mb={2} textAlign="center">
                  <strong style={{ fontSize: 22 }}>Tabela de despesas</strong>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Fade in={true}>
                  <Paper sx={{ p: 3, overflowX: 'unset', width: '100%', maxWidth: 900, mx: 'auto' }}>
                    <Box sx={{ width: '100%' }}>
                      <FinanceTable data={data} setData={handleDataChange} />
                    </Box>
                  </Paper>
                </Fade>
              </Grid>
            </>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <IconButton
        sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1300 }}
        onClick={() => setDarkMode((prev) => !prev)}
        color="inherit"
      >
        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth2callback" element={<OAuth2Callback />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 