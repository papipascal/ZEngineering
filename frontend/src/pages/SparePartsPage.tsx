import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, TextField, InputAdornment, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Stack, IconButton, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import { useProject } from '../auth/ProjectContext';
import { sparePartsApi, SparePart, SparePartCriticality, CreateSparePartDto } from '../api/spare-parts';
import { equipmentApi, Equipment } from '../api/equipment';

const CRITICALITY_LABELS: Record<SparePartCriticality, string> = {
  CRITICAL:   'Critique',
  IMPORTANT:  'Important',
  STANDARD:   'Standard',
  CONSUMABLE: 'Consommable',
};

const CRITICALITY_COLORS: Record<SparePartCriticality, 'error' | 'warning' | 'info' | 'default'> = {
  CRITICAL:   'error',
  IMPORTANT:  'warning',
  STANDARD:   'info',
  CONSUMABLE: 'default',
};

export default function SparePartsPage() {
  const { currentProject } = useProject();
  const [parts, setParts]         = useState<SparePart[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [search, setSearch]       = useState('');
  const [filterCrit, setFilterCrit] = useState<SparePartCriticality | ''>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState<Partial<CreateSparePartDto>>({
    criticality: 'STANDARD',
    recommendedQty: 1,
    stockQty: 0,
    currency: 'EUR',
  });

  useEffect(() => {
    if (!currentProject) return;
    equipmentApi.list({ projectId: currentProject.id }).then(r => setEquipment(r.data));
    // Load all spare parts for the project (via all equipment)
    reloadParts();
  }, [currentProject]);

  const reloadParts = () => {
    if (!currentProject) return;
    // Fetch via equipment IDs — backend supports equipmentId filter
    // We'll load all and filter client-side for now
    sparePartsApi.list().then(r => {
      const projectEquipmentIds = equipment.map(e => e.id);
      setParts(r.data.filter(p => projectEquipmentIds.includes(p.equipmentId)));
    });
  };

  const filtered = parts.filter(p => {
    const matchCrit = !filterCrit || p.criticality === filterCrit;
    const matchSearch = !search ||
      p.partNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      (p.manufacturer ?? '').toLowerCase().includes(search.toLowerCase());
    return matchCrit && matchSearch;
  });

  const handleCreate = async () => {
    if (!form.equipmentId || !form.partNumber || !form.description) return;
    const res = await sparePartsApi.create(form as CreateSparePartDto);
    const eq = equipment.find(e => e.id === res.data.equipmentId);
    setParts(prev => [...prev, { ...res.data, equipment: eq ? { id: eq.id, tagNumber: eq.tagNumber, service: eq.service } : undefined }]);
    setOpenDialog(false);
    setForm({ criticality: 'STANDARD', recommendedQty: 1, stockQty: 0, currency: 'EUR' });
  };

  const handleDelete = async (id: string) => {
    await sparePartsApi.remove(id);
    setParts(prev => prev.filter(p => p.id !== id));
  };

  const totalValue = filtered.reduce((sum, p) => sum + (p.unitCost ?? 0) * p.recommendedQty, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Pièces détachées</Typography>
          <Typography color="text.secondary">
            {filtered.length} pièces · Valeur estimée : {totalValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          Ajouter une pièce
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          size="small" placeholder="Rechercher…"
          value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ flex: 1 }}
        />
        <TextField
          select size="small" label="Criticité" value={filterCrit}
          onChange={e => setFilterCrit(e.target.value as SparePartCriticality | '')}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Toutes</MenuItem>
          {Object.entries(CRITICALITY_LABELS).map(([k, v]) => (
            <MenuItem key={k} value={k}>{v}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <Paper elevation={0} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell><strong>Équipement</strong></TableCell>
              <TableCell><strong>Réf. pièce</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Fabricant</strong></TableCell>
              <TableCell><strong>Criticité</strong></TableCell>
              <TableCell align="right"><strong>Qté rec.</strong></TableCell>
              <TableCell align="right"><strong>Stock</strong></TableCell>
              <TableCell align="right"><strong>Prix unit.</strong></TableCell>
              <TableCell><strong>Délai</strong></TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  <BuildIcon sx={{ fontSize: 40, mb: 1, display: 'block', mx: 'auto', opacity: 0.3 }} />
                  Aucune pièce détachée enregistrée
                </TableCell>
              </TableRow>
            )}
            {filtered.map(p => (
              <TableRow key={p.id} hover
                sx={{ bgcolor: p.stockQty < p.recommendedQty ? 'error.50' : undefined }}
              >
                <TableCell>
                  <Chip label={p.equipment?.tagNumber ?? '?'} size="small" variant="outlined" />
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{p.partNumber}</TableCell>
                <TableCell>{p.description}</TableCell>
                <TableCell>{p.manufacturer ?? '—'}</TableCell>
                <TableCell>
                  <Chip
                    label={CRITICALITY_LABELS[p.criticality]}
                    color={CRITICALITY_COLORS[p.criticality]}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">{p.recommendedQty}</TableCell>
                <TableCell align="right">
                  <Typography
                    fontWeight={600}
                    color={p.stockQty < p.recommendedQty ? 'error' : 'success.main'}
                  >
                    {p.stockQty}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {p.unitCost != null
                    ? p.unitCost.toLocaleString('fr-FR', { style: 'currency', currency: p.currency })
                    : '—'}
                </TableCell>
                <TableCell>{p.leadTimeDays != null ? `${p.leadTimeDays}j` : '—'}</TableCell>
                <TableCell>
                  <Tooltip title="Supprimer">
                    <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}>
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
        <DialogTitle>Ajouter une pièce détachée</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              select label="Équipement *" fullWidth size="small"
              value={form.equipmentId ?? ''}
              onChange={e => setForm(f => ({ ...f, equipmentId: e.target.value }))}
            >
              {equipment.map(eq => (
                <MenuItem key={eq.id} value={eq.id}>{eq.tagNumber} — {eq.service}</MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Référence pièce *" size="small" fullWidth
                value={form.partNumber ?? ''}
                onChange={e => setForm(f => ({ ...f, partNumber: e.target.value }))}
              />
              <TextField
                select label="Criticité *" size="small" fullWidth
                value={form.criticality ?? 'STANDARD'}
                onChange={e => setForm(f => ({ ...f, criticality: e.target.value as SparePartCriticality }))}
              >
                {Object.entries(CRITICALITY_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              label="Description *" size="small" fullWidth
              value={form.description ?? ''}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <TextField
              label="Fabricant" size="small" fullWidth
              value={form.manufacturer ?? ''}
              onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Qté recommandée" size="small" type="number" fullWidth
                value={form.recommendedQty ?? 1}
                onChange={e => setForm(f => ({ ...f, recommendedQty: parseInt(e.target.value) }))}
              />
              <TextField
                label="Stock actuel" size="small" type="number" fullWidth
                value={form.stockQty ?? 0}
                onChange={e => setForm(f => ({ ...f, stockQty: parseInt(e.target.value) }))}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Prix unitaire" size="small" type="number" fullWidth
                value={form.unitCost ?? ''}
                onChange={e => setForm(f => ({ ...f, unitCost: parseFloat(e.target.value) }))}
              />
              <TextField
                label="Délai (jours)" size="small" type="number" fullWidth
                value={form.leadTimeDays ?? ''}
                onChange={e => setForm(f => ({ ...f, leadTimeDays: parseInt(e.target.value) }))}
              />
            </Stack>
            <TextField
              label="Emplacement de stockage" size="small" fullWidth
              value={form.storageLocation ?? ''}
              onChange={e => setForm(f => ({ ...f, storageLocation: e.target.value }))}
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
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!form.equipmentId || !form.partNumber || !form.description}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
