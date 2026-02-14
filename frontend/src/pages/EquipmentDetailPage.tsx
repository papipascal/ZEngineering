import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Card, CardContent, Grid, Chip, Box, Divider, Button,
  TextField, Stack, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem,
} from '@mui/material';
import { equipmentApi, Equipment } from '../api/equipment';
import { changeRequestApi, ChangeRequest } from '../api/change-requests';
import { documentApi, Document as DocType } from '../api/documents';
import DocumentList from '../components/DocumentList';
import FileUploadButton from '../components/FileUploadButton';

const EDITABLE_FIELDS = [
  { key: 'operatingPressure', label: 'Operating Pressure (barg)' },
  { key: 'operatingTemperature', label: 'Operating Temperature (°C)' },
  { key: 'designPressure', label: 'Design Pressure (barg)' },
  { key: 'designTemperature', label: 'Design Temperature (°C)' },
  { key: 'estimatedWeight', label: 'Estimated Weight (kg)' },
  { key: 'material', label: 'Material' },
  { key: 'size', label: 'Size' },
  { key: 'notes', label: 'Notes' },
  { key: 'service', label: 'Service Description' },
];

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [eq, setEq] = useState<Equipment | null>(null);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [justification, setJustification] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [documents, setDocuments] = useState<DocType[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      equipmentApi.getById(id).then((r) => setEq(r.data)),
      changeRequestApi.list().then((r) =>
        setChangeRequests(r.data.filter((cr) => cr.equipmentId === id)),
      ),
      documentApi.list({ equipmentId: id }).then((r) => setDocuments(r.data)),
    ]).finally(() => setLoading(false));
  }, [id]);

  const handleSubmitChange = async () => {
    setSubmitError('');
    try {
      await changeRequestApi.create({
        equipmentId: id!,
        fieldName,
        newValue,
        justification: justification || undefined,
      });
      setSubmitSuccess(`Change request submitted for ${fieldName}. Awaiting approval.`);
      setDialogOpen(false);
      setFieldName('');
      setNewValue('');
      setJustification('');
      // Refresh change requests
      changeRequestApi.list().then((r) =>
        setChangeRequests(r.data.filter((cr) => cr.equipmentId === id)),
      );
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit';
      setSubmitError(msg);
    }
  };

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (!eq) return <Typography>Equipment not found</Typography>;

  const currentValue = (eq as unknown as Record<string, unknown>)[fieldName];

  return (
    <>
      <Button variant="text" onClick={() => navigate('/equipment')} sx={{ mb: 1 }}>
        &larr; Back to Equipment
      </Button>

      <Typography variant="h4" gutterBottom>
        {eq.tagNumber} - {eq.service}
      </Typography>

      {submitSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSubmitSuccess('')}>{submitSuccess}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Specifications</Typography>
              <Grid container spacing={2}>
                {[
                  ['Tag Number', eq.tagNumber],
                  ['Service', eq.service],
                  ['Category', eq.category],
                  ['Sub-Type', eq.subType],
                  ['Quantity', eq.quantity],
                  ['Material', eq.material],
                  ['Operating Pressure', eq.operatingPressure != null ? `${eq.operatingPressure} barg` : '-'],
                  ['Operating Temperature', eq.operatingTemperature != null ? `${eq.operatingTemperature} °C` : '-'],
                  ['Design Pressure', eq.designPressure != null ? `${eq.designPressure} barg` : '-'],
                  ['Design Temperature', eq.designTemperature != null ? `${eq.designTemperature} °C` : '-'],
                  ['Estimated Weight', eq.estimatedWeight != null ? `${eq.estimatedWeight} kg` : '-'],
                  ['Size', eq.size ?? '-'],
                ].map(([label, value]) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={label as string}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="body1">{value ?? '-'}</Typography>
                  </Grid>
                ))}
              </Grid>
              {eq.notes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="text.secondary">Notes</Typography>
                  <Typography variant="body2">{eq.notes}</Typography>
                </>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Documents</Typography>
                {eq.projectId && (
                  <FileUploadButton
                    projectId={eq.projectId}
                    equipmentId={eq.id}
                    category="DATASHEET"
                    onUploaded={(doc) => setDocuments((prev) => [doc, ...prev])}
                  />
                )}
              </Stack>
              <DocumentList
                documents={documents}
                onDeleted={(docId) => setDocuments((prev) => prev.filter((d) => d.id !== docId))}
                compact
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Request a Change</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Submit a change request to modify this equipment's data.
                A project manager must approve before it takes effect.
              </Typography>
              <Button variant="contained" fullWidth onClick={() => setDialogOpen(true)}>
                Submit Change Request
              </Button>
            </CardContent>
          </Card>

          {changeRequests.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Change History</Typography>
                <Stack spacing={1}>
                  {changeRequests.map((cr) => (
                    <Box key={cr.id} p={1} bgcolor="#f9f9f9" borderRadius={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight="bold">{cr.fieldName}</Typography>
                        <Chip
                          label={cr.status}
                          size="small"
                          color={cr.status === 'APPROVED' ? 'success' : cr.status === 'REJECTED' ? 'error' : 'warning'}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {cr.oldValue ?? 'null'} &rarr; {cr.newValue}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        by {cr.requester.name} - {new Date(cr.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}

          {eq.discussions && eq.discussions.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Related Discussions</Typography>
                <Stack spacing={1}>
                  {eq.discussions.map((d) => (
                    <Box
                      key={d.id}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f0f0f0' }, p: 1, borderRadius: 1 }}
                      onClick={() => navigate(`/discussions/${d.id}`)}
                    >
                      <Typography variant="body2">{d.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        by {d.author.name}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Change Request Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Change Request</DialogTitle>
        <DialogContent>
          {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
          <Stack spacing={2} mt={1}>
            <TextField
              select
              label="Field to change"
              value={fieldName}
              onChange={(e) => { setFieldName(e.target.value); setNewValue(''); }}
              fullWidth
            >
              {EDITABLE_FIELDS.map((f) => (
                <MenuItem key={f.key} value={f.key}>{f.label}</MenuItem>
              ))}
            </TextField>
            {fieldName && (
              <Typography variant="caption" color="text.secondary">
                Current value: {currentValue != null ? String(currentValue) : 'not set'}
              </Typography>
            )}
            <TextField
              label="New value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              fullWidth
              disabled={!fieldName}
            />
            <TextField
              label="Justification (optional)"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitChange}
            disabled={!fieldName || !newValue}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
