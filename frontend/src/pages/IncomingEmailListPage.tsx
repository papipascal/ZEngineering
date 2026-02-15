import { useEffect, useState } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Box, Chip, InputAdornment, CircularProgress, Stack,
  MenuItem, Select, FormControl, InputLabel, Drawer, Button, Divider, SelectChangeEvent,
} from '@mui/material';
import { Search as SearchIcon, AttachFile as AttachIcon } from '@mui/icons-material';
import { incomingEmailApi, IncomingEmail } from '../api/incoming-emails';
import { useProjectId } from '../auth/ProjectContext';
import ExportExcelButton from '../components/ExportExcelButton';

export default function IncomingEmailListPage() {
  const projectId = useProjectId();
  const [emails, setEmails] = useState<IncomingEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<IncomingEmail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const load = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (projectId) params.projectId = projectId;
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    incomingEmailApi.list(params).then((r) => setEmails(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, statusFilter, projectId]);

  const openDetail = async (email: IncomingEmail) => {
    const res = await incomingEmailApi.getById(email.id);
    setSelected(res.data);
    setDrawerOpen(true);
    if (email.status === 'UNREAD') {
      await incomingEmailApi.updateStatus(email.id, 'READ');
      load();
    }
  };

  const handleArchive = async () => {
    if (!selected) return;
    await incomingEmailApi.updateStatus(selected.id, 'ARCHIVED');
    setDrawerOpen(false);
    load();
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
        <ExportExcelButton
          data={emails.map((e) => ({ ...e, from: e.fromName ? `${e.fromName} <${e.fromAddress}>` : e.fromAddress, dateStr: new Date(e.receivedAt).toLocaleString(), attachmentCount: e._count?.attachments ?? 0 })) as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'from', header: 'From' },
            { key: 'subject', header: 'Subject' },
            { key: 'dateStr', header: 'Received' },
            { key: 'status', header: 'Status' },
            { key: 'attachmentCount', header: 'Attachments' },
          ]}
          fileName="incoming-emails"
        />
      </Stack>

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
                    <Typography variant="body2" fontWeight={email.status === 'UNREAD' ? 'bold' : 'normal'}>
                      {email.fromName || email.fromAddress}
                    </Typography>
                    {email.fromName && (
                      <Typography variant="caption" color="text.secondary">{email.fromAddress}</Typography>
                    )}
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
                      color={email.status === 'UNREAD' ? 'primary' : email.status === 'READ' ? 'default' : 'default'}
                      variant={email.status === 'ARCHIVED' ? 'outlined' : 'filled'}
                    />
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
                  <TableCell colSpan={5} align="center">
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

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 500 } }}>
        {selected && (
          <Box p={3}>
            <Typography variant="h6" gutterBottom>{selected.subject}</Typography>
            <Stack spacing={1} mb={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">From</Typography>
                <Typography>{selected.fromName ? `${selected.fromName} <${selected.fromAddress}>` : selected.fromAddress}</Typography>
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
