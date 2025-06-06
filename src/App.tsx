import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Container, Grid, Paper, Fade } from '@mui/material';
import { theme } from './theme';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { OAuth2Callback } from './pages/OAuth2Callback';
import { FinanceTable } from './components/FinanceTable';
import GoogleDriveManager from './components/GoogleDriveManager';
import { calculateTotals, updateSobra } from './utils/calculations';
import { DataItem } from './types';
import * as XLSX from 'xlsx';
import { AuthProvider, useAuth } from './contexts/AuthContext';

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

  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTable(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleDataChange = (newData: DataItem[]) => {
    const { orcamentoDisponivel, totalDespesas } = calculateTotals(newData);
    const updatedData = updateSobra(newData, orcamentoDisponivel, totalDespesas);
    setData(updatedData);
  };

  const handleFileSelect = async (file: Blob) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const newData = jsonData.map((row: any) => ({
        categoria: row.Categoria || '',
        valor: parseFloat(row.Valor) || 0
      }));

      handleDataChange(newData);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: 'background.default',
      pt: 4,
      pb: 8
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box mb={3}>
              <GoogleDriveManager onFileSelect={handleFileSelect} />
            </Box>
          </Grid>
          {showTable && (
            <Grid item xs={12}>
              <Fade in={showTable}>
                <Paper sx={{ p: 3 }}>
                  <FinanceTable data={data} setData={handleDataChange} />
                </Paper>
              </Fade>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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