import { google } from 'googleapis';
import { GaxiosResponse } from 'gaxios';
import { drive_v3 } from 'googleapis';

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = `${window.location.origin}/oauth2callback`;
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly'
];

export class GoogleDriveService {
  private auth: any;

  constructor() {
    this.auth = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    // Configurar listener para callback do OAuth
    window.addEventListener('load', () => {
      if (window.location.pathname === '/oauth2callback') {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
          this.handleAuthCode(code);
        }
      }
    });
  }

  private async handleAuthCode(code: string) {
    try {
      const { tokens } = await this.auth.getToken(code);
      this.auth.setCredentials(tokens);
      localStorage.setItem('googleDriveToken', JSON.stringify(tokens));
      window.close();
    } catch (error) {
      console.error('Erro ao obter token:', error);
      throw error;
    }
  }

  async authorize() {
    try {
      const token = localStorage.getItem('googleDriveToken');
      if (token) {
        const parsedToken = JSON.parse(token);
        // Verifica se o token expirou
        if (parsedToken.expiry_date && parsedToken.expiry_date > Date.now()) {
          this.auth.setCredentials(parsedToken);
          return true;
        }
      }

      const authUrl = this.auth.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
      });

      window.location.href = authUrl;
      return false;
    } catch (error) {
      console.error('Erro na autorização:', error);
      throw error;
    }
  }

  async uploadFile(file: File) {
    try {
      const isAuthorized = await this.authorize();
      if (!isAuthorized) return;

      const drive = google.drive({ version: 'v3', auth: this.auth });

      const fileMetadata = {
        name: file.name,
        mimeType: file.type,
      };

      const media = {
        mimeType: file.type,
        body: file,
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });

      return response.data.id;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  }

  async listFiles() {
    try {
      const isAuthorized = await this.authorize();
      if (!isAuthorized) return;

      const drive = google.drive({ version: 'v3', auth: this.auth });

      const response = await drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name, mimeType, modifiedTime)',
        q: "mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' or mimeType='application/vnd.ms-excel'",
        orderBy: 'modifiedTime desc'
      });

      return response.data.files;
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      throw error;
    }
  }

  async downloadFile(fileId: string) {
    try {
      const isAuthorized = await this.authorize();
      if (!isAuthorized) return;

      const drive = google.drive({ version: 'v3', auth: this.auth });

      const response = await drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, {
        responseType: 'arraybuffer'
      }) as unknown as GaxiosResponse<ArrayBuffer>;

      return new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      throw error;
    }
  }
} 