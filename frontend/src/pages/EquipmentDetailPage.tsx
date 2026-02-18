import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Card, CardContent, Grid, Chip, Box, Divider, Button,
  TextField, Stack, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, IconButton, Tooltip, Drawer,
  Accordion, AccordionSummary, AccordionDetails, Autocomplete,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  HelpOutline as UnknownIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { equipmentApi, Equipment } from '../api/equipment';
import { changeRequestApi, ChangeRequest } from '../api/change-requests';
import { documentApi, Document as DocType } from '../api/documents';
import { dataOriginsApi, DataOrigin, StalenessField } from '../api/data-origins';
import { documentRegisterApi, DocumentRegisterEntry } from '../api/document-register';
import { useProject } from '../auth/ProjectContext';
import { useAuth } from '../auth/AuthContext';
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

const FIELD_LABEL_MAP: Record<string, string> = {};
EDITABLE_FIELDS.forEach((f) => { FIELD_LABEL_MAP[f.key] = f.label; });

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { project } = useProject();
  const { user } = useAuth();
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

  // AGO state
  const [agoFields, setAgoFields] = useState<StalenessField[]>([]);
  const [agoDrawerField, setAgoDrawerField] = useState<string | null>(null);
  const [agoHistory, setAgoHistory] = useState<DataOrigin[]>([]);
  const [registerEntries, setRegisterEntries] = useState<DocumentRegisterEntry[]>([]);
  const [agoForm, setAgoForm] = useState({
    sourceEntryId: '' as string,
    sourceRef: '',
    sourceRevision: '',
    sourceIssueDate: '',
    sourcePage: '',
    notes: '',
  });
  const [agoSaving, setAgoSaving] = useState(false);
  const [agoError, setAgoError] = useState('');

  const loadAgo = () => {
    if (!id) return;
    dataOriginsApi.equipmentStaleness(id).then((r) => setAgoFields(r.data.fields)).catch(() => {});
  };

  useEffect(() => {
    if (!id) return;
    Promise.all([
      equipmentApi.getById(id).then((r) => setEq(r.data)),
      changeRequestApi.list().then((r) =>
        setChangeRequests(r.data.filter((cr) => cr.equipmentId === id)),
      ),
      documentApi.list({ equipmentId: id }).then((r) => setDocuments(r.data)),
    ]).finally(() => setLoading(false));
    loadAgo();
  }, [id]);

  // Load register entries for autocomplete when drawer opens
  useEffect(() => {
    if (agoDrawerField && project) {
      documentRegisterApi.list({ projectId: project.id }).then((r) => setRegisterEntries(r.data)).catch(() => {});
      if (id) {
        dataOriginsApi.history(id, agoDrawerField).then((r) => setAgoHistory(r.data)).catch(() => setAgoHistory([]));
      }
    }
  }, [agoDrawerField, project, id]);

  const getAgoStatus = (fieldKey: string): 'up_to_date' | 'stale' | 'unvalidated' => {
    const f = agoFields.find((af) => af.fieldName === fieldKey);
    return f?.status ?? 'unvalidated';
  };

  const getAgoIcon = (fieldKey: string) => {
    const status = getAgoStatus(fieldKey);
    if (status === 'up_to_date') return <Tooltip title="AGO: Up to date"><CheckIcon sx={{ color: 'success.main', fontSize: 18 }} /></Tooltip>;
    if (status === 'stale') return <Tooltip title="AGO: Source document has newer revision"><WarningIcon sx={{ color: 'warning.main', fontSize: 18 }} /></Tooltip>;
    return <Tooltip title="AGO: No origin recorded"><UnknownIcon sx={{ color: 'text.disabled', fontSize: 18 }} /></Tooltip>;
  };

  const openAgoDrawer = (fieldKey: string) => {
    setAgoDrawerField(fieldKey);
    setAgoForm({ sourceEntryId: '', sourceRef: '', sourceRevision: '', sourceIssueDate: '', sourcePage: '', notes: '' });
    setAgoError('');
  };

  const handleSaveOrigin = async () => {
    if (!id || !eq || !agoDrawerField) return;
    setAgoSaving(true);
    setAgoError('');
    try {
      const fieldValue = String((eq as unknown as Record<string, unknown>)[agoDrawerField] ?? '');
      await dataOriginsApi.create({
        equipmentId: id,
        fieldName: agoDrawerField,
        fieldValue,
        sourceEntryId: agoForm.sourceEntryId || undefined,
        sourceRef: agoForm.sourceRef || undefined,
        sourceRevision: agoForm.sourceRevision || undefined,
        sourceIssueDate: agoForm.sourceIssueDate || undefined,
        sourcePage: agoForm.sourcePage || undefined,
        notes: agoForm.notes || undefined,
      });
      // Refresh
      loadAgo();
      if (id) dataOriginsApi.history(id, agoDrawerField).then((r) => setAgoHistory(r.data)).catch(() => {});
      setAgoForm({ sourceEntryId: '', sourceRef: '', sourceRevision: '', sourceIssueDate: '', sourcePage: '', notes: '' });
    } catch {
      setAgoError('Failed to save origin');
    } finally {
      setAgoSaving(false);
    }
  };

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

  // Spec fields with AGO icons
  const specFields: [string, string, string | null][] = [
    ['tagNumber', 'Tag Number', eq.tagNumber],
    ['service', 'Service', eq.service],
    ['category', 'Category', eq.category],
    ['subType', 'Sub-Type', eq.subType ?? null],
    ['quantity', 'Quantity', String(eq.quantity)],
    ['material', 'Material', eq.material ?? null],
    ['operatingPressure', 'Operating Pressure', eq.operatingPressure != null ? `${eq.operatingPressure} barg` : null],
    ['operatingTemperature', 'Operating Temperature', eq.operatingTemperature != null ? `${eq.operatingTemperature} °C` : null],
    ['designPressure', 'Design Pressure', eq.designPressure != null ? `${eq.designPressure} barg` : null],
    ['designTemperature', 'Design Temperature', eq.designTemperature != null ? `${eq.designTemperature} °C` : null],
    ['estimatedWeight', 'Estimated Weight', eq.estimatedWeight != null ? `${eq.estimatedWeight} kg` : null],
    ['size', 'Size', eq.size ?? null],
  ];

  const isEditableField = (key: string) => EDITABLE_FIELDS.some((f) => f.key === key);

  const latestOriginForDrawer = agoFields.find((f) => f.fieldName === agoDrawerField);

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
                {specFields.map(([key, label, value]) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={key}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      {isEditableField(key) && (
                        <IconButton size="small" onClick={() => openAgoDrawer(key)} sx={{ p: 0.25 }}>
                          {getAgoIcon(key)}
                        </IconButton>
                      )}
                    </Stack>
                    <Typography variant="body1">{value ?? '-'}</Typography>
                  </Grid>
                ))}
              </Grid>
              {eq.notes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">Notes</Typography>
                    <IconButton size="small" onClick={() => openAgoDrawer('notes')} sx={{ p: 0.25 }}>
                      {getAgoIcon('notes')}
                    </IconButton>
                  </Stack>
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
          {/* AGO Summary Card */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>AGO Status</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Approved &amp; Guaranteed Origin — data traceability
              </Typography>
              {agoFields.length > 0 ? (
                <Stack spacing={0.5}>
                  {agoFields.map((f) => (
                    <Stack key={f.fieldName} direction="row" alignItems="center" spacing={1}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' }, p: 0.5, borderRadius: 1 }}
                      onClick={() => openAgoDrawer(f.fieldName)}
                    >
                      {f.status === 'up_to_date' && <CheckIcon sx={{ color: 'success.main', fontSize: 16 }} />}
                      {f.status === 'stale' && <WarningIcon sx={{ color: 'warning.main', fontSize: 16 }} />}
                      {f.status === 'unvalidated' && <UnknownIcon sx={{ color: 'text.disabled', fontSize: 16 }} />}
                      <Typography variant="body2">{FIELD_LABEL_MAP[f.fieldName] ?? f.fieldName}</Typography>
                      {f.origin?.sourceEntry && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                          Rev. {f.origin.sourceRevision}
                        </Typography>
                      )}
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No AGO data yet. Click field icons to add origins.
                </Typography>
              )}
            </CardContent>
          </Card>

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

      {/* AGO Origin Drawer */}
      <Drawer
        anchor="right"
        open={!!agoDrawerField}
        onClose={() => setAgoDrawerField(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}
      >
        {agoDrawerField && (
          <Box p={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                AGO: {FIELD_LABEL_MAP[agoDrawerField] ?? agoDrawerField}
              </Typography>
              <IconButton onClick={() => setAgoDrawerField(null)}><CloseIcon /></IconButton>
            </Stack>

            <Typography variant="body2" color="text.secondary" mb={1}>
              Current value: <strong>{String((eq as unknown as Record<string, unknown>)[agoDrawerField] ?? 'not set')}</strong>
            </Typography>

            {/* Latest origin */}
            {latestOriginForDrawer?.origin ? (
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>Current Origin</Typography>
                  <Stack spacing={0.5}>
                    {latestOriginForDrawer.origin.sourceEntry && (
                      <Typography variant="body2">
                        Source: <strong>{latestOriginForDrawer.origin.sourceEntry.documentNumber}</strong> — {latestOriginForDrawer.origin.sourceEntry.title}
                      </Typography>
                    )}
                    {latestOriginForDrawer.origin.sourceRef && !latestOriginForDrawer.origin.sourceEntry && (
                      <Typography variant="body2">Source ref: {latestOriginForDrawer.origin.sourceRef}</Typography>
                    )}
                    <Typography variant="body2">
                      Revision: {latestOriginForDrawer.origin.sourceRevision ?? '-'}
                      {latestOriginForDrawer.status === 'stale' && (
                        <Chip label={`Latest: ${latestOriginForDrawer.latestRevision}`} size="small" color="warning" sx={{ ml: 1 }} />
                      )}
                    </Typography>
                    {latestOriginForDrawer.origin.sourceIssueDate && (
                      <Typography variant="body2">Issue date: {new Date(latestOriginForDrawer.origin.sourceIssueDate).toLocaleDateString()}</Typography>
                    )}
                    {latestOriginForDrawer.origin.sourcePage && (
                      <Typography variant="body2">Page/Clause: {latestOriginForDrawer.origin.sourcePage}</Typography>
                    )}
                    <Typography variant="body2">
                      Validated by: {latestOriginForDrawer.origin.validatedBy.name} on {new Date(latestOriginForDrawer.origin.validatedAt).toLocaleDateString()}
                    </Typography>
                    {latestOriginForDrawer.origin.notes && (
                      <Typography variant="body2" color="text.secondary">Notes: {latestOriginForDrawer.origin.notes}</Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">Value at validation: {latestOriginForDrawer.origin.fieldValue}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>No origin recorded for this field yet.</Alert>
            )}

            {/* Add/Update Origin Form */}
            <Accordion defaultExpanded={!latestOriginForDrawer?.origin}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  {latestOriginForDrawer?.origin ? 'Update Origin' : 'Add Origin'}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {agoError && <Alert severity="error" sx={{ mb: 1 }}>{agoError}</Alert>}
                <Stack spacing={2}>
                  <Autocomplete
                    options={registerEntries}
                    getOptionLabel={(opt) => `${opt.documentNumber} — ${opt.title} (Rev. ${opt.revision})`}
                    value={registerEntries.find((e) => e.id === agoForm.sourceEntryId) ?? null}
                    onChange={(_, val) => {
                      setAgoForm((prev) => ({
                        ...prev,
                        sourceEntryId: val?.id ?? '',
                        sourceRevision: val?.revision ?? prev.sourceRevision,
                        sourceIssueDate: val?.issueDate ?? prev.sourceIssueDate,
                      }));
                    }}
                    renderInput={(params) => <TextField {...params} label="Source Document (Register)" size="small" />}
                  />
                  <TextField
                    label="Or free-text reference"
                    value={agoForm.sourceRef}
                    onChange={(e) => setAgoForm((p) => ({ ...p, sourceRef: e.target.value }))}
                    size="small"
                    disabled={!!agoForm.sourceEntryId}
                  />
                  <Stack direction="row" spacing={1}>
                    <TextField
                      label="Revision"
                      value={agoForm.sourceRevision}
                      onChange={(e) => setAgoForm((p) => ({ ...p, sourceRevision: e.target.value }))}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Issue date"
                      type="date"
                      value={agoForm.sourceIssueDate ? agoForm.sourceIssueDate.substring(0, 10) : ''}
                      onChange={(e) => setAgoForm((p) => ({ ...p, sourceIssueDate: e.target.value }))}
                      size="small"
                      sx={{ flex: 1 }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Stack>
                  <TextField
                    label="Page / Clause"
                    value={agoForm.sourcePage}
                    onChange={(e) => setAgoForm((p) => ({ ...p, sourcePage: e.target.value }))}
                    size="small"
                  />
                  <TextField
                    label="Notes"
                    value={agoForm.notes}
                    onChange={(e) => setAgoForm((p) => ({ ...p, notes: e.target.value }))}
                    size="small"
                    multiline
                    rows={2}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSaveOrigin}
                    disabled={agoSaving || (!agoForm.sourceEntryId && !agoForm.sourceRef)}
                  >
                    {agoSaving ? 'Saving...' : 'Save Origin'}
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* History */}
            {agoHistory.length > 1 && (
              <Accordion sx={{ mt: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">Origin History ({agoHistory.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1}>
                    {agoHistory.map((o) => (
                      <Box key={o.id} p={1} bgcolor="#f9f9f9" borderRadius={1}>
                        <Typography variant="body2">
                          {o.sourceEntry ? `${o.sourceEntry.documentNumber} (Rev. ${o.sourceRevision})` : o.sourceRef ?? 'No source'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Value: {o.fieldValue} | By {o.validatedBy.name} on {new Date(o.validatedAt).toLocaleDateString()}
                        </Typography>
                        {o.sourcePage && <Typography variant="caption" display="block" color="text.secondary">Page: {o.sourcePage}</Typography>}
                        {o.notes && <Typography variant="caption" display="block" color="text.secondary">Notes: {o.notes}</Typography>}
                      </Box>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        )}
      </Drawer>
    </>
  );
}
