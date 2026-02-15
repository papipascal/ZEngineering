import { useEffect, useState } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, Chip, TextField, InputAdornment, CircularProgress, Stack,
  MenuItem, Select, FormControl, InputLabel, IconButton, Drawer, Divider,
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import { useProject } from '../auth/ProjectContext';
import { documentRegisterApi, DocumentRegisterEntry } from '../api/document-register';
import FileUploadButton from '../components/FileUploadButton';
import DocumentList from '../components/DocumentList';
import ExportExcelButton from '../components/ExportExcelButton';

const STATUS_COLORS: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  DRAFT: 'default',
  FOR_REVIEW: 'info',
  FOR_APPROVAL: 'warning',
  APPROVED: 'success',
  SUPERSEDED: 'error',
  CANCELLED: 'error',
};

const DISCIPLINES = ['', 'PROCESS', 'PIPING', 'ELECTRICAL', 'INSTRUMENTATION', 'CIVIL', 'MECHANICAL'];
const STATUSES = ['', 'DRAFT', 'FOR_REVIEW', 'FOR_APPROVAL', 'APPROVED', 'SUPERSEDED', 'CANCELLED'];

export default function ProjectDocumentRegisterPage() {
  const projectId = useProject().project?.id;
  const [entries, setEntries] = useState<DocumentRegisterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [status, setStatus] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<DocumentRegisterEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchEntries = () => {
    if (!projectId) return;
    setLoading(true);
    const filter: Record<string, string> = { projectId };
    if (search) filter.search = search;
    if (discipline) filter.discipline = discipline;
    if (status) filter.status = status;
    documentRegisterApi.list(filter)
      .then((r) => setEntries(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEntries(); }, [projectId, discipline, status]);

  useEffect(() => {
    const t = setTimeout(fetchEntries, 400);
    return () => clearTimeout(t);
  }, [search]);

  const openDrawer = (entry: DocumentRegisterEntry) => {
    documentRegisterApi.getById(entry.id).then((r) => {
      setSelectedEntry(r.data);
      setDrawerOpen(true);
    });
  };

  const handleUploadComplete = () => {
    if (selectedEntry) {
      documentRegisterApi.getById(selectedEntry.id).then((r) => setSelectedEntry(r.data));
    }
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h4">Document Register</Typography>
        <ExportExcelButton
          data={entries.map((e) => ({ ...e, ownerName: e.owner.name, issuerName: e.issuer?.name ?? '', issueDateStr: e.issueDate ? new Date(e.issueDate).toLocaleDateString() : '' })) as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'documentNumber', header: 'Doc Number' },
            { key: 'title', header: 'Title' },
            { key: 'discipline', header: 'Discipline' },
            { key: 'revision', header: 'Rev' },
            { key: 'status', header: 'Status' },
            { key: 'ownerName', header: 'Owner' },
            { key: 'issuerName', header: 'Issuer' },
            { key: 'issueDateStr', header: 'Issue Date' },
          ]}
          fileName="document-register"
        />
      </Stack>

      {/* Filters */}
      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap" useFlexGap>
        <TextField
          size="small"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ minWidth: 220 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Discipline</InputLabel>
          <Select value={discipline} label="Discipline" onChange={(e) => setDiscipline(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {DISCIPLINES.filter(Boolean).map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {STATUSES.filter(Boolean).map((s) => <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      {loading ? (
        <Box textAlign="center" mt={4}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Doc Number</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Discipline</TableCell>
                <TableCell>Rev</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Issuer</TableCell>
                <TableCell>Issue Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" py={2}>
                      No entries found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((e) => (
                  <TableRow
                    key={e.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => openDrawer(e)}
                  >
                    <TableCell><Typography variant="body2" fontWeight="bold">{e.documentNumber}</Typography></TableCell>
                    <TableCell>{e.title}</TableCell>
                    <TableCell><Chip label={e.discipline} size="small" /></TableCell>
                    <TableCell>{e.revision}</TableCell>
                    <TableCell>
                      <Chip label={e.status.replace(/_/g, ' ')} size="small" color={STATUS_COLORS[e.status] ?? 'default'} />
                    </TableCell>
                    <TableCell>{e.owner.name}</TableCell>
                    <TableCell>{e.issuer?.name ?? '—'}</TableCell>
                    <TableCell>{e.issueDate ? new Date(e.issueDate).toLocaleDateString() : '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detail Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, p: 3 } }}
      >
        {selectedEntry && (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">{selectedEntry.documentNumber}</Typography>
              <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
            </Stack>

            <Typography variant="subtitle1" gutterBottom>{selectedEntry.title}</Typography>
            {selectedEntry.description && (
              <Typography variant="body2" color="text.secondary" mb={2}>{selectedEntry.description}</Typography>
            )}

            <Stack spacing={1} mb={3}>
              <Stack direction="row" spacing={1}>
                <Chip label={selectedEntry.discipline} size="small" />
                <Chip label={`Rev ${selectedEntry.revision}`} size="small" variant="outlined" />
                <Chip label={selectedEntry.status.replace(/_/g, ' ')} size="small"
                  color={STATUS_COLORS[selectedEntry.status] ?? 'default'} />
              </Stack>
              <Typography variant="body2">
                <strong>Owner:</strong> {selectedEntry.owner.name} ({selectedEntry.owner.email})
              </Typography>
              {selectedEntry.issuer && (
                <Typography variant="body2">
                  <strong>Issuer:</strong> {selectedEntry.issuer.name} ({selectedEntry.issuer.email})
                </Typography>
              )}
              {selectedEntry.issueDate && (
                <Typography variant="body2">
                  <strong>Issue Date:</strong> {new Date(selectedEntry.issueDate).toLocaleDateString()}
                </Typography>
              )}
            </Stack>

            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>File Revisions</Typography>

            {selectedEntry.revisions && selectedEntry.revisions.length > 0 ? (
              <DocumentList
                documents={selectedEntry.revisions.map((r) => ({
                  id: r.id,
                  fileName: r.fileName,
                  fileSize: r.fileSize,
                  mimeType: r.mimeType,
                  createdAt: r.createdAt,
                  uploadedBy: r.uploadedBy,
                })) as any}
                onDeleted={handleUploadComplete}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" mb={2}>
                No files uploaded yet
              </Typography>
            )}

            <FileUploadButton
              projectId={projectId!}
              registerEntryId={selectedEntry.id}
              onUploaded={handleUploadComplete}
            />
          </>
        )}
      </Drawer>
    </>
  );
}
