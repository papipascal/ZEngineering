import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Typography, Box, TextField, Stack, MenuItem, Chip, CircularProgress,
  InputAdornment, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Drawer, IconButton, Divider, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  contractItemsApi, ContractItem, ContractItemStatus, ContractItemPriority,
} from '../api/contract-items';
import { useProjectId } from '../auth/ProjectContext';
import ExportExcelButton from '../components/ExportExcelButton';

const REQ_STATUSES: ContractItemStatus[] = ['OPEN', 'IN_PROGRESS', 'COMPLIANT', 'NON_COMPLIANT', 'WAIVED', 'CLOSED'];
const PRIORITIES: ContractItemPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const DISCIPLINES = ['PROCESS', 'PIPING', 'ELECTRICAL', 'INSTRUMENTATION', 'CIVIL', 'MECHANICAL'];

const STATUS_COLORS: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary'> = {
  OPEN: 'info', IN_PROGRESS: 'warning', COMPLIANT: 'success',
  NON_COMPLIANT: 'error', WAIVED: 'default', CLOSED: 'default',
};

const PRIORITY_COLORS: Record<string, 'default' | 'warning' | 'error' | 'info'> = {
  LOW: 'default', MEDIUM: 'info', HIGH: 'warning', CRITICAL: 'error',
};

