import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Box, Chip, InputAdornment, CircularProgress, Button,
  Stack, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent,
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import { transmittalApi, Transmittal } from '../api/transmittals';
import { useProjectId } from '../auth/ProjectContext';
import ExportExcelButton from '../components/ExportExcelButton';

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

const STATUS_COLORS: Record<string, 'default' | 'info' | 'success'> = {
  DRAFT: 'default',
  SENT: 'info',
  ACKNOWLEDGED: 'success',
};

export default function TransmittalListPage() {
  const navigate = useNavigate();
  const projectId = useProjectId();
  const [transmittals, setTransmittals] = useState<Transmittal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (projectId) params.projectId = projectId;
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (purposeFilter) params.purpose = purposeFilter;
    transmittalApi.list(params).then((r) => setTransmittals(r.data)).finally(() => setLoading(false));
  }, [search, statusFilter, purposeFilter, projectId]);

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Transmittals</Typography>
        <Stack direction="row" spacing={1}>
          <ExportExcelButton
            data={transmittals.map((t) => ({ ...t, purposeLabel: PURPOSE_LABELS[t.purpose] ?? t.purpose, dateStr: t.sentAt ? new Date(t.sentAt).toLocaleDateString() : new Date(t.createdAt).toLocaleDateString(), itemCount: t._count?.items ?? 0 })) as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'transmittalNumber', header: 'Number' },
              { key: 'subject', header: 'Subject' },
              { key: 'purposeLabel', header: 'Purpose' },
              { key: 'recipientName', header: 'Recipient' },
              { key: 'status', header: 'Status' },
              { key: 'itemCount', header: 'Items' },
              { key: 'dateStr', header: 'Date' },
            ]}
            fileName="transmittals"
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/transmittals/new')}>
            New Transmittal
          </Button>
        </Stack>
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
            <MenuItem value="DRAFT">Draft</MenuItem>
            <MenuItem value="SENT">Sent</MenuItem>
            <MenuItem value="ACKNOWLEDGED">Acknowledged</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Purpose</InputLabel>
          <Select value={purposeFilter} label="Purpose" onChange={(e: SelectChangeEvent) => setPurposeFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {Object.entries(PURPOSE_LABELS).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v}</MenuItem>
            ))}
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
                <TableCell><strong>Number</strong></TableCell>
                <TableCell><strong>Subject</strong></TableCell>
                <TableCell><strong>Purpose</strong></TableCell>
                <TableCell><strong>Recipient</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Items</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transmittals.map((t) => (
                <TableRow
                  key={t.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/transmittals/${t.id}`)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{t.transmittalNumber}</Typography>
                  </TableCell>
                  <TableCell>{t.subject}</TableCell>
                  <TableCell>
                    <Chip
                      label={PURPOSE_LABELS[t.purpose] ?? t.purpose}
                      size="small"
                      color={PURPOSE_COLORS[t.purpose] ?? 'default'}
                    />
                  </TableCell>
                  <TableCell>{t.recipientName}</TableCell>
                  <TableCell>
                    <Chip label={t.status} size="small" color={STATUS_COLORS[t.status] ?? 'default'} variant="outlined" />
                  </TableCell>
                  <TableCell align="center">{t._count?.items ?? 0}</TableCell>
                  <TableCell>
                    {t.sentAt
                      ? new Date(t.sentAt).toLocaleDateString()
                      : new Date(t.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {transmittals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">No transmittals found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
