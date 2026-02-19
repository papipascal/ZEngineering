import { useEffect, useState, useCallback } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Box, Chip, InputAdornment, CircularProgress, Stack,
  MenuItem, Select, FormControl, InputLabel, Drawer, Button, Divider, SelectChangeEvent,
  Tabs, Tab, IconButton, Alert,
} from '@mui/material';
import {
  Search as SearchIcon, AttachFile as AttachIcon, Public as ExternalIcon,
  Delete as DeleteIcon, Add as AddIcon,
} from '@mui/icons-material';
import { incomingEmailApi, IncomingEmail } from '../api/incoming-emails';
import { documentProposalsApi, WhitelistEntry } from '../api/document-proposals';
import { useProjectId } from '../auth/ProjectContext';
import ExportExcelButton from '../components/ExportExcelButton';

const PURPOSE_OPTIONS = ['', 'INFORMATION', 'QUERY', 'DOCUMENT_SUBMISSION', 'COMMENT_REQUEST', 'OTHER'];
const PURPOSE_LABELS: Record<string, string> = {
  INFORMATION: 'Information',
  QUERY: 'Query',
  DOCUMENT_SUBMISSION: 'Document Submission',
  COMMENT_REQUEST: 'Comment Request',
  OTHER: 'Other',
};
const PURPOSE_COLORS: Record<string, 'info' | 'warning' | 'success' | 'secondary' | 'default'> = {
  INFORMATION: 'info',
  QUERY: 'warning',
  DOCUMENT_SUBMISSION: 'success',
  COMMENT_REQUEST: 'secondary',
  OTHER: 'default',
};

const DOC_INTENT_OPTIONS = ['', 'FOR_INFORMATION', 'AS_INPUT', 'FOR_COMMENTS'];
const DOC_INTENT_LABELS: Record<string, string> = {
  FOR_INFORMATION: 'For Information',
  AS_INPUT: 'As Input',
  FOR_COMMENTS: 'For Comments',
};

