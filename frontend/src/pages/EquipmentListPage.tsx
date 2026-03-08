import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Tabs, Tab, TextField, Box, Chip, InputAdornment, CircularProgress, Stack,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { equipmentApi, Equipment } from '../api/equipment';
import { useProjectId } from '../auth/ProjectContext';
import ExportExcelButton from '../components/ExportExcelButton';

const CATEGORIES = ['ALL', 'VESSEL', 'HEAT_EXCHANGER', 'ROTATING_MACHINE', 'MISCELLANEOUS'];
const CATEGORY_LABELS: Record<string, string> = {
  ALL: 'All',
  VESSEL: 'Vessels',
  HEAT_EXCHANGER: 'Heat Exchangers',
  ROTATING_MACHINE: 'Rotating Machines',
  MISCELLANEOUS: 'Miscellaneous',
};

export default function EquipmentListPage() {
  const navigate = useNavigate();
  const projectId = useProjectId();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (projectId) params.projectId = projectId;
    if (category !== 'ALL') params.category = category;
    if (search) params.search = search;
    equipmentApi.list(params).then((r) => {
      const payload = r.data as unknown as { data: Equipment[] } | Equipment[];
      setEquipment(Array.isArray(payload) ? payload : (payload as { data: Equipment[] }).data ?? []);
    }).finally(() => setLoading(false));
  }, [category, search, projectId]);

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h4">Equipment</Typography>
        <ExportExcelButton
          data={equipment as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'tagNumber', header: 'Tag Number' },
            { key: 'service', header: 'Service' },
            { key: 'category', header: 'Category' },
            { key: 'subType', header: 'Sub-Type' },
            { key: 'material', header: 'Material' },
            { key: 'operatingPressure', header: 'Op. Pressure (barg)' },
            { key: 'operatingTemperature', header: 'Op. Temp. (°C)' },
          ]}
          fileName="equipment-list"
        />
      </Stack>

      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Tabs value={category} onChange={(_, v) => setCategory(v)} variant="scrollable">
          {CATEGORIES.map((c) => (
            <Tab key={c} value={c} label={CATEGORY_LABELS[c]} />
          ))}
        </Tabs>
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
          sx={{ ml: 'auto', width: 250 }}
        />
      </Box>

      {loading ? (
        <Box textAlign="center" mt={4}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Tag Number</strong></TableCell>
                <TableCell><strong>Service</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Sub-Type</strong></TableCell>
                <TableCell><strong>Material</strong></TableCell>
                <TableCell align="right"><strong>Op. Pressure</strong></TableCell>
                <TableCell align="right"><strong>Op. Temp.</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipment.map((eq) => (
                <TableRow
                  key={eq.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/equipment/${eq.id}`)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{eq.tagNumber}</Typography>
                  </TableCell>
                  <TableCell>{eq.service}</TableCell>
                  <TableCell>
                    <Chip label={CATEGORY_LABELS[eq.category] ?? eq.category} size="small" />
                  </TableCell>
                  <TableCell>{eq.subType ?? '-'}</TableCell>
                  <TableCell>{eq.material ?? '-'}</TableCell>
                  <TableCell align="right">{eq.operatingPressure != null ? `${eq.operatingPressure} barg` : '-'}</TableCell>
                  <TableCell align="right">{eq.operatingTemperature != null ? `${eq.operatingTemperature} °C` : '-'}</TableCell>
                </TableRow>
              ))}
              {equipment.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">No equipment found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
