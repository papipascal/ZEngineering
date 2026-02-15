import { useEffect, useState } from 'react';
import {
  Typography, Card, CardContent, Stack, Button, Chip, Box,
  TextField, CircularProgress, Alert,
} from '@mui/material';
import { Check as ApproveIcon, Close as RejectIcon } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { workflowApi, WorkflowStep } from '../api/workflows';
import ExportExcelButton from '../components/ExportExcelButton';

export default function MyTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    workflowApi.getActiveTasks().then((r) => setTasks(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (step: WorkflowStep, action: 'approve' | 'reject') => {
    setActionLoading(step.id);
    setSuccess('');
    try {
      await workflowApi.completeStep(step.instanceId, step.id, {
        action,
        comment: comments[step.id] || undefined,
        assigneeId: user?.id,
      });
      setSuccess(`Step "${step.name}" ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      load();
    } catch {
      // Error handled by interceptor
    } finally {
      setActionLoading(null);
    }
  };

  const myTasks = tasks.filter((t) => t.assigneeId === user?.id || !t.assigneeId);

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h4">My Tasks</Typography>
        <ExportExcelButton
          data={myTasks.map((t) => ({ ...t, workflowName: t.instance?.definition?.name ?? '', projectName: t.instance?.project?.name ?? '', stepOrder: t.order + 1 })) as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'name', header: 'Task' },
            { key: 'workflowName', header: 'Workflow' },
            { key: 'projectName', header: 'Project' },
            { key: 'stepOrder', header: 'Step' },
          ]}
          fileName="my-tasks"
        />
      </Stack>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {myTasks.length === 0 ? (
        <Typography color="text.secondary">No pending tasks assigned to you.</Typography>
      ) : (
        <Stack spacing={2}>
          {myTasks.map((step) => (
            <Card key={step.id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6">{step.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Workflow: {step.instance?.definition?.name ?? 'Unknown'}
                    </Typography>
                    {step.instance?.project && (
                      <Typography variant="body2" color="text.secondary">
                        Project: {step.instance.project.name}
                      </Typography>
                    )}
                    <Chip label={`Step ${step.order + 1}`} size="small" sx={{ mt: 1 }} />
                  </Box>
                  <Chip label="Active" color="warning" size="small" />
                </Stack>

                <Stack direction="row" spacing={1} mt={2} alignItems="center">
                  <TextField
                    size="small"
                    placeholder="Optional comment..."
                    value={comments[step.id] || ''}
                    onChange={(e) => setComments((prev) => ({ ...prev, [step.id]: e.target.value }))}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ApproveIcon />}
                    onClick={() => handleAction(step, 'approve')}
                    disabled={actionLoading === step.id}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={() => handleAction(step, 'reject')}
                    disabled={actionLoading === step.id}
                  >
                    Reject
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {tasks.filter((t) => t.assigneeId && t.assigneeId !== user?.id).length > 0 && (
        <>
          <Typography variant="h5" mt={4} mb={2}>Other Active Tasks</Typography>
          <Stack spacing={1}>
            {tasks.filter((t) => t.assigneeId && t.assigneeId !== user?.id).map((step) => (
              <Card key={step.id} variant="outlined">
                <CardContent sx={{ py: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle1">{step.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Assigned to: {step.assignee?.name ?? 'Unknown'} | {step.instance?.definition?.name}
                      </Typography>
                    </Box>
                    <Chip label="Active" size="small" variant="outlined" />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </>
      )}
    </>
  );
}
