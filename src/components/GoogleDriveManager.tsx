import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { GoogleDriveService } from '../services/googleDrive';

interface GoogleDriveManagerProps {
  onFileSelect: (file: Blob) => void;
}

export const GoogleDriveManager: React.FC<GoogleDriveManagerProps> = ({ onFileSelect }) => {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const driveService = new GoogleDriveService();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const fileList = await driveService.listFiles();
      if (fileList) {
        setFiles(fileList);
      }
    } catch (error) {
      setError('Erro ao carregar arquivos. Tente novamente.');
      console.error('Erro ao carregar arquivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      await driveService.uploadFile(file);
      await loadFiles();
    } catch (error) {
      setError('Erro ao fazer upload do arquivo. Tente novamente.');
      console.error('Erro ao fazer upload:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDownload = async (fileId: string) => {
    try {
      setLoading(true);
      setError(null);
      const file = await driveService.downloadFile(fileId);
      if (file) {
        onFileSelect(file);
        handleClose();
      }
    } catch (error) {
      setError('Erro ao baixar arquivo. Tente novamente.');
      console.error('Erro ao baixar arquivo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadFiles();
    }
  }, [open]);

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<CloudUploadIcon />}
        onClick={handleOpen}
        sx={{ mr: 2 }}
      >
        Google Drive
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Arquivos do Google Drive</Typography>
            <Box>
              <IconButton onClick={loadFiles} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box mb={2}>
            <input
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              id="upload-file"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="upload-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                disabled={loading}
                fullWidth
              >
                Fazer Upload
              </Button>
            </label>
          </Box>

          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {files.map((file) => (
                <ListItem key={file.id} divider>
                  <ListItemText
                    primary={file.name}
                    secondary={new Date(file.modifiedTime).toLocaleDateString('pt-BR')}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleFileDownload(file.id)}
                      disabled={loading}
                    >
                      <CloudDownloadIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {files.length === 0 && !loading && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                  Nenhum arquivo encontrado
                </Typography>
              )}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}; 