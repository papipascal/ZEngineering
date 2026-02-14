import { useEffect, useState } from 'react';
import {
  Typography, Box, TextField, Stack, MenuItem, Card, CardContent,
  CircularProgress, Chip, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { documentApi, Document as DocType } from '../api/documents';
import { equipmentApi } from '../api/equipment';
import DocumentList from '../components/DocumentList';
import FileUploadButton from '../components/FileUploadButton';

const CATEGORIES = ['ALL', 'DATASHEET', 'SPECIFICATION', 'DRAWING', 'CERTIFICATION', 'QUOTE', 'REPORT', 'MANUAL', 'OTHER'];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    // Get project ID from first equipment item
    equipmentApi.list().then((r) => {
      if (r.data.length > 0) {
        setProjectId(r.data[0].projectId);
      }
    });
  }, []);

  useEffect(() => {
    loadDocs();
  }, [category, search]);

  const loadDocs = () => {
    setLoading(true);
    documentApi.list({
      category: category !== 'ALL' ? category : undefined,
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
        {projectId && (
          <FileUploadButton
            projectId={projectId}
            onUploaded={handleUploaded}
            label="Upload Document"
            size="medium"
          />
        )}
      </Stack>

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