export default function IncomingEmailListPage() {
  const projectId = useProjectId();
  const [mainTab, setMainTab] = useState<'emails' | 'whitelist'>('emails');

  // ── Emails state ──────────────────────────────
  const [emails, setEmails] = useState<IncomingEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [externalFilter, setExternalFilter] = useState('');
  const [selected, setSelected] = useState<IncomingEmail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editPurpose, setEditPurpose] = useState('');
  const [editDocIntent, setEditDocIntent] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // ── Whitelist state ───────────────────────────
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [wlLoading, setWlLoading] = useState(false);
  const [wlError, setWlError] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [wlSaving, setWlSaving] = useState(false);

  const loadEmails = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (projectId) params.projectId = projectId;
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (purposeFilter) params.purpose = purposeFilter;
    if (externalFilter) params.isExternal = externalFilter;
    incomingEmailApi.list(params).then((r) => setEmails(r.data)).finally(() => setLoading(false));
  }, [projectId, search, statusFilter, purposeFilter, externalFilter]);

  const loadWhitelist = useCallback(async () => {
    if (!projectId) return;
    setWlLoading(true);
    setWlError('');
    try {
      const res = await documentProposalsApi.listWhitelist(projectId);
      setWhitelist(res.data);
    } catch {
      setWlError('Failed to load whitelist');
    } finally {
      setWlLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadEmails(); }, [loadEmails]);
  useEffect(() => { if (mainTab === 'whitelist') loadWhitelist(); }, [mainTab, loadWhitelist]);

  const openDetail = async (email: IncomingEmail) => {
    const res = await incomingEmailApi.getById(email.id);
    setSelected(res.data);
    setEditPurpose(res.data.purpose || '');
    setEditDocIntent(res.data.documentIntent || '');
    setEditNotes(res.data.notes || '');
    setDrawerOpen(true);
    if (email.status === 'UNREAD') {
      await incomingEmailApi.updateStatus(email.id, 'READ');
      loadEmails();
    }
  };

  const handleArchive = async () => {
    if (!selected) return;
    await incomingEmailApi.updateStatus(selected.id, 'ARCHIVED');
    setDrawerOpen(false);
    loadEmails();
  };

  const handleSaveClassification = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await incomingEmailApi.update(selected.id, {
        purpose: editPurpose || undefined,
        documentIntent: editDocIntent || undefined,
        notes: editNotes || undefined,
      });
      loadEmails();
    } finally {
      setSaving(false);
    }
  };

  const handleAddWhitelist = async () => {
    if (!projectId || !newEmail.trim()) return;
    setWlSaving(true);
    try {
      await documentProposalsApi.addToWhitelist({
        projectId,
        emailOrDomain: newEmail.trim(),
        label: newLabel.trim() || undefined,
      });
      setNewEmail('');
      setNewLabel('');
      loadWhitelist();
    } finally {
      setWlSaving(false);
    }
  };

  const handleRemoveWhitelist = async (id: string) => {
    await documentProposalsApi.removeFromWhitelist(id);
    loadWhitelist();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h4">Inbox</Typography>
        {mainTab === 'emails' && (
          <ExportExcelButton
            data={emails.map((e) => ({ ...e, from: e.fromName ? `${e.fromName} <${e.fromAddress}>` : e.fromAddress, dateStr: new Date(e.receivedAt).toLocaleString(), attachmentCount: e._count?.attachments ?? 0, purposeLabel: e.purpose ? PURPOSE_LABELS[e.purpose] || e.purpose : '', externalLabel: e.isExternal ? 'External' : 'Internal' })) as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'from', header: 'From' },
              { key: 'subject', header: 'Subject' },
              { key: 'dateStr', header: 'Received' },
              { key: 'status', header: 'Status' },
              { key: 'purposeLabel', header: 'Purpose' },
              { key: 'externalLabel', header: 'Int/Ext' },
              { key: 'attachmentCount', header: 'Attachments' },
            ]}
            fileName="incoming-emails"
          />
        )}
      </Stack>

      <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)} sx={{ mb: 2 }}>
        <Tab label="Emails" value="emails" />
        <Tab label="Sender Whitelist" value="whitelist" />
      </Tabs>

      {/* ── EMAILS TAB ─────────────────────────────── */}
      {mainTab === 'emails' && (
        <>
          <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                },
              }}
              sx={{ width: 250 }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="UNREAD">Unread</MenuItem>
                <MenuItem value="READ">Read</MenuItem>
                <MenuItem value="ARCHIVED">Archived</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Purpose</InputLabel>
              <Select value={purposeFilter} label="Purpose" onChange={(e: SelectChangeEvent) => setPurposeFilter(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {PURPOSE_OPTIONS.filter(Boolean).map((p) => (
                  <MenuItem key={p} value={p}>{PURPOSE_LABELS[p] || p}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Int/Ext</InputLabel>
              <Select value={externalFilter} label="Int/Ext" onChange={(e: SelectChangeEvent) => setExternalFilter(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="false">Internal</MenuItem>
                <MenuItem value="true">External</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <Box textAlign="center" mt={4}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>From</strong></TableCell>
                    <TableCell><strong>Subject</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Purpose</strong></TableCell>
                    <TableCell align="center"><strong>Attachments</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emails.map((email) => (
                    <TableRow
                      key={email.id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        fontWeight: email.status === 'UNREAD' ? 'bold' : 'normal',
                        bgcolor: email.status === 'UNREAD' ? 'action.hover' : 'inherit',
                      }}
                      onClick={() => openDetail(email)}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          {email.isExternal && <ExternalIcon fontSize="small" color="warning" titleAccess="External sender" />}
                          <Box>
                            <Typography variant="body2" fontWeight={email.status === 'UNREAD' ? 'bold' : 'normal'}>
                              {email.fromName || email.fromAddress}
                            </Typography>
                            {email.fromName && (
                              <Typography variant="caption" color="text.secondary">{email.fromAddress}</Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={email.status === 'UNREAD' ? 'bold' : 'normal'}>
                          {email.subject}
                        </Typography>
                      </TableCell>
                      <TableCell>{new Date(email.receivedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={email.status}
                          size="small"
                          color={email.status === 'UNREAD' ? 'primary' : 'default'}
                          variant={email.status === 'ARCHIVED' ? 'outlined' : 'filled'}
                        />
                      </TableCell>
                      <TableCell>
                        {email.purpose && (
                          <Chip
                            label={PURPOSE_LABELS[email.purpose] || email.purpose}
                            size="small"
                            color={PURPOSE_COLORS[email.purpose] || 'default'}
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {(email._count?.attachments ?? 0) > 0 && (
                          <Chip icon={<AttachIcon />} label={email._count?.attachments} size="small" variant="outlined" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {emails.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" sx={{ py: 4 }}>
                          No incoming emails. Configure IMAP settings to start receiving emails.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* ── WHITELIST TAB ──────────────────────────── */}
      {mainTab === 'whitelist' && (
        <Box maxWidth={700}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Manage authorized external senders. If the list is empty, all external senders are allowed.
            Add an email address or domain (e.g. <code>client@corp.com</code> or <code>corp.com</code>).
          </Typography>

          {/* Add form */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start" flexWrap="wrap">
              <TextField
                size="small"
                label="Email or domain"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="client@corp.com or corp.com"
                sx={{ width: 260 }}
              />
              <TextField
                size="small"
                label="Label (optional)"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Client principal"
                sx={{ width: 220 }}
              />
              <Button
                variant="contained"
                startIcon={wlSaving ? <CircularProgress size={14} /> : <AddIcon />}
                onClick={handleAddWhitelist}
                disabled={wlSaving || !newEmail.trim()}
              >
                Add
              </Button>
            </Stack>
          </Paper>

          {wlError && <Alert severity="error" sx={{ mb: 2 }}>{wlError}</Alert>}

          {wlLoading ? (
            <Box textAlign="center" py={3}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Email / Domain</strong></TableCell>
                    <TableCell><strong>Label</strong></TableCell>
                    <TableCell><strong>Added by</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {whitelist.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No whitelist entries — all external senders are currently allowed
                      </TableCell>
                    </TableRow>
                  )}
                  {whitelist.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">{entry.emailOrDomain}</Typography>
                      </TableCell>
                      <TableCell>{entry.label ?? '—'}</TableCell>
                      <TableCell>{entry.addedBy.name}</TableCell>
                      <TableCell>{new Date(entry.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => handleRemoveWhitelist(entry.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* ── EMAIL DETAIL DRAWER ──────────────────── */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 500 } }}>
        {selected && (
          <Box p={3}>
            <Typography variant="h6" gutterBottom>{selected.subject}</Typography>
            <Stack spacing={1} mb={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">From</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography>{selected.fromName ? `${selected.fromName} <${selected.fromAddress}>` : selected.fromAddress}</Typography>
                  {selected.isExternal && <Chip label="External" size="small" color="warning" variant="outlined" />}
                </Stack>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">To</Typography>
                <Typography>{selected.toAddress}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Received</Typography>
                <Typography>{new Date(selected.receivedAt).toLocaleString()}</Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>Classification</Typography>
            <Stack spacing={2} mb={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Purpose</InputLabel>
                <Select value={editPurpose} label="Purpose" onChange={(e) => setEditPurpose(e.target.value)}>
                  <MenuItem value="">Not set</MenuItem>
                  {PURPOSE_OPTIONS.filter(Boolean).map((p) => (
                    <MenuItem key={p} value={p}>{PURPOSE_LABELS[p] || p}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Document Intent</InputLabel>
                <Select value={editDocIntent} label="Document Intent" onChange={(e) => setEditDocIntent(e.target.value)}>
                  <MenuItem value="">Not set</MenuItem>
                  {DOC_INTENT_OPTIONS.filter(Boolean).map((d) => (
                    <MenuItem key={d} value={d}>{DOC_INTENT_LABELS[d] || d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                multiline
                rows={2}
                fullWidth
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleSaveClassification}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Classification'}
              </Button>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {selected.bodyHtml ? (
              <Box
                sx={{ '& img': { maxWidth: '100%' } }}
                dangerouslySetInnerHTML={{ __html: selected.bodyHtml }}
              />
            ) : (
              <Typography whiteSpace="pre-wrap" variant="body2">{selected.bodyText || '(no body)'}</Typography>
            )}

            {selected.attachments && selected.attachments.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>Attachments ({selected.attachments.length})</Typography>
                <Stack spacing={1}>
                  {selected.attachments.map((att) => (
                    <Paper key={att.id} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachIcon fontSize="small" color="action" />
                      <Box flex={1}>
                        <Typography variant="body2">{att.fileName}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatSize(att.fileSize)}</Typography>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </>
            )}

            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1}>
              {selected.status !== 'ARCHIVED' && (
                <Button variant="outlined" size="small" onClick={handleArchive}>Archive</Button>
              )}
              <Button variant="outlined" size="small" onClick={() => setDrawerOpen(false)}>Close</Button>
            </Stack>
          </Box>
        )}
      </Drawer>
    </>
  );
}
