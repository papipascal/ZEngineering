import { useEffect, useState } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Box, CircularProgress,
} from '@mui/material';
import { changeRequestApi, ChangeRequest } from '../api/change-requests';

const STATUS_COLOR: Record<string, 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

export default function ChangeRequestListPage() {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    changeRequestApi.list().then((r) => setRequests(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;

  return (
    <>
      <Typography variant="h4" gutterBottom>Change Requests</Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Equipment</strong></TableCell>
              <TableCell><strong>Field</strong></TableCell>
              <TableCell><strong>Old Value</strong></TableCell>
              <TableCell><strong>New Value</strong></TableCell>
              <TableCell><strong>Requester</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((cr) => (
              <TableRow key={cr.id}>
                <TableCell>{cr.equipment.tagNumber}</TableCell>
                <TableCell>{cr.fieldName}</TableCell>
                <TableCell>{cr.oldValue ?? '-'}</TableCell>
                <TableCell><strong>{cr.newValue}</strong></TableCell>
                <TableCell>{cr.requester.name}</TableCell>
                <TableCell>
                  <Chip label={cr.status} size="small" color={STATUS_COLOR[cr.status] ?? 'default'} />
                </TableCell>
                <TableCell>{new Date(cr.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No change requests yet</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
