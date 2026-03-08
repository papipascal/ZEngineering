import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, TextField, InputAdornment, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Stack, IconButton, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import { useProject } from '../auth/ProjectContext';
import { connectionsApi, Connection, ConnectionType, CreateConnectionDto } from '../api/connections';
import { equipmentApi, Equipment } from '../api/equipment';

const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
  PROCESS_LINE:    'Ligne process',
  INSTRUMENT_LOOP: 'Boucle instru.',
  ELECTRICAL_CABLE:'Câble électrique',
  UTILITY_LINE:    'Utilité',
  DRAIN_VENT:      'Drain / Évent',
};

const TYPE_COLORS: Record<ConnectionType, 'primary' | 'secondary' | 'warning' | 'info' | 'default'> = {
  PROCESS_LINE:    'primary',
  INSTRUMENT_LOOP: 'secondary',
  ELECTRICAL_CABLE:'warning',
  UTILITY_LINE:    'info',
  DRAIN_VENT:      'default',
};

export default function ConnectionsPage() {
  const { currentProject } = useProject();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [equipment, setEquipment]     = useState<Equipment[]>([]);
  const [search, setSearch]           = useState('');
  const [openDialog, setOpenDialog]   = useState(false);
  const [form, setForm] = useState<Partial<CreateConnectionDto>>({
    type: 'PROCESS_LINE',
    isoCertRequired: false,
  });

  useEffect(() => {
    if (!currentProject) return;
    connectionsApi.list({ projectId: currentProject.id }).then(r => setConnections(r.data));
    equipmentApi.list({ projectId: currentProject.id }).then(r => setEquipment(r.data));
  }, [currentProject]);

  const filtered = connections.filter(c =>
    !search ||
    c.lineNumber.toLowerCase().includes(search.toLowerCase()) ||
    (c.fluid ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.materialSpec ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async () => {
    if (!currentProject || !form.lineNumber || !form.type) return;
    const res = await connectionsApi.create({ ...form, projectId: currentProject.id } as CreateConnectionDto);
    setConnections(prev => [...prev, res.data]);
    setOpenDialog(false);
    setForm({ type: 'PROCESS_LINE', isoCertRequired: false });
  };

  const handleDelete = async (id: string) => {
    await connectionsApi.remove(id);
    setConnections(prev => prev.filter(c => c.id !== id));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Line List — Connexions</Typography>
          <Typography color="text.secondary">{connections.length} lignes</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          Nouvelle ligne
        </Button>
      </Stack>

      <TextField
        fullWidth
        size="small"
        placeholder="Rechercher par numéro de ligne, fluide, spec matière…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        sx={{ mb: 2 }}
      />

      <Paper elevation={0} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell><strong>N° de ligne</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Fluide</strong></TableCell>
              <TableCell><strong>De</strong></TableCell>
              <TableCell><strong>Vers</strong></TableCell>
              <TableCell><strong>DN</strong></TableCell>
              <TableCell><strong>Classe P</strong></TableCell>
              <TableCell><strong>Spec matière</strong></TableCell>
              <TableCell><strong>Iso requis</strong></TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  <LinkIcon sx={{ fontSize: 40, mb: 1, display: 'block', mx: 'auto', opacity: 0.3 }} />
                  Aucune connexion enregistrée
                </TableCell>
              </TableRow>
            )}
            {filtered.map(c => (
              <TableRow key={c.id} hover>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.lineNumber}</TableCell>
                <TableCell>
                  <Chip
                    label={CONNECTION_TYPE_LABELS[c.type]}
                    color={TYPE_COLORS[c.type]}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{c.fluid ?? '—'}</TableCell>
                <TableCell>
                  {c.fromEquipment
                    ? <Chip label={c.fromEquipment.tagNumber} size="small" />
                    : <Typography variant="caption" color="text.secondary">{c.fromNozzle ?? '—'}</Typography>}
                </TableCell>
                <TableCell>
                  {c.toEquipment
                    ? <Chip label={c.toEquipment.tagNumber} size="small" />
                    : <Typography variant="caption" color="text.secondary">{c.toNozzle ?? '—'}</Typography>}
                </TableCell>
                <TableCell>{c.nominalDiameter ?? '—'}</TableCell>
                <TableCell>{c.pressureClass ?? '—'}</TableCell>
                <TableCell>{c.materialSpec ?? '—'}</TableCell>
                <TableCell>
                  {c.isoCertRequired
                    ? <Chip label="Oui" color="warning" size="small" />
                    : <Typography variant="caption" color="text.secondary">Non</Typography>}
                </TableCell>
                <TableCell>
                  <Tooltip title="Supprimer">
                    <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog création */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouvelle connexion / ligne</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="N° de ligne *"
              fullWidth size="small"
              value={form.lineNumber ?? ''}
              onChange={e => setForm(f => ({ ...f, lineNumber: e.target.value }))}
              placeholder="ex: 125-PL-0042-2&quot;-CS1"
            />
            <TextField
              select label="Type *" fullWidth size="small"
              value={form.type ?? 'PROCESS_LINE'}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as ConnectionType }))}
            >
              {Object.entries(CONNECTION_TYPE_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Fluide" fullWidth size="small"
              value={form.fluid ?? ''}
              onChange={e => setForm(f => ({ ...f, fluid: e.target.value }))}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                select label="Équipement source" fullWidth size="small"
                value={form.fromEquipmentId ?? ''}
                onChange={e => setForm(f => ({ ...f, fromEquipmentId: e.target.value }))}
              >
                <MenuItem value="">— Aucun —</MenuItem>
                {equipment.map(eq => (
                  <MenuItem key={eq.id} value={eq.id}>{eq.tagNumber} — {eq.service}</MenuItem>
                ))}
              </TextField>
              <TextField
                select label="Équipement destination" fullWidth size="small"
                value={form.toEquipmentId ?? ''}
                onChange={e => setForm(f => ({ ...f, toEquipmentId: e.target.value }))}
              >
                <MenuItem value="">— Aucun —</MenuItem>
                {equipment.map(eq => (
                  <MenuItem key={eq.id} value={eq.id}>{eq.tagNumber} — {eq.service}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="DN" size="small" fullWidth
                value={form.nominalDiameter ?? ''}
                onChange={e => setForm(f => ({ ...f, nominalDiameter: e.target.value }))}
                placeholder='ex: DN100 / 4"'
              />
              <TextField
                label="Classe pression" size="small" fullWidth
                value={form.pressureClass ?? ''}
                onChange={e => setForm(f => ({ ...f, pressureClass: e.target.value }))}
                placeholder="ex: ANSI 300"
              />
            </Stack>
            <TextField
              label="Spec matière" size="small" fullWidth
              value={form.materialSpec ?? ''}
              onChange={e => setForm(f => ({ ...f, materialSpec: e.target.value }))}
              placeholder="ex: CS A106 Gr.B"
            />
            <TextField
              label="Type d'isolation" size="small" fullWidth
              value={form.insulationType ?? ''}
              onChange={e => setForm(f => ({ ...f, insulationType: e.target.value }))}
            />
            <TextField
              label="Notes" size="small" fullWidth multiline rows={2}
              value={form.notes ?? ''}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!form.lineNumber}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
