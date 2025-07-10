import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, useTheme } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GoogleIcon from '@mui/icons-material/Google';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { googleDriveService } from '../services/googleDriveService';

interface GoogleDriveManagerProps {
  onFileSelect?: (file: Blob) => void;
}

const GoogleDriveManager: React.FC<GoogleDriveManagerProps> = ({ onFileSelect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('googleAccessToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleAuthenticate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await googleDriveService.authenticate();
      if (!response.success) {
        throw new Error(response.error);
      }
      window.location.href = response.authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao autenticar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleListFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await googleDriveService.listFiles();
      if (!response.success) {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao listar arquivos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await googleDriveService.uploadFile(file);
      if (!response.success) {
        throw new Error(response.error);
      }
      await handleListFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload do arquivo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
        borderRadius: 3,
        boxShadow: 3,
        py: 6,
        mt: 4
      }}
    >
      <img
        src="/images/lucro-financeiro.png"
        alt="Logo"
        style={{ width: 100, marginBottom: 24 }}
      />
      <Typography variant="h3" fontWeight="bold" gutterBottom align="center">
        Gerenciador do Google Drive
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom align="center">
        Importe, edite e gerencie suas finanças de forma simples e segura.
      </Typography>
      <Box mt={4} display="flex" gap={2}>
        <Button
          variant="outlined"
          size="large"
          startIcon={<FolderOpenIcon />}
          component="label"
          disabled={isLoading}
        >
          Importar do Computador
          <input
            type="file"
            hidden
            onChange={handleLocalFileImport}
          />
        </Button>
        {!isAuthenticated ? (
          <Button
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleAuthenticate}
            disabled={isLoading}
          >
            Autenticar
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              size="large"
              startIcon={<CloudUploadIcon />}
              component="label"
              disabled={isLoading}
            >
              Upload de Arquivo
              <input
                type="file"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleListFiles}
              disabled={isLoading}
            >
              Listar Arquivos
            </Button>
          </>
        )}
      </Box>
      {isLoading && <CircularProgress sx={{ mt: 4 }} />}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default GoogleDriveManager; 