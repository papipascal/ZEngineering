import { useEffect, useState } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, TextField, InputAdornment, Box, Stack,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { discussionApi } from '../api/discussions';

interface Vendor {
  id: string;
  name: string;
  country: string | null;
  specialties: Array<{ id: string; equipmentType: string }>;
}

export default function VendorListPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    // Use global search endpoint which returns vendors
    discussionApi.searchAll(search || '*')
      .then((r) => setVendors((r.data as { vendors: Vendor[] }).vendors))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <>
      <Typography variant="h4" gutterBottom>Approved Vendors</Typography>

      <TextField
        size="small"
        placeholder="Search vendors, country, or specialty..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          },
        }}
      />

      {loading ? (
        <Box textAlign="center" mt={4}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Vendor</strong></TableCell>
                <TableCell><strong>Country</strong></TableCell>
                <TableCell><strong>Specialties</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendors.map((v) => (
                <TableRow key={v.id}>
                  <TableCell><Typography fontWeight="bold">{v.name}</Typography></TableCell>
                  <TableCell>{v.country ?? '-'}</TableCell>
                  <TableCell>
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {v.specialties.map((s) => (
                        <Chip key={s.id} label={s.equipmentType} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {vendors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    {search ? 'No vendors match your search' : 'Type to search vendors'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
