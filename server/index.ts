import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.REDIRECT_URI) {
  console.error('Credenciais do Google não configuradas corretamente');
  process.exit(1);
}

const app = express();
const port = 3001;

// Configuração do CORS
app.use(cors());
app.use(express.json());

// Configuração do Multer para upload de arquivos
const upload = multer({ dest: 'uploads/' });

// Configuração do Google Drive
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const drive = google.drive({ version: 'v3', auth: oauth2Client });

// Middleware para verificar o token
const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Token não fornecido');
    }

    const token = authHeader.split(' ')[1];
    oauth2Client.setCredentials({ access_token: token });
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro de autenticação'
    });
  }
};

// Rota de autenticação
app.get('/api/auth/google', async (req, res) => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
      ]
    });
    res.json({ success: true, authUrl });
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro na autenticação' 
    });
  }
});

// Rota de callback
app.post('/api/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      throw new Error('Código de autorização não fornecido');
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    res.json({ success: true, tokens });
  } catch (error) {
    console.error('Erro no callback:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro no callback' 
    });
  }
});

// Rota para listar arquivos
app.get('/api/drive/files', authMiddleware, async (req, res) => {
  try {
    const response = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, webViewLink)',
    });
    res.json({ success: true, files: response.data.files });
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao listar arquivos' 
    });
  }
});

// Rota para upload de arquivos
app.post('/api/drive/upload', authMiddleware, upload.single('file'), async (req: express.Request, res) => {
  try {
    if (!req.file) {
      throw new Error('Nenhum arquivo enviado');
    }

    const fileMetadata = {
      name: req.file.originalname,
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });

    // Limpar o arquivo temporário
    fs.unlinkSync(req.file.path);

    res.json({ 
      success: true, 
      fileId: response.data.id,
      fileName: response.data.name,
      webViewLink: response.data.webViewLink
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao fazer upload' 
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
}); 