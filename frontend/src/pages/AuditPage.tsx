import { useEffect, useState, useCallback } from 'react';
import {
  Typography, Box, CircularProgress, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Stack, TextField, MenuItem, TablePagination,
} from '@mui/material';
import { useProject } from '../auth/ProjectContext';
import { auditApi } from '../api/audit';

interface AuditEntry {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  userId: string | null;
  userName: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

const ENTITY_TYPES = ['', 'equipment', 'workflow', 'document', 'transmittal', 'email', 'changeRequest', 'discussion'];

const actionColor = (action: string): 'success' | 'info' | 'warning' | 'error' | 'default' => {
  if (action.includes('create') || action.includes('CREATE')) return 'success';
  if (action.includes('update') || action.includes('UPDATE')) return 'info';
  if (action.includes('delete') || action.includes('DELETE')) return 'error';
  if (action.includes('approve') || action.includes('APPROVE')) return 'success';
  if (action.includes('reject') || action.includes('REJECT')) return 'warning';
  return 'default';
};

export default function AuditPage() {
  const { project } = useProject();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const load = useCallback(async () => {
    if (!project) return;
    setLoading(true);
    try {
      const res = await auditApi.getByProject(project.id, {
        entity: entityFilter || undefined,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      });
      setEntries(res.data);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [project, entityFilter, page, rowsPerPage]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <Typography variant="h4" gutterBottom>Audit Trail</Typography>

      <Stack direction="row" spacing={2} mb={3}>
        <TextField
          select
          label="Entity type"
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(0); }}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All entities</MenuItem>
          {ENTITY_TYPES.filter(Boolean).map((t) => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box textAlign="center" py={4}><CircularProgress /></Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Entity</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entries.map((e) => (
                      <TableRow key={e.id} hover>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {new Date(e.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip label={e.entity} size="small" variant="outlined" />
                          <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: 10 }}>
                            {e.entityId.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={e.action} size="small" color={actionColor(e.action)} />
                        </TableCell>
                        <TableCell>{e.userName ?? '—'}</TableCell>
                        <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {e.details ? (
                            <Typography variant="caption" sx={{ fontSize: 11 }}>
                              {JSON.stringify(e.details).substring(0, 100)}
                            </Typography>
                          ) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {entries.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary" py={2}>No audit entries found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={-1}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
                rowsPerPageOptions={[10, 25, 50, 100]}
                labelDisplayedRows={({ from, to }) => `${from}-${to}`}
              />
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
