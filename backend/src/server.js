const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do Google Drive API
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Rota para autenticar com o Google
app.get('/auth/google', async (req, res) => {
  try {
    const auth = await authenticate({
      keyfilePath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: SCOPES,
    });

    const drive = google.drive({ version: 'v3', auth });
    res.json({ success: true, message: 'Autenticado com sucesso' });
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para upload de arquivo
app.post('/upload', async (req, res) => {
  try {
    const auth = await authenticate({
      keyfilePath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: SCOPES,
    });

    const drive = google.drive({ version: 'v3', auth });
    const { name, mimeType, content } = req.body;

    const fileMetadata = {
      name: name,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID] // ID da pasta no Google Drive
    };

    const media = {
      mimeType: mimeType,
      body: Buffer.from(content, 'base64')
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink'
    });

    res.json({
      success: true,
      fileId: file.data.id,
      fileName: file.data.name,
      webViewLink: file.data.webViewLink
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para listar arquivos
app.get('/files', async (req, res) => {
  try {
    const auth = await authenticate({
      keyfilePath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: SCOPES,
    });

    const drive = google.drive({ version: 'v3', auth });
    
    const response = await drive.files.list({
      q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents`,
      fields: 'files(id, name, webViewLink, mimeType, createdTime)',
      orderBy: 'createdTime desc'
    });

    res.json({
      success: true,
      files: response.data.files
    });
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 