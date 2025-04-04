import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

export const OAuth2Callback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');

        if (!code) {
          throw new Error('Código de autorização não encontrado');
        }

        const response = await fetch('http://localhost:3001/api/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Erro na autenticação');
        }

        // Armazenar o token de acesso
        localStorage.setItem('googleAccessToken', data.tokens.access_token);
        
        // Redirecionar de volta para a página principal
        navigate('/');
      } catch (error) {
        console.error('Erro no callback:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <CircularProgress />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Autenticando...
      </Typography>
    </Box>
  );
}; 