import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const OAuth2Callback: React.FC = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      window.opener?.postMessage({ type: 'googleAuthCode', code }, window.location.origin);
    }
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress />
      <Typography>Autenticando...</Typography>
    </Box>
  );
}; 