import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

interface BaseApiResponse {
  success: boolean;
  error?: string;
}

interface AuthResponse extends BaseApiResponse {
  authUrl: string; // Aqui authUrl é obrigatório para respostas de autenticação
}

interface FilesResponse extends BaseApiResponse {
  files: any[];
}

interface UploadResponse extends BaseApiResponse {
  fileId?: string;
  fileName?: string;
  webViewLink?: string;
}

const getHeaders = () => {
  const token = localStorage.getItem('googleAccessToken');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
};

export const googleDriveService = {
  async authenticate(): Promise<AuthResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/google`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro na autenticação',
        authUrl: '' // Necessário para satisfazer o tipo, mesmo em caso de erro
      };
    }
  },

  async listFiles(): Promise<FilesResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/drive/files`, {
        headers: getHeaders()
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao listar arquivos',
        files: []
      };
    }
  },

  async uploadFile(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/drive/upload`, formData, {
        headers: {
          ...getHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao fazer upload do arquivo'
      };
    }
  }
}; 