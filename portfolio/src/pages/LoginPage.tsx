import { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, Stack, Avatar,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #00897b 100%)',
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" spacing={2} mb={3}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <LockOutlined fontSize="large" />
            </Avatar>
            <Typography variant="h4" color="primary">Z'Engineering</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Engineering Portfolio & Project Showcase
            </Typography>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" variant="contained" size="large" fullWidth>
                Sign In
              </Button>
            </Stack>
          </form>

          <Box mt={3} p={2} bgcolor="grey.50" borderRadius={2}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Demo credentials:
            </Typography>
            <Typography variant="caption" display="block">
              Admin: admin@zengineering.com / admin123
            </Typography>
            <Typography variant="caption" display="block">
              Client: client@demo.com / demo123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
