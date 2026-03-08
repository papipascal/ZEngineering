import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Card, CardContent, Grid, Chip, Box, Divider, Button,
  TextField, Stack, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, IconButton, Tooltip, Drawer,
  Accordion, AccordionSummary, AccordionDetails, Autocomplete,
  Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody, Paper,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  HelpOutline as UnknownIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  Build as BuildIcon,
  FactCheck as InspectionIcon,
  Engineering as MaintenanceIcon,
} from '@mui/icons-material';
import { equipmentApi, Equipment } from '../api/equipment';
import { changeRequestApi, ChangeRequest } from '../api/change-requests';
import { documentApi, Document as DocType } from '../api/documents';
import { dataOriginsApi, DataOrigin, StalenessField } from '../api/data-origins';
import { documentRegisterApi, DocumentRegisterEntry } from '../api/document-register';
import { connectionsApi, Connection, ConnectionType, CreateConnectionDto } from '../api/connections';
import { sparePartsApi, SparePart, SparePartCriticality, CreateSparePartDto } from '../api/spare-parts';
import { inspectionsApi, InspectionRecord, InspectionType, InspectionResult, CreateInspectionDto } from '../api/inspections';
import { maintenanceApi, MaintenancePlan, MaintenanceFrequency, CreateMaintenancePlanDto } from '../api/maintenance';
import { useProject } from '../auth/ProjectContext';
import { useAuth } from '../auth/AuthContext';
import DocumentList from '../components/DocumentList';
import FileUploadButton from '../components/FileUploadButton';

