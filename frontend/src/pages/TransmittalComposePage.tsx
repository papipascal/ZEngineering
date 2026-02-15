import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, TextField, Button, Stack, MenuItem, Select, FormControl,
  InputLabel, Box, Paper, Alert, IconButton, Table, TableBody, TableCell,
  TableHead, TableRow, Autocomplete, SelectChangeEvent,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { useProjectId } from '../auth/ProjectContext';
import { transmittalApi } from '../api/transmittals';
import { documentRegisterApi, DocumentRegisterEntry } from '../api/document-register';

const PURPOSES = [
  { value: 'FOR_REVIEW', label: 'For Review' },
  { value: 'FOR_APPROVAL', label: 'For Approval' },
  { value: 'FOR_INFORMATION', label: 'For Information' },
  { value: 'FOR_CONSTRUCTION', label: 'For Construction' },
  { value: 'AS_BUILT', label: 'As Built' },
];

interface ItemRow {
  registerEntryId?: string;
  registerEntry?: DocumentRegisterEntry;
  remarks: string;
}

export default function TransmittalComposePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const projectId = useProjectId();
  const [subject, setSubject] = useState('');
  const [purpose, setPurpose] = useState('FOR_REVIEW');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientType, setRecipientType] = useState('OTHER');
  const [coverLetter, setCoverLetter] = useState('');
  const [items, setItems] = useState<ItemRow[]>([]);
  const [registerEntries, setRegisterEntries] = useState<DocumentRegisterEntry[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (projectId) {
      documentRegisterApi.list({ projectId }).then((r) => setRegisterEntries(r.data));
    }
  }, [projectId]);

  const addItem = () => {
    setItems([...items, { remarks: '' }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof ItemRow, value: string | DocumentRegisterEntry | undefined) => {
    const updated = [...items];
    if (field === 'registerEntry') {
      const entry = value as DocumentRegisterEntry | undefined;
      updated[idx] = { ...updated[idx], registerEntry: entry, registerEntryId: entry?.id };
    } else {
      updated[idx] = { ...updated[idx], [field]: value };
    }
    setItems(updated);
  };

  const handleSave = async (sendNow: boolean) => {
    setError('');
    setSaving(true);
    try {
      const data = {
        projectId: projectId || '',
        subject,
        purpose,
        recipientName,
        recipientEmail,
        recipientType,
        coverLetter: coverLetter || undefined,
        sentById: user!.id,
        items: items
          .filter((it) => it.registerEntryId)
          .map((it) => ({ registerEntryId: it.registerEntryId, remarks: it.remarks || undefined })),
      };
      const res = await transmittalApi.create(data);
      if (sendNow) {
        await transmittalApi.send(res.data.id);
      }
      navigate('/transmittals');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>New Transmittal</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <TextField label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} fullWidth />
          <Box display="flex" gap={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Purpose</InputLabel>
              <Select value={purpose} label="Purpose" onChange={(e: SelectChangeEvent) => setPurpose(e.target.value)}>
                {PURPOSES.map((p) => (
                  <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Recipient Type</InputLabel>
              <Select value={recipientType} label="Recipient Type" onChange={(e: SelectChangeEvent) => setRecipientType(e.target.value)}>
                <MenuItem value="VENDOR">Vendor</MenuItem>
                <MenuItem value="PARTNER">Partner</MenuItem>
                <MenuItem value="CLIENT">Client</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" gap={2}>
            <TextField label="Recipient Name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} sx={{ flex: 1 }} />
            <TextField label="Recipient Email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} sx={{ flex: 1 }} />
          </Box>
          <TextField
            label="Cover Letter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            multiline
            rows={4}
            fullWidth
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Documents</Typography>
          <Button variant="outlined" size="small" onClick={addItem}>Add Document</Button>
        </Stack>

        {items.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Document</strong></TableCell>
                <TableCell><strong>Remarks</strong></TableCell>
                <TableCell width={50} />
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ minWidth: 300 }}>
                    <Autocomplete
                      size="small"
                      options={registerEntries}
                      getOptionLabel={(opt) => `${opt.documentNumber} - ${opt.title} (Rev ${opt.revision})`}
                      value={item.registerEntry || null}
                      onChange={(_, v) => updateItem(idx, 'registerEntry', v || undefined)}
                      renderInput={(params) => <TextField {...params} placeholder="Select document..." />}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={item.remarks}
                      onChange={(e) => updateItem(idx, 'remarks', e.target.value)}
                      placeholder="Remarks..."
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => removeItem(idx)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography color="text.secondary" textAlign="center">
            No documents added. Click "Add Document" to attach documents from the register.
          </Typography>
        )}
      </Paper>

      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={() => navigate('/transmittals')}>Cancel</Button>
        <Button
          variant="outlined"
          onClick={() => handleSave(false)}
          disabled={saving || !subject || !recipientName || !recipientEmail}
        >
          Save as Draft
        </Button>
        <Button
          variant="contained"
          onClick={() => handleSave(true)}
          disabled={saving || !subject || !recipientName || !recipientEmail || items.length === 0}
        >
          Send Now
        </Button>
      </Stack>
    </>
  );
}
