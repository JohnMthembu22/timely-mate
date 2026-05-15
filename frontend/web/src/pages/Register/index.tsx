import React, { useState } from 'react';
import { Container, Paper, Button, CircularProgress } from '@mui/material';

const Register: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    // Handle form submission
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 4 },
          mt: { xs: 4, sm: 8 },
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2,
        }}
      >
        {/* Form content */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, py: { xs: 1, sm: 1.5 } }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
        </Button>
        <Button
          component="a"
          href="/"
          fullWidth
          variant="outlined"
          sx={{ mt: 1 }}
        >
          Back to Home
        </Button>
      </Paper>
    </Container>
  );
};

export default Register; 