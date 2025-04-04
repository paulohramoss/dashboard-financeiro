# Backend do Dashboard Financeiro

Este é o backend do Dashboard Financeiro, responsável por gerenciar a integração com o Google Drive API.

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as credenciais do Google:
   - Acesse o [Google Cloud Console](https://console.cloud.google.com)
   - Crie um novo projeto ou selecione um existente
   - Ative a API do Google Drive
   - Crie credenciais (OAuth 2.0 Client ID)
   - Baixe o arquivo JSON de credenciais
   - Renomeie para `credentials.json` e coloque na raiz do projeto

3. Configure o arquivo `.env`:
```bash
PORT=3001
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
GOOGLE_DRIVE_FOLDER_ID=sua_pasta_id_aqui
```

4. Inicie o servidor:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## Endpoints

### GET /auth/google
Autentica com o Google Drive API

### POST /upload
Faz upload de um arquivo para o Google Drive

Corpo da requisição:
```json
{
  "name": "nome_do_arquivo.ext",
  "mimeType": "application/tipo",
  "content": "conteudo_em_base64"
}
```

### GET /files
Lista os arquivos da pasta configurada no Google Drive 