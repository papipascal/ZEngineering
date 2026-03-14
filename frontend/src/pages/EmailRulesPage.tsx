import { useEffect, useState } from 'react';
import {
  Typography, Box, Button, Card, CardContent, Chip, Stack, Switch,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Alert,
  Divider, Tooltip, FormControlLabel, Checkbox,
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon,
  ArrowUpward, ArrowDownward, Email as EmailIcon,
} from '@mui/icons-material';
import { useProject } from '../auth/ProjectContext';
import { useNavigate } from 'react-router-dom';
import {
  emailRulesApi, EmailRoutingRule, CreateRuleDto,
  EmailRouteTarget, EmailPurpose, EmailDocumentIntent, Discipline,
  TARGET_LABELS, PURPOSE_LABELS, INTENT_LABELS, DISCIPLINE_LABELS,
} from '../api/email-rules';
import { authApi, User } from '../api/auth';

const EMPTY_FORM: Omit<CreateRuleDto, 'projectId'> = {
  name: '',
  priority: 0,
  senderEmail: '',
  senderDomain: '',
  subjectContains: '',
  isExternal: null,
  target: 'PROJECT_MANAGER',
  targetUserId: '',
  targetDiscipline: undefined,
  autoPurpose: undefined,
  autoIntent: undefined,
  active: true,
};

