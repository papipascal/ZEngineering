import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, Stack,
  Collapse, IconButton, Tooltip, Chip,
} from '@mui/material';
import { Settings, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { getApiBase } from '../api/client';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [apiUrl, setApiUrl] = useState(getApiBase());
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiUrl = () => {
    const url = apiUrl.trim().replace(/\/$/, '');
    if (url) {
      localStorage.setItem('zen_api_url', url);
    } else {
      localStorage.removeItem('zen_api_url');
    }
    setSaved(true);
    setTimeout(() => window.location.reload(), 600);
  };

  const currentBase = getApiBase();
  const isLocal = !currentBase || currentBase.includes('localhost');

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Card sx={{ width: 420, p: 2 }}>
        <CardContent>
          <Typography variant="h4" textAlign="center" gutterBottom>
            Zen-gineering
          </Typography>
          <Typography variant="body2" textAlign="center" color="text.secondary" mb={1}>
            Industrial project management platform
          </Typography>

          {/* API status chip */}
          <Box textAlign="center" mb={2}>
            <Chip
              size="small"
              label={isLocal ? 'Serveur : local (non configuré)' : `Serveur : ${currentBase}`}
              color={isLocal ? 'warning' : 'success'}
              sx={{ fontSize: '0.7rem', maxWidth: '100%' }}
            />
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth autoFocus />
              <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Stack>
          </form>

          <Typography variant="caption" display="block" textAlign="center" mt={2} color="text.secondary">
            Demo: admin@zengineering.local / Password123!
          </Typography>

          {/* API URL configurator */}
          <Box mt={2} textAlign="center">
            <Tooltip title="Configurer l'URL du serveur backend">
              <IconButton size="small" onClick={() => setShowConfig(!showConfig)} color={showConfig ? 'primary' : 'default'}>
                <Settings fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Collapse in={showConfig}>
            <Box mt={1} p={1.5} bgcolor="#f9f9f9" borderRadius={1} border="1px solid #e0e0e0">
              <Typography variant="caption" fontWeight="bold" display="block" mb={1}>
                URL du serveur backend
              </Typography>
              <TextField
                size="small"
                fullWidth
                placeholder="https://votre-backend.railway.app"
                value={apiUrl}
                onChange={(e) => { setApiUrl(e.target.value); setSaved(false); }}
                helperText="Vide = utilise l'URL par défaut. Appliquer recharge la page."
              />
              <Button
                size="small"
                variant="contained"
                fullWidth
                sx={{ mt: 1 }}
                onClick={handleSaveApiUrl}
                startIcon={saved ? <CheckCircle /> : undefined}
                disabled={saved}
              >
                {saved ? 'Appliqué — rechargement…' : 'Appliquer'}
              </Button>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </Box>
  );
}