const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
  PROCESS_LINE: 'Ligne process', INSTRUMENT_LOOP: 'Boucle instru.',
  ELECTRICAL_CABLE: 'Câble élec.', UTILITY_LINE: 'Utilité', DRAIN_VENT: 'Drain/Évent',
};
const CRITICALITY_LABELS: Record<SparePartCriticality, string> = {
  CRITICAL: 'Critique', IMPORTANT: 'Important', STANDARD: 'Standard', CONSUMABLE: 'Consommable',
};
const CRITICALITY_COLORS: Record<SparePartCriticality, 'error' | 'warning' | 'info' | 'default'> = {
  CRITICAL: 'error', IMPORTANT: 'warning', STANDARD: 'info', CONSUMABLE: 'default',
};
const INSPECTION_TYPE_LABELS: Record<InspectionType, string> = {
  VISUAL: 'Visuel', NDT_UT: 'UT', NDT_RT: 'Radiographie', NDT_PT: 'Ressuage', NDT_MT: 'Magnétoscopie',
  PRESSURE_TEST: 'Test pression', FUNCTIONAL_TEST: 'Essai fonct.', FAT: 'FAT', SAT: 'SAT', PMI: 'PMI',
};
const INSPECTION_RESULT_COLORS: Record<InspectionResult, 'success' | 'warning' | 'error' | 'info'> = {
  PASS: 'success', PASS_WITH_REMARKS: 'warning', FAIL: 'error', PENDING_REVIEW: 'info',
};
const MAINTENANCE_FREQ_LABELS: Record<MaintenanceFrequency, string> = {
  DAILY: 'Quotidien', WEEKLY: 'Hebdo', MONTHLY: 'Mensuel', QUARTERLY: 'Trimestriel',
  SEMI_ANNUAL: 'Semestriel', ANNUAL: 'Annuel', BIENNIAL: 'Bisannuel', ON_CONDITION: 'Sur condition',
};

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
  const [tab, setTab] = useState(0);
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

  // New satellite state
  const [connections, setConnections]       = useState<Connection[]>([]);
  const [spareParts, setSpareParts]         = useState<SparePart[]>([]);
  const [inspections, setInspections]       = useState<InspectionRecord[]>([]);
  const [maintenancePlans, setMaintPlans]   = useState<MaintenancePlan[]>([]);

  // Dialog states for new entities
  const [connDialog, setConnDialog]   = useState(false);
  const [spDialog, setSpDialog]       = useState(false);
  const [inspecDialog, setInspecDialog] = useState(false);
  const [maintDialog, setMaintDialog] = useState(false);
  const [connForm, setConnForm]   = useState<Partial<CreateConnectionDto>>({ type: 'PROCESS_LINE', isoCertRequired: false });
  const [spForm, setSpForm]       = useState<Partial<CreateSparePartDto>>({ criticality: 'STANDARD', recommendedQty: 1, stockQty: 0, currency: 'EUR' });
  const [inspecForm, setInspecForm] = useState<Partial<CreateInspectionDto>>({ result: 'PASS' });
  const [maintForm, setMaintForm] = useState<Partial<CreateMaintenancePlanDto>>({ frequency: 'ANNUAL' });

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
      connectionsApi.list({ equipmentId: id }).then((r) => setConnections(r.data)),
      sparePartsApi.list({ equipmentId: id }).then((r) => setSpareParts(r.data)),
      inspectionsApi.list({ equipmentId: id }).then((r) => setInspections(r.data)),
      maintenanceApi.list({ equipmentId: id }).then((r) => setMaintPlans(r.data)),
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

  // Satellite handlers
  const handleAddConnection = async () => {
    if (!id || !connForm.lineNumber || !project) return;
    const res = await connectionsApi.create({ ...connForm, projectId: project.id, fromEquipmentId: id } as CreateConnectionDto);
    setConnections(prev => [...prev, res.data]);
    setConnDialog(false);
    setConnForm({ type: 'PROCESS_LINE', isoCertRequired: false });
  };
  const handleAddSparePart = async () => {
    if (!id || !spForm.partNumber || !spForm.description) return;
    const res = await sparePartsApi.create({ ...spForm, equipmentId: id } as CreateSparePartDto);
    setSpareParts(prev => [...prev, res.data]);
    setSpDialog(false);
    setSpForm({ criticality: 'STANDARD', recommendedQty: 1, stockQty: 0, currency: 'EUR' });
  };
  const handleAddInspection = async () => {
    if (!id || !inspecForm.type || !inspecForm.inspectionDate) return;
    const res = await inspectionsApi.create({ ...inspecForm, equipmentId: id } as CreateInspectionDto);
    setInspections(prev => [res.data, ...prev]);
    setInspecDialog(false);
    setInspecForm({ result: 'PASS' });
  };
  const handleAddMaint = async () => {
    if (!id || !maintForm.title || !maintForm.frequency) return;
    const res = await maintenanceApi.create({ ...maintForm, equipmentId: id } as CreateMaintenancePlanDto);
    setMaintPlans(prev => [...prev, res.data]);
    setMaintDialog(false);
    setMaintForm({ frequency: 'ANNUAL' });
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

      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <Typography variant="h4" fontWeight={700}>{eq.tagNumber}</Typography>
        <Chip label={eq.category} size="small" />
        {eq.subType && <Chip label={eq.subType} size="small" variant="outlined" />}
      </Stack>
      <Typography color="text.secondary" mb={2}>{eq.service}</Typography>

      {submitSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSubmitSuccess('')}>{submitSuccess}</Alert>}

      {/* ===== TABS ===== */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Technique" />
          <Tab label={`Connexions (${connections.length})`} icon={<LinkIcon fontSize="small" />} iconPosition="start" />
          <Tab label={`Pièces détachées (${spareParts.length})`} icon={<BuildIcon fontSize="small" />} iconPosition="start" />
          <Tab label={`Inspections (${inspections.length})`} icon={<InspectionIcon fontSize="small" />} iconPosition="start" />
          <Tab label={`Maintenance (${maintenancePlans.length})`} icon={<MaintenanceIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* ===== TAB 0: TECHNIQUE ===== */}
      {tab === 0 && <Grid container spacing={3}>
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
      </Grid>}

      {/* ===== TAB 1: CONNEXIONS ===== */}
      {tab === 1 && (
        <Box>
          <Stack direction="row" justifyContent="flex-end" mb={2}>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setConnDialog(true)}>
              Ajouter une ligne
            </Button>
          </Stack>
          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell><strong>N° de ligne</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Fluide</strong></TableCell>
                  <TableCell><strong>Vers</strong></TableCell>
                  <TableCell><strong>DN</strong></TableCell>
                  <TableCell><strong>Spec matière</strong></TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {connections.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Aucune connexion enregistrée
                  </TableCell></TableRow>
                )}
                {connections.map(c => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.lineNumber}</TableCell>
                    <TableCell><Chip label={CONNECTION_TYPE_LABELS[c.type]} size="small" variant="outlined" /></TableCell>
                    <TableCell>{c.fluid ?? '—'}</TableCell>
                    <TableCell>
                      {c.toEquipment ? <Chip label={c.toEquipment.tagNumber} size="small" /> : (c.toNozzle ?? '—')}
                    </TableCell>
                    <TableCell>{c.nominalDiameter ?? '—'}</TableCell>
                    <TableCell>{c.materialSpec ?? '—'}</TableCell>
                    <TableCell>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" color="error" onClick={() => { connectionsApi.remove(c.id); setConnections(p => p.filter(x => x.id !== c.id)); }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}

      {/* ===== TAB 2: PIÈCES DÉTACHÉES ===== */}
      {tab === 2 && (
        <Box>
          <Stack direction="row" justifyContent="flex-end" mb={2}>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setSpDialog(true)}>
              Ajouter une pièce
            </Button>
          </Stack>
          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell><strong>Réf.</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Fabricant</strong></TableCell>
                  <TableCell><strong>Criticité</strong></TableCell>
                  <TableCell align="right"><strong>Qté rec.</strong></TableCell>
                  <TableCell align="right"><strong>Stock</strong></TableCell>
                  <TableCell align="right"><strong>Prix unit.</strong></TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {spareParts.length === 0 && (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Aucune pièce détachée
                  </TableCell></TableRow>
                )}
                {spareParts.map(p => (
                  <TableRow key={p.id} hover sx={{ bgcolor: p.stockQty < p.recommendedQty ? 'error.50' : undefined }}>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{p.partNumber}</TableCell>
                    <TableCell>{p.description}</TableCell>
                    <TableCell>{p.manufacturer ?? '—'}</TableCell>
                    <TableCell>
                      <Chip label={CRITICALITY_LABELS[p.criticality]} color={CRITICALITY_COLORS[p.criticality]} size="small" />
                    </TableCell>
                    <TableCell align="right">{p.recommendedQty}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600} color={p.stockQty < p.recommendedQty ? 'error' : 'success.main'}>{p.stockQty}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {p.unitCost != null ? p.unitCost.toLocaleString('fr-FR', { style: 'currency', currency: p.currency }) : '—'}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" color="error" onClick={() => { sparePartsApi.remove(p.id); setSpareParts(prev => prev.filter(x => x.id !== p.id)); }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}

      {/* ===== TAB 3: INSPECTIONS ===== */}
      {tab === 3 && (
        <Box>
          <Stack direction="row" justifyContent="flex-end" mb={2}>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setInspecDialog(true)}>
              Ajouter un contrôle
            </Button>
          </Stack>
          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Résultat</strong></TableCell>
                  <TableCell><strong>Inspecteur</strong></TableCell>
                  <TableCell><strong>Certificat</strong></TableCell>
                  <TableCell><strong>Prochaine date</strong></TableCell>
                  <TableCell><strong>Remarques</strong></TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {inspections.length === 0 && (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Aucun contrôle enregistré
                  </TableCell></TableRow>
                )}
                {inspections.map(ins => (
                  <TableRow key={ins.id} hover>
                    <TableCell>{new Date(ins.inspectionDate).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell><Chip label={INSPECTION_TYPE_LABELS[ins.type]} size="small" variant="outlined" /></TableCell>
                    <TableCell>
                      <Chip label={ins.result.replace('_', ' ')} color={INSPECTION_RESULT_COLORS[ins.result]} size="small" />
                    </TableCell>
                    <TableCell>{ins.inspector ?? ins.user?.name ?? '—'}</TableCell>
                    <TableCell>{ins.certificate ?? '—'}</TableCell>
                    <TableCell>
                      {ins.nextInspectionDate ? new Date(ins.nextInspectionDate).toLocaleDateString('fr-FR') : '—'}
                    </TableCell>
                    <TableCell>{ins.remarks ?? '—'}</TableCell>
                    <TableCell>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" color="error" onClick={() => { inspectionsApi.remove(ins.id); setInspections(p => p.filter(x => x.id !== ins.id)); }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}

      {/* ===== TAB 4: MAINTENANCE ===== */}
      {tab === 4 && (
        <Box>
          <Stack direction="row" justifyContent="flex-end" mb={2}>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setMaintDialog(true)}>
              Ajouter une gamme
            </Button>
          </Stack>
          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell><strong>Titre</strong></TableCell>
                  <TableCell><strong>Fréquence</strong></TableCell>
                  <TableCell align="right"><strong>Durée (h)</strong></TableCell>
                  <TableCell><strong>Dernière fois</strong></TableCell>
                  <TableCell><strong>Prochaine échéance</strong></TableCell>
                  <TableCell><strong>Compétences</strong></TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {maintenancePlans.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Aucune gamme de maintenance
                  </TableCell></TableRow>
                )}
                {maintenancePlans.map(mp => (
                  <TableRow key={mp.id} hover>
                    <TableCell fontWeight={600}>{mp.title}</TableCell>
                    <TableCell><Chip label={MAINTENANCE_FREQ_LABELS[mp.frequency]} size="small" /></TableCell>
                    <TableCell align="right">{mp.estimatedDurationH ?? '—'}</TableCell>
                    <TableCell>{mp.lastPerformedAt ? new Date(mp.lastPerformedAt).toLocaleDateString('fr-FR') : '—'}</TableCell>
                    <TableCell>
                      {mp.nextDueAt
                        ? <Chip label={new Date(mp.nextDueAt).toLocaleDateString('fr-FR')}
                            color={new Date(mp.nextDueAt) < new Date() ? 'error' : 'default'} size="small" />
                        : '—'}
                    </TableCell>
                    <TableCell>{mp.requiredSkills ?? '—'}</TableCell>
                    <TableCell>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" color="error" onClick={() => { maintenanceApi.remove(mp.id); setMaintPlans(p => p.filter(x => x.id !== mp.id)); }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}

      {/* ===== DIALOGS SATELLITES ===== */}

      {/* Connection dialog */}
      <Dialog open={connDialog} onClose={() => setConnDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter une connexion</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="N° de ligne *" size="small" fullWidth
              value={connForm.lineNumber ?? ''} onChange={e => setConnForm(f => ({ ...f, lineNumber: e.target.value }))} />
            <TextField select label="Type *" size="small" fullWidth
              value={connForm.type ?? 'PROCESS_LINE'} onChange={e => setConnForm(f => ({ ...f, type: e.target.value as ConnectionType }))}>
              {Object.entries(CONNECTION_TYPE_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
            </TextField>
            <TextField label="Fluide" size="small" fullWidth value={connForm.fluid ?? ''}
              onChange={e => setConnForm(f => ({ ...f, fluid: e.target.value }))} />
            <Stack direction="row" spacing={2}>
              <TextField label="DN" size="small" fullWidth value={connForm.nominalDiameter ?? ''}
                onChange={e => setConnForm(f => ({ ...f, nominalDiameter: e.target.value }))} />
              <TextField label="Classe pression" size="small" fullWidth value={connForm.pressureClass ?? ''}
                onChange={e => setConnForm(f => ({ ...f, pressureClass: e.target.value }))} />
            </Stack>
            <TextField label="Spec matière" size="small" fullWidth value={connForm.materialSpec ?? ''}
              onChange={e => setConnForm(f => ({ ...f, materialSpec: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleAddConnection} disabled={!connForm.lineNumber}>Ajouter</Button>
        </DialogActions>
      </Dialog>

      {/* Spare Part dialog */}
      <Dialog open={spDialog} onClose={() => setSpDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter une pièce détachée</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Référence *" size="small" fullWidth value={spForm.partNumber ?? ''}
              onChange={e => setSpForm(f => ({ ...f, partNumber: e.target.value }))} />
            <TextField label="Description *" size="small" fullWidth value={spForm.description ?? ''}
              onChange={e => setSpForm(f => ({ ...f, description: e.target.value }))} />
            <Stack direction="row" spacing={2}>
              <TextField label="Fabricant" size="small" fullWidth value={spForm.manufacturer ?? ''}
                onChange={e => setSpForm(f => ({ ...f, manufacturer: e.target.value }))} />
              <TextField select label="Criticité" size="small" fullWidth value={spForm.criticality ?? 'STANDARD'}
                onChange={e => setSpForm(f => ({ ...f, criticality: e.target.value as SparePartCriticality }))}>
                {Object.entries(CRITICALITY_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
              </TextField>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Qté rec." size="small" type="number" fullWidth value={spForm.recommendedQty ?? 1}
                onChange={e => setSpForm(f => ({ ...f, recommendedQty: parseInt(e.target.value) }))} />
              <TextField label="Stock actuel" size="small" type="number" fullWidth value={spForm.stockQty ?? 0}
                onChange={e => setSpForm(f => ({ ...f, stockQty: parseInt(e.target.value) }))} />
              <TextField label="Prix unit. (€)" size="small" type="number" fullWidth value={spForm.unitCost ?? ''}
                onChange={e => setSpForm(f => ({ ...f, unitCost: parseFloat(e.target.value) }))} />
            </Stack>
            <TextField label="Délai (jours)" size="small" type="number" fullWidth value={spForm.leadTimeDays ?? ''}
              onChange={e => setSpForm(f => ({ ...f, leadTimeDays: parseInt(e.target.value) }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSpDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleAddSparePart} disabled={!spForm.partNumber || !spForm.description}>Ajouter</Button>
        </DialogActions>
      </Dialog>

      {/* Inspection dialog */}
      <Dialog open={inspecDialog} onClose={() => setInspecDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Enregistrer un contrôle</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Stack direction="row" spacing={2}>
              <TextField select label="Type *" size="small" fullWidth value={inspecForm.type ?? ''}
                onChange={e => setInspecForm(f => ({ ...f, type: e.target.value as InspectionType }))}>
                {Object.entries(INSPECTION_TYPE_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
              </TextField>
              <TextField select label="Résultat *" size="small" fullWidth value={inspecForm.result ?? 'PASS'}
                onChange={e => setInspecForm(f => ({ ...f, result: e.target.value as InspectionResult }))}>
                <MenuItem value="PASS">PASS</MenuItem>
                <MenuItem value="PASS_WITH_REMARKS">Passé avec remarques</MenuItem>
                <MenuItem value="FAIL">FAIL</MenuItem>
                <MenuItem value="PENDING_REVIEW">En attente</MenuItem>
              </TextField>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Date d'inspection *" type="date" size="small" fullWidth
                value={inspecForm.inspectionDate ?? ''} onChange={e => setInspecForm(f => ({ ...f, inspectionDate: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label="Prochaine inspection" type="date" size="small" fullWidth
                value={inspecForm.nextInspectionDate ?? ''} onChange={e => setInspecForm(f => ({ ...f, nextInspectionDate: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Stack>
            <TextField label="Inspecteur / Organisme" size="small" fullWidth value={inspecForm.inspector ?? ''}
              onChange={e => setInspecForm(f => ({ ...f, inspector: e.target.value }))} />
            <TextField label="N° certificat" size="small" fullWidth value={inspecForm.certificate ?? ''}
              onChange={e => setInspecForm(f => ({ ...f, certificate: e.target.value }))} />
            <TextField label="Remarques" size="small" fullWidth multiline rows={2} value={inspecForm.remarks ?? ''}
              onChange={e => setInspecForm(f => ({ ...f, remarks: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInspecDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleAddInspection} disabled={!inspecForm.type || !inspecForm.inspectionDate}>Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* Maintenance dialog */}
      <Dialog open={maintDialog} onClose={() => setMaintDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter une gamme de maintenance</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Titre *" size="small" fullWidth value={maintForm.title ?? ''}
              onChange={e => setMaintForm(f => ({ ...f, title: e.target.value }))} />
            <TextField select label="Fréquence *" size="small" fullWidth value={maintForm.frequency ?? 'ANNUAL'}
              onChange={e => setMaintForm(f => ({ ...f, frequency: e.target.value as MaintenanceFrequency }))}>
              {Object.entries(MAINTENANCE_FREQ_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
            </TextField>
            <TextField label="Description" size="small" fullWidth multiline rows={2} value={maintForm.description ?? ''}
              onChange={e => setMaintForm(f => ({ ...f, description: e.target.value }))} />
            <Stack direction="row" spacing={2}>
              <TextField label="Durée estimée (h)" size="small" type="number" fullWidth value={maintForm.estimatedDurationH ?? ''}
                onChange={e => setMaintForm(f => ({ ...f, estimatedDurationH: parseFloat(e.target.value) }))} />
              <TextField label="Prochaine échéance" type="date" size="small" fullWidth value={maintForm.nextDueAt ?? ''}
                onChange={e => setMaintForm(f => ({ ...f, nextDueAt: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Stack>
            <TextField label="Compétences requises" size="small" fullWidth value={maintForm.requiredSkills ?? ''}
              onChange={e => setMaintForm(f => ({ ...f, requiredSkills: e.target.value }))} />
            <TextField label="Notes de sécurité" size="small" fullWidth value={maintForm.safetyNotes ?? ''}
              onChange={e => setMaintForm(f => ({ ...f, safetyNotes: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaintDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleAddMaint} disabled={!maintForm.title}>Ajouter</Button>
        </DialogActions>
      </Dialog>

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
