import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Typography, Box, TextField, Stack, MenuItem, Chip, CircularProgress,
  InputAdornment, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Drawer, IconButton, Divider, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  contractItemsApi, ContractItem, ContractItemStatus, ContractItemPriority, ContractImpact,
} from '../api/contract-items';
import { useProjectId } from '../auth/ProjectContext';
import ExportExcelButton from '../components/ExportExcelButton';

const CHANGE_STATUSES: ContractItemStatus[] = ['OPEN', 'IN_PROGRESS', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ON_HOLD', 'CLOSED'];
const PRIORITIES: ContractItemPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const IMPACTS: ContractImpact[] = ['NONE', 'MINOR', 'MODERATE', 'MAJOR'];

const STATUS_COLORS: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary'> = {
  OPEN: 'info', IN_PROGRESS: 'warning', PENDING_APPROVAL: 'warning',
  APPROVED: 'success', REJECTED: 'error', ON_HOLD: 'default', CLOSED: 'default',
};
const IMPACT_COLORS: Record<string, 'default' | 'info' | 'warning' | 'error'> = {
  NONE: 'default', MINOR: 'info', MODERATE: 'warning', MAJOR: 'error',
};

export default function ContractChangeLogPage() {
  const projectId = useProjectId();
  const [items, setItems] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selected, setSelected] = useState<ContractItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' }>({ open: false, msg: '', sev: 'success' });
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const [form, setForm] = useState({
    title: '', description: '', clauseRef: '', clientRef: '',
    changeRequestedBy: '', changeDate: '', deviationType: '',
    commercialImpact: 'NONE' as ContractImpact, commercialValue: '',
    scheduleImpact: 'NONE' as ContractImpact, scheduleDays: '',
    technicalImpact: '', priority: 'MEDIUM' as ContractItemPriority,
    status: 'OPEN' as ContractItemStatus, discipline: '', notes: '',
    specTitle: '', docRef: '', docRevision: '', docPage: '',
  });

  const fetchItems = useCallback(() => {
    if (!projectId) return;
    setLoading(true);
    contractItemsApi.list({
      projectId, type: 'CHANGE',
      status: statusFilter as any || undefined,
      priority: priorityFilter as any || undefined,
      search: search || undefined,
    })
      .then(r => setItems(r.data))
      .finally(() => setLoading(false));
  }, [projectId, statusFilter, priorityFilter, search]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchItems, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchItems]);

  const totalCommercial = items.reduce((sum, i) => sum + (i.commercialValue || 0), 0);
  const totalDays = items.reduce((sum, i) => sum + (i.scheduleDays || 0), 0);

  const handleRowClick = async (item: ContractItem) => {
    const r = await contractItemsApi.getById(item.id);
    setSelected(r.data);
    setDrawerOpen(true);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;
    setImporting(true);
    try {
      const res = await contractItemsApi.importExcel(file, projectId, 'CHANGE');
      setSnack({ open: true, msg: `Imported ${res.data.imported} changes`, sev: 'success' });
      fetchItems();
    } catch {
      setSnack({ open: true, msg: 'Import failed', sev: 'error' });
    } finally {
      setImporting(false);
      if (importRef.current) importRef.current.value = '';
    }
  };

  const handleAdd = async () => {
    if (!projectId || !form.title) return;
    try {
      await contractItemsApi.create({
        projectId, type: 'CHANGE', title: form.title,
        description: form.description || undefined,
        clauseRef: form.clauseRef || undefined,
        clientRef: form.clientRef || undefined,
        changeRequestedBy: form.changeRequestedBy || undefined,
        changeDate: form.changeDate || undefined,
        deviationType: form.deviationType || undefined,
        commercialImpact: form.commercialImpact,
        commercialValue: form.commercialValue ? parseFloat(form.commercialValue) : undefined,
        scheduleImpact: form.scheduleImpact,
        scheduleDays: form.scheduleDays ? parseInt(form.scheduleDays) : undefined,
        technicalImpact: form.technicalImpact || undefined,
        priority: form.priority, status: form.status,
        discipline: form.discipline || undefined,
        notes: form.notes || undefined,
        specTitle: form.specTitle || undefined,
        docRef: form.docRef || undefined,
        docRevision: form.docRevision || undefined,
        docPage: form.docPage || undefined,
      } as any);
      setAddOpen(false);
      resetForm();
      fetchItems();
      setSnack({ open: true, msg: 'Change added', sev: 'success' });
    } catch {
      setSnack({ open: true, msg: 'Failed to add', sev: 'error' });
    }
  };

  const handleEdit = async () => {
    if (!selected) return;
    try {
      await contractItemsApi.update(selected.id, {
        title: form.title, description: form.description || undefined,
        clauseRef: form.clauseRef || undefined,
        clientRef: form.clientRef || undefined,
        changeRequestedBy: form.changeRequestedBy || undefined,
        changeDate: form.changeDate || undefined,
        deviationType: form.deviationType || undefined,
        commercialImpact: form.commercialImpact,
        commercialValue: form.commercialValue ? parseFloat(form.commercialValue) : undefined,
        scheduleImpact: form.scheduleImpact,
        scheduleDays: form.scheduleDays ? parseInt(form.scheduleDays) : undefined,
        technicalImpact: form.technicalImpact || undefined,
        priority: form.priority, status: form.status,
        discipline: form.discipline || undefined, notes: form.notes || undefined,
        specTitle: form.specTitle || undefined,
        docRef: form.docRef || undefined,
      } as any);
      setEditOpen(false);
      setDrawerOpen(false);
      fetchItems();
      setSnack({ open: true, msg: 'Updated', sev: 'success' });
    } catch {
      setSnack({ open: true, msg: 'Update failed', sev: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await contractItemsApi.remove(id);
      setDrawerOpen(false);
      fetchItems();
      setSnack({ open: true, msg: 'Deleted', sev: 'success' });
    } catch {
      setSnack({ open: true, msg: 'Delete failed', sev: 'error' });
    }
  };

  const resetForm = () => setForm({
    title: '', description: '', clauseRef: '', clientRef: '',
    changeRequestedBy: '', changeDate: '', deviationType: '',
    commercialImpact: 'NONE', commercialValue: '', scheduleImpact: 'NONE',
    scheduleDays: '', technicalImpact: '', priority: 'MEDIUM', status: 'OPEN',
    discipline: '', notes: '', specTitle: '', docRef: '', docRevision: '', docPage: '',
  });

  const openEdit = () => {
    if (!selected) return;
    setForm({
      title: selected.title, description: selected.description || '',
      clauseRef: selected.clauseRef || '', clientRef: selected.clientRef || '',
      changeRequestedBy: selected.changeRequestedBy || '',
      changeDate: selected.changeDate ? selected.changeDate.slice(0, 10) : '',
      deviationType: selected.deviationType || '',
      commercialImpact: selected.commercialImpact,
      commercialValue: selected.commercialValue?.toString() || '',
      scheduleImpact: selected.scheduleImpact,
      scheduleDays: selected.scheduleDays?.toString() || '',
      technicalImpact: selected.technicalImpact || '',
      priority: selected.priority, status: selected.status,
      discipline: selected.discipline || '', notes: selected.notes || '',
      specTitle: selected.specTitle || '', docRef: selected.docRef || '',
      docRevision: selected.docRevision || '', docPage: selected.docPage || '',
    });
    setEditOpen(true);
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Contract Change Log</Typography>
        <Stack direction="row" spacing={1}>
          <input ref={importRef} type="file" accept=".xlsx,.xls" hidden onChange={handleImport} />
          <Button variant="outlined" size="small" startIcon={importing ? <CircularProgress size={16} /> : <UploadFileIcon />} onClick={() => importRef.current?.click()} disabled={importing}>
            Import Excel
          </Button>
          <ExportExcelButton
            data={items.map(i => ({
              ...i, assigneeName: i.assignee?.name || '',
              changeDateStr: i.changeDate ? new Date(i.changeDate).toLocaleDateString() : '',
            })) as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'itemNumber', header: 'Change #' }, { key: 'title', header: 'Title' },
              { key: 'clientRef', header: 'Client Ref' }, { key: 'clauseRef', header: 'Clause Ref' },
              { key: 'changeRequestedBy', header: 'Requested By' },
              { key: 'changeDateStr', header: 'Change Date' },
              { key: 'deviationType', header: 'Deviation Type' },
              { key: 'priority', header: 'Priority' }, { key: 'status', header: 'Status' },
              { key: 'commercialImpact', header: 'Commercial Impact' },
              { key: 'commercialValue', header: 'Commercial Value' },
              { key: 'scheduleImpact', header: 'Schedule Impact' },
              { key: 'scheduleDays', header: 'Schedule Days' },
              { key: 'technicalImpact', header: 'Technical Impact' },
              { key: 'assigneeName', header: 'Assignee' },
              { key: 'description', header: 'Description' }, { key: 'notes', header: 'Notes' },
            ]}
            fileName="contract-change-log"
          />
          <Button variant="contained" size="small" onClick={() => { resetForm(); setAddOpen(true); }}>
            Add Change
          </Button>
        </Stack>
      </Stack>

      {/* Summary bar */}
      <Stack direction="row" spacing={2} mb={2}>
        <Card sx={{ flex: 1 }}><CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
          <Typography variant="caption" color="text.secondary">Total changes</Typography>
          <Typography variant="h6">{items.length}</Typography>
        </CardContent></Card>
        <Card sx={{ flex: 1 }}><CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
          <Typography variant="caption" color="text.secondary">Commercial impact</Typography>
          <Typography variant="h6">{totalCommercial.toLocaleString()} &euro;</Typography>
        </CardContent></Card>
        <Card sx={{ flex: 1 }}><CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
          <Typography variant="caption" color="text.secondary">Schedule impact</Typography>
          <Typography variant="h6">{totalDays} days</Typography>
        </CardContent></Card>
      </Stack>

      <Stack direction="row" spacing={2} mb={2}>
        <TextField size="small" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 250 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
        <TextField select size="small" label="Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">All</MenuItem>
          {CHANGE_STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Priority" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} sx={{ minWidth: 130 }}>
          <MenuItem value="">All</MenuItem>
          {PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
        </TextField>
      </Stack>

      {loading ? (
        <Box textAlign="center" mt={4}><CircularProgress /></Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Client Ref</TableCell>
                <TableCell>Clause</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Commercial</TableCell>
                <TableCell align="right">&euro;</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell align="right">Days</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleRowClick(item)}>
                  <TableCell>{item.itemNumber}</TableCell>
                  <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</TableCell>
                  <TableCell>{item.clientRef}</TableCell>
                  <TableCell>{item.clauseRef}</TableCell>
                  <TableCell><Chip label={item.status} size="small" color={STATUS_COLORS[item.status] || 'default'} /></TableCell>
                  <TableCell><Chip label={item.priority} size="small" color={({ LOW: 'default', MEDIUM: 'info', HIGH: 'warning', CRITICAL: 'error' } as any)[item.priority] || 'default'} /></TableCell>
                  <TableCell><Chip label={item.commercialImpact} size="small" color={IMPACT_COLORS[item.commercialImpact] || 'default'} /></TableCell>
                  <TableCell align="right">{item.commercialValue?.toLocaleString() || '-'}</TableCell>
                  <TableCell><Chip label={item.scheduleImpact} size="small" color={IMPACT_COLORS[item.scheduleImpact] || 'default'} /></TableCell>
                  <TableCell align="right">{item.scheduleDays || '-'}</TableCell>
                  <TableCell>{item.deviationType}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detail Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 600, p: 3 } }}>
        {selected && (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6">{selected.itemNumber}</Typography>
                <Chip label={selected.status} size="small" color={STATUS_COLORS[selected.status] || 'default'} />
              </Stack>
              <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
            </Stack>

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{selected.title}</Typography>
            {selected.description && <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{selected.description}</Typography>}

            <Divider sx={{ my: 1 }} />

            <Stack direction="row" spacing={4} mb={2}>
              <Box>
                <DetailRow label="Clause Ref" value={selected.clauseRef || '-'} />
                <DetailRow label="Client Ref" value={selected.clientRef || '-'} />
                <DetailRow label="Requested By" value={selected.changeRequestedBy || '-'} />
                <DetailRow label="Change Date" value={selected.changeDate ? new Date(selected.changeDate).toLocaleDateString() : '-'} />
                <DetailRow label="Deviation Type" value={selected.deviationType || '-'} />
              </Box>
              <Box>
                <DetailRow label="Commercial Impact" value={`${selected.commercialImpact}${selected.commercialValue ? ` — ${selected.commercialValue.toLocaleString()} €` : ''}`} />
                <DetailRow label="Schedule Impact" value={`${selected.scheduleImpact}${selected.scheduleDays ? ` — ${selected.scheduleDays} days` : ''}`} />
                <DetailRow label="Priority" value={selected.priority} />
                <DetailRow label="Discipline" value={selected.discipline || '-'} />
              </Box>
            </Stack>

            {selected.technicalImpact && <DetailRow label="Technical Impact" value={selected.technicalImpact} />}
            {selected.specTitle && <DetailRow label="Spec Title" value={selected.specTitle} />}
            {selected.docRef && <DetailRow label="Document Ref" value={`${selected.docRef}${selected.docRevision ? ` (Rev ${selected.docRevision})` : ''}`} />}
            {selected.assignee && <DetailRow label="Assignee" value={`${selected.assignee.name} (${selected.assignee.email})`} />}
            {selected.notes && <DetailRow label="Notes" value={selected.notes} />}
            {selected.document && <DetailRow label="Linked Document" value={selected.document.fileName} />}

            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<EditIcon />} onClick={openEdit}>Edit</Button>
              <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(selected.id)}>Delete</Button>
            </Stack>
          </>
        )}
      </Drawer>

      {/* Add / Edit Dialog */}
      {[{ open: addOpen, onClose: () => setAddOpen(false), onSubmit: handleAdd, title: 'Add Change' },
        { open: editOpen, onClose: () => setEditOpen(false), onSubmit: handleEdit, title: 'Edit Change' }].map((dlg) => (
        <Dialog key={dlg.title} open={dlg.open} onClose={dlg.onClose} maxWidth="sm" fullWidth>
          <DialogTitle>{dlg.title}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField size="small" label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth required />
              <TextField size="small" label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={3} />
              <Stack direction="row" spacing={2}>
                <TextField size="small" label="Clause Ref" value={form.clauseRef} onChange={e => setForm({ ...form, clauseRef: e.target.value })} sx={{ flex: 1 }} />
                <TextField size="small" label="Client Ref" value={form.clientRef} onChange={e => setForm({ ...form, clientRef: e.target.value })} sx={{ flex: 1 }} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField size="small" label="Requested By" value={form.changeRequestedBy} onChange={e => setForm({ ...form, changeRequestedBy: e.target.value })} sx={{ flex: 1 }} />
                <TextField size="small" label="Change Date" type="date" value={form.changeDate} onChange={e => setForm({ ...form, changeDate: e.target.value })} sx={{ flex: 1 }} InputLabelProps={{ shrink: true }} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField size="small" label="Spec Title" value={form.specTitle} onChange={e => setForm({ ...form, specTitle: e.target.value })} sx={{ flex: 1 }} />
                <TextField size="small" label="Doc Ref" value={form.docRef} onChange={e => setForm({ ...form, docRef: e.target.value })} sx={{ flex: 1 }} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField select size="small" label="Commercial Impact" value={form.commercialImpact} onChange={e => setForm({ ...form, commercialImpact: e.target.value as any })} sx={{ flex: 1 }}>
                  {IMPACTS.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                </TextField>
                <TextField size="small" label="Value (€)" type="number" value={form.commercialValue} onChange={e => setForm({ ...form, commercialValue: e.target.value })} sx={{ flex: 1 }} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField select size="small" label="Schedule Impact" value={form.scheduleImpact} onChange={e => setForm({ ...form, scheduleImpact: e.target.value as any })} sx={{ flex: 1 }}>
                  {IMPACTS.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                </TextField>
                <TextField size="small" label="Days" type="number" value={form.scheduleDays} onChange={e => setForm({ ...form, scheduleDays: e.target.value })} sx={{ flex: 1 }} />
              </Stack>
              <TextField size="small" label="Technical Impact" value={form.technicalImpact} onChange={e => setForm({ ...form, technicalImpact: e.target.value })} fullWidth multiline rows={2} />
              <TextField size="small" label="Deviation Type" value={form.deviationType} onChange={e => setForm({ ...form, deviationType: e.target.value })} fullWidth placeholder="e.g. Clarif, ds offre technique" />
              <Stack direction="row" spacing={2}>
                <TextField select size="small" label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as any })} sx={{ flex: 1 }}>
                  {PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} sx={{ flex: 1 }}>
                  {CHANGE_STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Stack>
              <TextField size="small" label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} fullWidth multiline rows={2} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={dlg.onClose}>Cancel</Button>
            <Button variant="contained" onClick={dlg.onSubmit} disabled={!form.title}>Save</Button>
          </DialogActions>
        </Dialog>
      ))}

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.sev} onClose={() => setSnack({ ...snack, open: false })}>{snack.msg}</Alert>
      </Snackbar>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{value}</Typography>
    </Box>
  );
}
