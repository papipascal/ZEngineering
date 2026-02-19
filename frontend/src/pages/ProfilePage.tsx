import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Person as PersonIcon, Lock as LockIcon } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { authApi } from '../api/auth';

const DISCIPLINES = ['PROCESS', 'PIPING', 'ELECTRICAL', 'INSTRUMENTATION', 'CIVIL', 'MECHANICAL'];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [discipline, setDiscipline] = useState(user?.discipline ?? '');
  const [title, setTitle] = useState(user?.title ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [snack, setSnack] = useState('');
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'error'>('success');

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileError('');
    try {
      await authApi.updateProfile({
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        discipline: discipline || undefined,
        title: title || undefined,
      });
      await refreshUser();
      setSnackSeverity('success');
      setSnack('Profil mis à jour avec succès');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Erreur lors de la sauvegarde';
      setProfileError(message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setPasswordSaving(true);
    setPasswordError('');
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSnackSeverity('success');
      setSnack('Mot de passe changé avec succès');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Erreur lors du changement de mot de passe';
      setPasswordError(message);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <Box maxWidth={700} mx="auto" py={4} px={2}>
      <Typography variant="h4" fontWeight={700} mb={4}>
        Mon profil
      </Typography>

      {/* Personal info card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} mb={3}>
            <PersonIcon color="primary" />
            <Typography variant="h6">Informations personnelles</Typography>
          </Stack>

          <Stack spacing={2.5}>
            <TextField
              label="Nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Adresse email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <TextField
              label="Téléphone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              placeholder="+33 6 12 34 56 78"
            />
            <FormControl fullWidth>
              <InputLabel>Discipline</InputLabel>
              <Select
                value={discipline}
                label="Discipline"
                onChange={(e) => setDiscipline(e.target.value)}
              >
                <MenuItem value=""><em>Aucune</em></MenuItem>
                {DISCIPLINES.map((d) => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Titre / Poste"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              placeholder="ex: Ingénieur Senior Process"
            />

            {profileError && (
              <Alert severity="error">{profileError}</Alert>
            )}

            <Box>
              <Button
                variant="contained"
                onClick={handleSaveProfile}
                disabled={profileSaving}
                startIcon={profileSaving ? <CircularProgress size={16} /> : undefined}
              >
                Enregistrer
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Change password card */}
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} mb={3}>
            <LockIcon color="primary" />
            <Typography variant="h6">Changer le mot de passe</Typography>
          </Stack>

          <Divider sx={{ mb: 2.5 }} />

          <Stack spacing={2.5}>
            <TextField
              label="Mot de passe actuel"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="Nouveau mot de passe"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              helperText="Minimum 6 caractères"
            />
            <TextField
              label="Confirmer le nouveau mot de passe"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              error={confirmPassword.length > 0 && newPassword !== confirmPassword}
              helperText={
                confirmPassword.length > 0 && newPassword !== confirmPassword
                  ? 'Les mots de passe ne correspondent pas'
                  : ''
              }
            />

            {passwordError && (
              <Alert severity="error">{passwordError}</Alert>
            )}

            <Box>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleChangePassword}
                disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
                startIcon={passwordSaving ? <CircularProgress size={16} /> : undefined}
              >
                Changer le mot de passe
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackSeverity} onClose={() => setSnack('')}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
}