export default function ContractRequirementsPage() {
  const projectId = useProjectId();
  const [items, setItems] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('');
  const [selected, setSelected] = useState<ContractItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' }>({ open: false, msg: '', sev: 'success' });
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Form state
  const [form, setForm] = useState({ title: '', description: '', clauseRef: '', specTitle: '', docRef: '', docRevision: '', docPage: '', priority: 'MEDIUM' as ContractItemPriority, status: 'OPEN' as ContractItemStatus, discipline: '', reqCategory: '', reqAction: '', consequence: '', scopeLimit: '', notes: '' });

  const fetchItems = useCallback(() => {
    if (!projectId) return;
    setLoading(true);
    contractItemsApi.list({
      projectId, type: 'REQUIREMENT',
      status: statusFilter as any || undefined,
      priority: priorityFilter as any || undefined,
      discipline: disciplineFilter || undefined,
      search: search || undefined,
    })
      .then(r => setItems(r.data))
      .finally(() => setLoading(false));
  }, [projectId, statusFilter, priorityFilter, disciplineFilter, search]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchItems, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchItems]);

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
      const res = await contractItemsApi.importExcel(file, projectId, 'REQUIREMENT');
      setSnack({ open: true, msg: `Imported ${res.data.imported} requirements`, sev: 'success' });
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
        projectId, type: 'REQUIREMENT', ...form,
        discipline: form.discipline || undefined,
      } as any);
      setAddOpen(false);
      resetForm();
      fetchItems();
      setSnack({ open: true, msg: 'Requirement added', sev: 'success' });
    } catch {
      setSnack({ open: true, msg: 'Failed to add', sev: 'error' });
    }
  };

  const handleEdit = async () => {
    if (!selected) return;
    try {
      await contractItemsApi.update(selected.id, {
        ...form, discipline: form.discipline || undefined,
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

  const resetForm = () => setForm({ title: '', description: '', clauseRef: '', specTitle: '', docRef: '', docRevision: '', docPage: '', priority: 'MEDIUM', status: 'OPEN', discipline: '', reqCategory: '', reqAction: '', consequence: '', scopeLimit: '', notes: '' });

  const openEdit = () => {
    if (!selected) return;
    setForm({
      title: selected.title, description: selected.description || '',
      clauseRef: selected.clauseRef || '', specTitle: selected.specTitle || '',
      docRef: selected.docRef || '', docRevision: selected.docRevision || '',
      docPage: selected.docPage || '', priority: selected.priority,
      status: selected.status, discipline: selected.discipline || '',
      reqCategory: selected.reqCategory || '', reqAction: selected.reqAction || '',
      consequence: selected.consequence || '', scopeLimit: selected.scopeLimit || '',
      notes: selected.notes || '',
    });
    setEditOpen(true);
  };

  const categories = [...new Set(items.map(i => i.reqCategory).filter(Boolean))] as string[];

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Contract Requirements</Typography>
        <Stack direction="row" spacing={1}>
          <input ref={importRef} type="file" accept=".xlsx,.xls" hidden onChange={handleImport} />
          <Button variant="outlined" size="small" startIcon={importing ? <CircularProgress size={16} /> : <UploadFileIcon />} onClick={() => importRef.current?.click()} disabled={importing}>
            Import Excel
          </Button>
          <ExportExcelButton
            data={items.map(i => ({ ...i, assigneeName: i.assignee?.name || '', dueDateStr: i.dueDate ? new Date(i.dueDate).toLocaleDateString() : '' })) as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'itemNumber', header: 'Req #' }, { key: 'title', header: 'Domain' },
              { key: 'clauseRef', header: 'Clause Ref' }, { key: 'specTitle', header: 'Spec Title' },
              { key: 'docRef', header: 'Doc Ref' }, { key: 'reqCategory', header: 'Category' },
              { key: 'reqAction', header: 'Action' }, { key: 'priority', header: 'Priority' },
              { key: 'status', header: 'Status' }, { key: 'discipline', header: 'Discipline' },
              { key: 'assigneeName', header: 'Assignee' }, { key: 'description', header: 'Description' },
              { key: 'notes', header: 'Notes' },
            ]}
            fileName="contract-requirements"
          />
          <Button variant="contained" size="small" onClick={() => { resetForm(); setAddOpen(true); }}>
            Add Requirement
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={2} mb={2}>
        <TextField size="small" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 250 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
        <TextField select size="small" label="Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">All</MenuItem>
          {REQ_STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Priority" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} sx={{ minWidth: 130 }}>
          <MenuItem value="">All</MenuItem>
          {PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Discipline" value={disciplineFilter} onChange={e => setDisciplineFilter(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">All</MenuItem>
          {DISCIPLINES.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
        </TextField>
      </Stack>

      <Chip label={`${items.length} requirement${items.length !== 1 ? 's' : ''}`} size="small" sx={{ mb: 2 }} />

      {loading ? (
        <Box textAlign="center" mt={4}><CircularProgress /></Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Domain</TableCell>
                <TableCell>Clause Ref</TableCell>
                <TableCell>Spec / Doc Ref</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Discipline</TableCell>
                <TableCell>Assignee</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleRowClick(item)}>
                  <TableCell>{item.itemNumber}</TableCell>
                  <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</TableCell>
                  <TableCell>{item.clauseRef}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.specTitle || item.docRef}</TableCell>
                  <TableCell>{item.reqCategory}</TableCell>
                  <TableCell><Chip label={item.priority} size="small" color={PRIORITY_COLORS[item.priority] || 'default'} /></TableCell>
                  <TableCell><Chip label={item.status} size="small" color={STATUS_COLORS[item.status] || 'default'} /></TableCell>
                  <TableCell>{item.discipline}</TableCell>
                  <TableCell>{item.assignee?.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detail Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 550, p: 3 } }}>
        {selected && (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6">{selected.itemNumber}</Typography>
                <Chip label={selected.status} size="small" color={STATUS_COLORS[selected.status] || 'default'} />
                <Chip label={selected.priority} size="small" color={PRIORITY_COLORS[selected.priority] || 'default'} />
              </Stack>
              <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
            </Stack>

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{selected.title}</Typography>
            {selected.description && <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{selected.description}</Typography>}

            <Divider sx={{ my: 1 }} />

            <Stack spacing={1.5}>
              {selected.clauseRef && <DetailRow label="Clause Ref" value={selected.clauseRef} />}
              {selected.specTitle && <DetailRow label="Spec Title" value={selected.specTitle} />}
              {selected.docRef && <DetailRow label="Document Ref" value={`${selected.docRef}${selected.docRevision ? ` (Rev ${selected.docRevision})` : ''}`} />}
              {selected.docPage && <DetailRow label="Page" value={selected.docPage} />}
              {selected.reqCategory && <DetailRow label="Category" value={selected.reqCategory} />}
              {selected.reqAction && <DetailRow label="Required Action" value={selected.reqAction} />}
              {selected.consequence && <DetailRow label="Consequence" value={selected.consequence} />}
              {selected.scopeLimit && <DetailRow label="Scope / Limits" value={selected.scopeLimit} />}
              {selected.discipline && <DetailRow label="Discipline" value={selected.discipline} />}
              {selected.assignee && <DetailRow label="Assignee" value={`${selected.assignee.name} (${selected.assignee.email})`} />}
              {selected.dueDate && <DetailRow label="Due Date" value={new Date(selected.dueDate).toLocaleDateString()} />}
              {selected.notes && <DetailRow label="Notes" value={selected.notes} />}
              {selected.document && <DetailRow label="Linked Document" value={selected.document.fileName} />}
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<EditIcon />} onClick={openEdit}>Edit</Button>
              <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(selected.id)}>Delete</Button>
            </Stack>
          </>
        )}
      </Drawer>

      {/* Add / Edit Dialog */}
      {[{ open: addOpen, onClose: () => setAddOpen(false), onSubmit: handleAdd, title: 'Add Requirement' },
        { open: editOpen, onClose: () => setEditOpen(false), onSubmit: handleEdit, title: 'Edit Requirement' }].map((dlg) => (
        <Dialog key={dlg.title} open={dlg.open} onClose={dlg.onClose} maxWidth="sm" fullWidth>
          <DialogTitle>{dlg.title}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField size="small" label="Domain / Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth required />
              <TextField size="small" label="Description / Answer" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={3} />
              <Stack direction="row" spacing={2}>
                <TextField size="small" label="Clause Ref" value={form.clauseRef} onChange={e => setForm({ ...form, clauseRef: e.target.value })} sx={{ flex: 1 }} />
                <TextField size="small" label="Category" value={form.reqCategory} onChange={e => setForm({ ...form, reqCategory: e.target.value })} sx={{ flex: 1 }} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField size="small" label="Spec Title" value={form.specTitle} onChange={e => setForm({ ...form, specTitle: e.target.value })} sx={{ flex: 1 }} />
                <TextField size="small" label="Doc Ref" value={form.docRef} onChange={e => setForm({ ...form, docRef: e.target.value })} sx={{ flex: 1 }} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField size="small" label="Revision" value={form.docRevision} onChange={e => setForm({ ...form, docRevision: e.target.value })} sx={{ flex: 1 }} />
                <TextField size="small" label="Page" value={form.docPage} onChange={e => setForm({ ...form, docPage: e.target.value })} sx={{ flex: 1 }} />
              </Stack>
              <TextField size="small" label="Required Action" value={form.reqAction} onChange={e => setForm({ ...form, reqAction: e.target.value })} fullWidth />
              <TextField size="small" label="Consequence" value={form.consequence} onChange={e => setForm({ ...form, consequence: e.target.value })} fullWidth />
              <TextField size="small" label="Scope / Limits" value={form.scopeLimit} onChange={e => setForm({ ...form, scopeLimit: e.target.value })} fullWidth />
              <Stack direction="row" spacing={2}>
                <TextField select size="small" label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as any })} sx={{ flex: 1 }}>
                  {PRIORITIES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} sx={{ flex: 1 }}>
                  {REQ_STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="Discipline" value={form.discipline} onChange={e => setForm({ ...form, discipline: e.target.value })} sx={{ flex: 1 }}>
                  <MenuItem value="">-</MenuItem>
                  {DISCIPLINES.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
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
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{value}</Typography>
    </Box>
  );
}
