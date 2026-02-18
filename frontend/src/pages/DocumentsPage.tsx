import { useEffect, useState } from 'react';
import {
  Typography, Box, TextField, Stack, MenuItem, Card, CardContent,
  CircularProgress, Chip, InputAdornment, Tabs, Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { documentApi, Document as DocType } from '../api/documents';
import DocumentList from '../components/DocumentList';
import FileUploadButton from '../components/FileUploadButton';
import { useProjectId } from '../auth/ProjectContext';
import ExportExcelButton from '../components/ExportExcelButton';

const CATEGORIES = ['ALL', 'DATASHEET', 'SPECIFICATION', 'DRAWING', 'CERTIFICATION', 'QUOTE', 'REPORT', 'MANUAL', 'OTHER'];

const FOLDERS = [
  { value: 'ALL', label: 'All Folders' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'CLIENT_SPECS', label: 'Client & Project Specs' },
  { value: 'ENGINEERING', label: 'Engineering' },
  { value: 'EMAILS', label: 'Emails' },
  { value: 'OTHER', label: 'Other' },
];

export default function DocumentsPage() {
  const projectId = useProjectId();
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [folder, setFolder] = useState('ALL');

  useEffect(() => {
    loadDocs();
  }, [category, folder, search, projectId]);

  const loadDocs = () => {
    setLoading(true);
    documentApi.list({
      projectId: projectId || undefined,
      category: category !== 'ALL' ? category : undefined,
      folder: folder !== 'ALL' ? folder : undefined,
      search: search || undefined,
    })
      .then((r) => setDocuments(r.data))
      .finally(() => setLoading(false));
  };

  const handleUploaded = (doc: DocType) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const handleDeleted = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Project Documents</Typography>
        <Stack direction="row" spacing={1}>
          <ExportExcelButton
            data={documents as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'fileName', header: 'File Name' },
              { key: 'folder', header: 'Folder' },
              { key: 'category', header: 'Category' },
              { key: 'mimeType', header: 'Type' },
              { key: 'fileSize', header: 'Size (bytes)' },
              { key: 'createdAt', header: 'Uploaded' },
            ]}
            fileName="documents"
          />
          {projectId && (
            <FileUploadButton
              projectId={projectId}
              onUploaded={handleUploaded}
              label="Upload Document"
              size="medium"
              folder={folder !== 'ALL' ? folder : undefined}
            />
          )}
        </Stack>
      </Stack>

      {/* Folder tabs */}
      <Tabs
        value={folder}
        onChange={(_e, v) => setFolder(v)}
        sx={{ mb: 2 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {FOLDERS.map((f) => (
          <Tab key={f.value} value={f.value} label={f.label} />
        ))}
      </Tabs>

      <Stack direction="row" spacing={2} mb={3}>
        <TextField
          size="small"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><SearchIcon /></InputAdornment>
            ),
          }}
        />
        <TextField
          select
          size="small"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ minWidth: 180 }}
          label="Category"
        >
          {CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>{c === 'ALL' ? 'All categories' : c}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack direction="row" spacing={1} mb={2}>
        <Chip label={`${documents.length} document${documents.length !== 1 ? 's' : ''}`} size="small" />
        {folder !== 'ALL' && <Chip label={`Folder: ${FOLDERS.find(f => f.value === folder)?.label}`} size="small" color="primary" variant="outlined" />}
      </Stack>

      {loading ? (
        <Box textAlign="center" mt={4}><CircularProgress /></Box>
      ) : (
        <Card>
          <CardContent>
            <DocumentList
              documents={documents}
              onDeleted={handleDeleted}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}