export default function EmailRulesPage() {
  const { project } = useProject();
  const navigate = useNavigate();
  const [rules, setRules] = useState<EmailRoutingRule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!project) { navigate('/select-project'); return; }
    Promise.all([
      emailRulesApi.list(project.id),
      authApi.getAllUsers(),
    ]).then(([rulesRes, usersRes]) => {
      setRules(rulesRes.data);
      setUsers(usersRes.data);
    }).finally(() => setLoading(false));
  }, [project, navigate]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaveError('');
    setDialogOpen(true);
  };

  const openEdit = (rule: EmailRoutingRule) => {
    setEditingId(rule.id);
    setForm({
      name: rule.name,
      priority: rule.priority,
      senderEmail: rule.senderEmail ?? '',
      senderDomain: rule.senderDomain ?? '',
      subjectContains: rule.subjectContains ?? '',
      isExternal: rule.isExternal,
      target: rule.target,
      targetUserId: rule.targetUserId ?? '',
      targetDiscipline: rule.targetDiscipline ?? undefined,
      autoPurpose: rule.autoPurpose ?? undefined,
      autoIntent: rule.autoIntent ?? undefined,
      active: rule.active,
    });
    setSaveError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!project || !form.name.trim()) { setSaveError('Le nom est requis'); return; }
    setSaveError('');
    try {
      const dto: CreateRuleDto = {
        projectId: project.id,
        name: form.name.trim(),
        priority: form.priority ?? 0,
        target: form.target,
        active: form.active ?? true,
        ...(form.senderEmail?.trim() && { senderEmail: form.senderEmail.trim() }),
        ...(form.senderDomain?.trim() && { senderDomain: form.senderDomain.trim() }),
        ...(form.subjectContains?.trim() && { subjectContains: form.subjectContains.trim() }),
        ...(form.isExternal !== null && { isExternal: form.isExternal }),
        ...(form.target === 'SPECIFIC_USER' && form.targetUserId && { targetUserId: form.targetUserId }),
        ...(form.target === 'DISCIPLINE_LEAD' && form.targetDiscipline && { targetDiscipline: form.targetDiscipline }),
        ...(form.autoPurpose && { autoPurpose: form.autoPurpose }),
        ...(form.autoIntent && { autoIntent: form.autoIntent }),
      };

      if (editingId) {
        const res = await emailRulesApi.update(editingId, dto);
        setRules(prev => prev.map(r => r.id === editingId ? res.data : r).sort((a, b) => b.priority - a.priority));
      } else {
        const res = await emailRulesApi.create(dto);
        setRules(prev => [...prev, res.data].sort((a, b) => b.priority - a.priority));
      }
      setDialogOpen(false);
    } catch (err: any) {
      setSaveError(err?.response?.data?.message ?? 'Erreur lors de la sauvegarde');
    }
  };

  const handleToggle = async (rule: EmailRoutingRule) => {
    const res = await emailRulesApi.toggle(rule.id);
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: res.data.active } : r));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette règle ?')) return;
    await emailRulesApi.remove(id);
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const conditionChips = (rule: EmailRoutingRule) => {
    const chips = [];
    if (rule.senderEmail) chips.push({ label: `De: ${rule.senderEmail}`, color: 'primary' as const });
    if (rule.senderDomain) chips.push({ label: `Domaine: @${rule.senderDomain}`, color: 'primary' as const });
    if (rule.subjectContains) chips.push({ label: `Sujet contient: "${rule.subjectContains}"`, color: 'info' as const });
    if (rule.isExternal === true) chips.push({ label: 'Externe uniquement', color: 'warning' as const });
    if (rule.isExternal === false) chips.push({ label: 'Interne uniquement', color: 'success' as const });
    if (chips.length === 0) chips.push({ label: 'Tous les emails', color: 'default' as const });
    return chips;
  };

  const targetLabel = (rule: EmailRoutingRule) => {
    let label = TARGET_LABELS[rule.target];
    if (rule.target === 'DISCIPLINE_LEAD' && rule.targetDiscipline) label += ` (${DISCIPLINE_LABELS[rule.targetDiscipline]})`;
    if (rule.target === 'SPECIFIC_USER' && rule.targetUser) label += `: ${rule.targetUser.name}`;
    return label;
  };

  if (loading) return <Box p={4}><Typography>Chargement...</Typography></Box>;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">Règles de routage email</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Les règles sont évaluées dans l'ordre de priorité (la plus haute en premier). La première règle qui correspond est appliquée.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nouvelle règle
        </Button>
      </Stack>

      {rules.length === 0 && (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <EmailIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography color="text.secondary">
            Aucune règle configurée. Le routing automatique sera utilisé.
          </Typography>
          <Typography variant="body2" color="text.disabled" mt={1}>
            Routing automatique : vendeur → Chef de projet | discipline (mots-clés) → Lead discipline | fallback → Chef de projet
          </Typography>
        </Card>
      )}

      <Stack spacing={2}>
        {rules.map((rule, idx) => (
          <Card key={rule.id} sx={{ opacity: rule.active ? 1 : 0.5, border: '1px solid', borderColor: rule.active ? 'divider' : 'action.disabled' }}>
            <CardContent>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                <Box flex={1}>
                  <Stack direction="row" alignItems="center" gap={1} mb={1}>
                    <Chip label={`Priorité ${rule.priority}`} size="small" color="default" variant="outlined" />
                    <Typography variant="h6">{rule.name}</Typography>
                    {!rule.active && <Chip label="Inactive" size="small" color="default" />}
                  </Stack>

                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    CONDITIONS
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.5} mb={1.5}>
                    {conditionChips(rule).map((c, i) => (
                      <Chip key={i} label={c.label} size="small" color={c.color} variant="outlined" />
                    ))}
                  </Stack>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    ACTIONS
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    <Chip label={`→ ${targetLabel(rule)}`} size="small" color="success" />
                    {rule.autoPurpose && <Chip label={`Objet: ${PURPOSE_LABELS[rule.autoPurpose]}`} size="small" color="info" />}
                    {rule.autoIntent && <Chip label={`Intent: ${INTENT_LABELS[rule.autoIntent]}`} size="small" color="info" />}
                  </Stack>
                </Box>

                <Stack direction="row" alignItems="center" gap={0.5} ml={2}>
                  <Tooltip title={rule.active ? 'Désactiver' : 'Activer'}>
                    <Switch checked={rule.active} size="small" onChange={() => handleToggle(rule)} />
                  </Tooltip>
                  <Tooltip title="Modifier">
                    <IconButton size="small" onClick={() => openEdit(rule)}><EditIcon fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton size="small" color="error" onClick={() => handleDelete(rule.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Fallback reminder */}
      {rules.length > 0 && (
        <Card sx={{ mt: 2, bgcolor: 'action.hover' }}>
          <CardContent sx={{ py: '12px !important' }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Fallback automatique</strong> (si aucune règle ne correspond) :
              vendeur connu → Chef de projet | mots-clés discipline → Lead discipline | sinon → Chef de projet
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Rule Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Modifier la règle' : 'Nouvelle règle de routage'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {saveError && <Alert severity="error">{saveError}</Alert>}

            <TextField
              label="Nom de la règle *"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              fullWidth size="small"
              placeholder="Ex: Emails vendeurs ABB, Documents client Alphahexol..."
            />

            <TextField
              label="Priorité (0–100, plus haute = évaluée en premier)"
              type="number"
              value={form.priority}
              onChange={e => setForm(p => ({ ...p, priority: parseInt(e.target.value) || 0 }))}
              fullWidth size="small"
            />

            <Divider><Typography variant="caption">CONDITIONS (toutes doivent correspondre)</Typography></Divider>

            <TextField
              label="Email expéditeur exact"
              value={form.senderEmail}
              onChange={e => setForm(p => ({ ...p, senderEmail: e.target.value }))}
              fullWidth size="small"
              placeholder="Ex: john.smith@abb.com"
              helperText="Laissez vide pour ignorer cette condition"
            />

            <TextField
              label="Domaine expéditeur"
              value={form.senderDomain}
              onChange={e => setForm(p => ({ ...p, senderDomain: e.target.value }))}
              fullWidth size="small"
              placeholder="Ex: abb.com, siemens.com"
              helperText="Tous les expéditeurs @ce-domaine.com"
            />

            <TextField
              label="Sujet contient le mot-clé"
              value={form.subjectContains}
              onChange={e => setForm(p => ({ ...p, subjectContains: e.target.value }))}
              fullWidth size="small"
              placeholder="Ex: datasheet, transmittal, for approval"
            />

            <FormControl size="small" fullWidth>
              <InputLabel>Type d'expéditeur</InputLabel>
              <Select
                value={form.isExternal === null ? '' : String(form.isExternal)}
                label="Type d'expéditeur"
                onChange={e => setForm(p => ({
                  ...p,
                  isExternal: e.target.value === '' ? null : e.target.value === 'true',
                }))}
              >
                <MenuItem value="">Peu importe (interne ou externe)</MenuItem>
                <MenuItem value="true">Externe uniquement (vendeurs, clients)</MenuItem>
                <MenuItem value="false">Interne uniquement (équipe projet)</MenuItem>
              </Select>
            </FormControl>

            <Divider><Typography variant="caption">ACTIONS</Typography></Divider>

            <FormControl size="small" fullWidth>
              <InputLabel>Router vers *</InputLabel>
              <Select
                value={form.target}
                label="Router vers *"
                onChange={e => setForm(p => ({ ...p, target: e.target.value as EmailRouteTarget }))}
              >
                {Object.entries(TARGET_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {form.target === 'DISCIPLINE_LEAD' && (
              <FormControl size="small" fullWidth>
                <InputLabel>Discipline</InputLabel>
                <Select
                  value={form.targetDiscipline ?? ''}
                  label="Discipline"
                  onChange={e => setForm(p => ({ ...p, targetDiscipline: e.target.value as Discipline }))}
                >
                  {Object.entries(DISCIPLINE_LABELS).map(([k, v]) => (
                    <MenuItem key={k} value={k}>{v}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {form.target === 'SPECIFIC_USER' && (
              <FormControl size="small" fullWidth>
                <InputLabel>Utilisateur</InputLabel>
                <Select
                  value={form.targetUserId ?? ''}
                  label="Utilisateur"
                  onChange={e => setForm(p => ({ ...p, targetUserId: e.target.value }))}
                >
                  {users.map(u => (
                    <MenuItem key={u.id} value={u.id}>{u.name} — {u.email}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl size="small" fullWidth>
              <InputLabel>Classifier automatiquement l'objet</InputLabel>
              <Select
                value={form.autoPurpose ?? ''}
                label="Classifier automatiquement l'objet"
                onChange={e => setForm(p => ({ ...p, autoPurpose: e.target.value as EmailPurpose || undefined }))}
              >
                <MenuItem value="">Ne pas forcer</MenuItem>
                {Object.entries(PURPOSE_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Classifier automatiquement l'intention documentaire</InputLabel>
              <Select
                value={form.autoIntent ?? ''}
                label="Classifier automatiquement l'intention documentaire"
                onChange={e => setForm(p => ({ ...p, autoIntent: e.target.value as EmailDocumentIntent || undefined }))}
              >
                <MenuItem value="">Ne pas forcer</MenuItem>
                {Object.entries(INTENT_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={<Switch checked={form.active ?? true} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} />}
              label="Règle active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingId ? 'Mettre à jour' : 'Créer la règle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
