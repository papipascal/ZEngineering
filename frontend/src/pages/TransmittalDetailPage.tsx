import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Paper, Box, Chip, Stack, Button, Table, TableBody, TableCell,
  TableHead, TableRow, CircularProgress, Alert, Divider,
} from '@mui/material';
import { transmittalApi, Transmittal } from '../api/transmittals';

const PURPOSE_LABELS: Record<string, string> = {
  FOR_REVIEW: 'For Review',
  FOR_APPROVAL: 'For Approval',
  FOR_INFORMATION: 'For Information',
  FOR_CONSTRUCTION: 'For Construction',
  AS_BUILT: 'As Built',
};

const PURPOSE_COLORS: Record<string, 'primary' | 'warning' | 'success' | 'secondary' | 'default'> = {
  FOR_REVIEW: 'primary',
  FOR_APPROVAL: 'warning',
  FOR_INFORMATION: 'success',
  FOR_CONSTRUCTION: 'secondary',
  AS_BUILT: 'default',
};

export default function TransmittalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transmittal, setTransmittal] = useState<Transmittal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    transmittalApi.getById(id).then((r) => setTransmittal(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleSend = async () => {
    if (!id) return;
    setSending(true);
    setError('');
    try {
      await transmittalApi.send(id);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Send failed';
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await transmittalApi.remove(id);
      navigate('/transmittals');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Delete failed';
      setError(msg);
    }
  };

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (!transmittal) return <Typography>Transmittal not found</Typography>;

  return (
    <>
      <Button size="small" onClick={() => navigate('/transmittals')} sx={{ mb: 2 }}>&larr; Back to Transmittals</Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" gutterBottom>{transmittal.transmittalNumber}</Typography>
            <Typography variant="h6" color="text.secondary">{transmittal.subject}</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip
              label={PURPOSE_LABELS[transmittal.purpose] ?? transmittal.purpose}
              color={PURPOSE_COLORS[transmittal.purpose] ?? 'default'}
            />
            <Chip
              label={transmittal.status}
              variant="outlined"
              color={transmittal.status === 'SENT' ? 'info' : transmittal.status === 'ACKNOWLEDGED' ? 'success' : 'default'}
            />
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">Recipient</Typography>
            <Typography>{transmittal.recipientName}</Typography>
            <Typography variant="body2" color="text.secondary">{transmittal.recipientEmail}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Sent By</Typography>
            <Typography>{transmittal.sentBy.name}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Recipient Type</Typography>
            <Chip label={transmittal.recipientType} size="small" variant="outlined" />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Date</Typography>
            <Typography>
              {transmittal.sentAt
                ? `Sent: ${new Date(transmittal.sentAt).toLocaleString()}`
                : `Created: ${new Date(transmittal.createdAt).toLocaleString()}`}
            </Typography>
          </Box>
        </Box>

        {transmittal.coverLetter && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>Cover Letter</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography whiteSpace="pre-wrap">{transmittal.coverLetter}</Typography>
            </Paper>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Documents ({transmittal.items?.length ?? 0})</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Document</strong></TableCell>
              <TableCell><strong>Revision</strong></TableCell>
              <TableCell><strong>Remarks</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transmittal.items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.registerEntry
                    ? `${item.registerEntry.documentNumber} - ${item.registerEntry.title}`
                    : item.document?.fileName ?? '-'}
                </TableCell>
                <TableCell>{item.registerEntry?.revision ?? '-'}</TableCell>
                <TableCell>{item.remarks ?? '-'}</TableCell>
              </TableRow>
            ))}
            {(!transmittal.items || transmittal.items.length === 0) && (
              <TableRow>
                <TableCell colSpan={3} align="center">No items</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {transmittal.status === 'DRAFT' && (
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleSend} disabled={sending}>
            {sending ? 'Sending...' : 'Send Transmittal'}
          </Button>
          <Button variant="outlined" color="error" onClick={handleDelete}>Delete Draft</Button>
        </Stack>
      )}
    </>
  );
}
