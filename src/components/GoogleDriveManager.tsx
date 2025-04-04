import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { googleDriveService } from '../services/googleDriveService';

interface GoogleDriveManagerProps {
  onFileSelect?: (file: Blob) => void;
}

const GoogleDriveManager: React.FC<GoogleDriveManagerProps> = ({ onFileSelect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      // Abrir a URL de autenticação em uma nova janela
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
      setFiles(response.files);
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
      // Atualizar a lista de arquivos após o upload
      await handleListFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload do arquivo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Gerenciador do Google Drive
      </Typography>

      <Box sx={{ mb: 3 }}>
        {!isAuthenticated ? (
          <Button
            variant="contained"
            onClick={handleAuthenticate}
            disabled={isLoading}
          >
            Autenticar
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              onClick={handleListFiles}
              disabled={isLoading}
              sx={{ mr: 2 }}
            >
              Listar Arquivos
            </Button>
            <Button
              variant="contained"
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
          </>
        )}
      </Box>

      {isLoading && <CircularProgress />}

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {files.length > 0 && (
        <List>
          {files.map((file) => (
            <ListItem key={file.id}>
              <ListItemText
                primary={file.name}
                secondary={
                  <a href={file.webViewLink} target="_blank" rel="noopener noreferrer">
                    Abrir no Google Drive
                  </a>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default GoogleDriveManager; 