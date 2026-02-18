import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Card, CardContent, Box, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, Stack,
  Button, Alert, Tabs, Tab,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  HelpOutline as UnknownIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useProject } from '../auth/ProjectContext';
import { dataOriginsApi, StalenessReport } from '../api/data-origins';
import ExportExcelButton from '../components/ExportExcelButton';

const FIELD_LABELS: Record<string, string> = {
  operatingPressure: 'Operating Pressure',
  operatingTemperature: 'Operating Temperature',
  designPressure: 'Design Pressure',
  designTemperature: 'Design Temperature',
  estimatedWeight: 'Estimated Weight',
  material: 'Material',
  size: 'Size',
  notes: 'Notes',
  service: 'Service Description',
};

export default function AgoReportPage() {
  const { project } = useProject();
  const navigate = useNavigate();
  const [report, setReport] = useState<StalenessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

  const loadReport = () => {
    if (!project) return;
    setLoading(true);
    setError('');
    dataOriginsApi.stalenessCheck(project.id)
      .then((r) => setReport(r.data))
      .catch(() => setError('Failed to load AGO report'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReport(); }, [project]);

  if (!project) return <Typography>Select a project first</Typography>;

  const staleCount = report?.staleItems.length ?? 0;
  const unvalidatedCount = report?.unvalidatedFields.length ?? 0;
  const upToDateCount = report?.upToDateCount ?? 0;
  const totalFields = report?.totalFields ?? 0;

  const staleExportData = (report?.staleItems ?? []).map((i) => ({
    tagNumber: i.tagNumber,
    fieldName: FIELD_LABELS[i.fieldName] ?? i.fieldName,
    documentNumber: i.documentNumber,
    currentRevision: i.currentRevision,
    latestRevision: i.latestRevision,
  }));

  const unvalidatedExportData = (report?.unvalidatedFields ?? []).map((i) => ({
    tagNumber: i.tagNumber,
    fieldName: FIELD_LABELS[i.fieldName] ?? i.fieldName,
  }));

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">AGO Report — Approved & Guaranteed Origin</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={loadReport} disabled={loading}>
            Refresh
          </Button>
          {tab === 0 && (
            <ExportExcelButton
              data={staleExportData}
              columns={[
                { key: 'tagNumber', header: 'Equipment' },
                { key: 'fieldName', header: 'Field' },
                { key: 'documentNumber', header: 'Source Document' },
                { key: 'currentRevision', header: 'Validated Rev.' },
                { key: 'latestRevision', header: 'Latest Rev.' },
              ]}
              fileName="AGO_Stale_Items"
            />
          )}
          {tab === 1 && (
            <ExportExcelButton
              data={unvalidatedExportData}
              columns={[
                { key: 'tagNumber', header: 'Equipment' },
                { key: 'fieldName', header: 'Field' },
              ]}
              fileName="AGO_Unvalidated_Fields"
            />
          )}
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box textAlign="center" mt={4}><CircularProgress /></Box>
      ) : report ? (
        <>
          {/* Summary cards */}
          <Stack direction="row" spacing={2} mb={3}>
            <Card sx={{ flex: 1, bgcolor: '#e8f5e9' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <CheckIcon sx={{ color: 'success.main', fontSize: 32 }} />
                <Typography variant="h4">{upToDateCount}</Typography>
                <Typography variant="body2" color="text.secondary">Up to date</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, bgcolor: '#fff3e0' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <WarningIcon sx={{ color: 'warning.main', fontSize: 32 }} />
                <Typography variant="h4">{staleCount}</Typography>
                <Typography variant="body2" color="text.secondary">Stale (new revision available)</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, bgcolor: '#f5f5f5' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <UnknownIcon sx={{ color: 'text.disabled', fontSize: 32 }} />
                <Typography variant="h4">{unvalidatedCount}</Typography>
                <Typography variant="body2" color="text.secondary">Unvalidated</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4">{totalFields}</Typography>
                <Typography variant="body2" color="text.secondary">Total fields tracked</Typography>
              </CardContent>
            </Card>
          </Stack>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label={`Stale Items (${staleCount})`} />
            <Tab label={`Unvalidated (${unvalidatedCount})`} />
          </Tabs>

          {tab === 0 && (
            staleCount === 0 ? (
              <Alert severity="success">All validated fields are up to date with latest document revisions.</Alert>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Equipment</TableCell>
                    <TableCell>Field</TableCell>
                    <TableCell>Source Document</TableCell>
                    <TableCell>Validated Rev.</TableCell>
                    <TableCell>Latest Rev.</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.staleItems.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
                          onClick={() => navigate(`/equipment/${item.equipmentId}`)}
                        >
                          {item.tagNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{FIELD_LABELS[item.fieldName] ?? item.fieldName}</TableCell>
                      <TableCell>{item.documentNumber}</TableCell>
                      <TableCell>{item.currentRevision}</TableCell>
                      <TableCell>
                        <Chip label={item.latestRevision} size="small" color="warning" />
                      </TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => navigate(`/equipment/${item.equipmentId}`)}>
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}

          {tab === 1 && (
            unvalidatedCount === 0 ? (
              <Alert severity="success">All equipment fields have recorded origins.</Alert>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Equipment</TableCell>
                    <TableCell>Field</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.unvalidatedFields.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
                          onClick={() => navigate(`/equipment/${item.equipmentId}`)}
                        >
                          {item.tagNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{FIELD_LABELS[item.fieldName] ?? item.fieldName}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => navigate(`/equipment/${item.equipmentId}`)}>
                          Add Origin
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}
        </>
      ) : null}
    </>
  );
}
