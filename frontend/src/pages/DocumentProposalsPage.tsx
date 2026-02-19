import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Chip, Drawer, Stack, TextField, Select, MenuItem, FormControl, InputLabel,
  Button, CircularProgress, Alert, Divider, IconButton, Tooltip,
} from '@mui/material';
import { CheckCircle as AcceptIcon, Cancel as RejectIcon, Close as CloseIcon } from '@mui/icons-material';
import { useProject } from '../auth/ProjectContext';
import { documentProposalsApi, DocumentProposal } from '../api/document-proposals';

const DISCIPLINES = ['PROCESS', 'PIPING', 'ELECTRICAL', 'INSTRUMENTATION', 'CIVIL', 'MECHANICAL'];

const STATUS_COLORS: Record<string, 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'error',
};

export default function DocumentProposalsPage() {
  const { project } = useProject();
  const [tab, setTab] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED'>('PENDING');
  const [proposals, setProposals] = useState<DocumentProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Drawer state
  const [selected, setSelected] = useState<DocumentProposal | null>(null);
  const [docNumber, setDocNumber] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    if (!project) return;
    setLoading(true);
    setError('');
    try {
      const res = await documentProposalsApi.listProposals(project.id, tab);
      setProposals(res.data);
    } catch {
      setError('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  }, [project, tab]);

  useEffect(() => { load(); }, [load]);

  const openDrawer = (p: DocumentProposal) => {
    setSelected(p);
    setDocNumber(p.proposedDocNumber ?? '');
    setDocTitle(p.proposedTitle ?? '');
    setDiscipline(p.proposedDiscipline ?? '');
    setNotes('');
    setSaveError('');
  };

  const closeDrawer = () => setSelected(null);

  const handleAccept = async () => {
    if (!selected) return;
    setSaving(true);
    setSaveError('');
    try {
      await documentProposalsApi.acceptProposal(selected.id, {
        notes: notes || undefined,
        proposedDocNumber: docNumber || undefined,
        proposedTitle: docTitle || undefined,
        proposedDiscipline: discipline || undefined,
      });
      closeDrawer();
      load();
    } catch {
      setSaveError('Failed to accept proposal');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    setSaving(true);
    setSaveError('');
    try {
      await documentProposalsApi.rejectProposal(selected.id, { notes: notes || undefined });
      closeDrawer();
      load();
    } catch {
      setSaveError('Failed to reject proposal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Document Proposals
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Pending" value="PENDING" />
        <Tab label="Accepted" value="ACCEPTED" />
        <Tab label="Rejected" value="REJECTED" />
      </Tabs>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>File</TableCell>
                <TableCell>Email Subject</TableCell>
                <TableCell>From</TableCell>
                <TableCell>Discipline</TableCell>
                <TableCell>Doc Number</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Received</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {proposals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No {tab.toLowerCase()} proposals
                  </TableCell>
                </TableRow>
              )}
              {proposals.map((p) => (
                <TableRow
                  key={p.id}
                  hover
                  onClick={() => openDrawer(p)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{p.document.fileName}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.incomingEmail.subject}
                  </TableCell>
                  <TableCell>{p.incomingEmail.fromAddress}</TableCell>
                  <TableCell>
                    {p.proposedDiscipline && (
                      <Chip label={p.proposedDiscipline} size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {p.proposedDocNumber ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={p.status} size="small" color={STATUS_COLORS[p.status]} />
                  </TableCell>
                  <TableCell>
                    {new Date(p.incomingEmail.receivedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Review Drawer */}
      <Drawer
        anchor="right"
        open={!!selected}
        onClose={closeDrawer}
        PaperProps={{ sx: { width: 420, p: 3 } }}
      >
        {selected && (
          <Stack spacing={2.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Review Proposal</Typography>
              <IconButton onClick={closeDrawer}><CloseIcon /></IconButton>
            </Stack>

            <Box>
              <Typography variant="caption" color="text.secondary">File</Typography>
              <Typography variant="body2" fontWeight={600}>{selected.document.fileName}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">Email</Typography>
              <Typography variant="body2">{selected.incomingEmail.subject}</Typography>
              <Typography variant="caption" color="text.secondary">
                From: {selected.incomingEmail.fromAddress}
              </Typography>
            </Box>

            <Divider />

            <TextField
              label="Document Number"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. ZG-125-PRC-001"
              disabled={selected.status !== 'PENDING'}
            />
            <TextField
              label="Title"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              fullWidth
              size="small"
              disabled={selected.status !== 'PENDING'}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Discipline</InputLabel>
              <Select
                value={discipline}
                label="Discipline"
                onChange={(e) => setDiscipline(e.target.value)}
                disabled={selected.status !== 'PENDING'}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {DISCIPLINES.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
              disabled={selected.status !== 'PENDING'}
            />

            {selected.status === 'PENDING' && (
              <>
                {saveError && <Alert severity="error">{saveError}</Alert>}
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Accept and create register entry">
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={saving ? <CircularProgress size={16} /> : <AcceptIcon />}
                      onClick={handleAccept}
                      disabled={saving}
                      fullWidth
                    >
                      Accept
                    </Button>
                  </Tooltip>
                  <Tooltip title="Reject this proposal">
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<RejectIcon />}
                      onClick={handleReject}
                      disabled={saving}
                      fullWidth
                    >
                      Reject
                    </Button>
                  </Tooltip>
                </Stack>
              </>
            )}

            {selected.status !== 'PENDING' && (
              <Box>
                <Chip
                  label={selected.status}
                  color={STATUS_COLORS[selected.status]}
                  sx={{ mb: 1 }}
                />
                {selected.reviewedBy && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    Reviewed by {selected.reviewedBy.name} on {selected.reviewedAt ? new Date(selected.reviewedAt).toLocaleDateString() : ''}
                  </Typography>
                )}
                {selected.notes && (
                  <Typography variant="body2" sx={{ mt: 1 }}>{selected.notes}</Typography>
                )}
              </Box>
            )}
          </Stack>
        )}
      </Drawer>
    </Box>
  );
}
