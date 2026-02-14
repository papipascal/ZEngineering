import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Grid, Card, CardContent, CardActionArea, Chip, Stack, Box,
  CircularProgress,
} from '@mui/material';
import {
  Build as EquipmentIcon,
  Forum as DiscussionIcon,
  Assignment as TaskIcon,
  SwapHoriz as ChangeIcon,
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { equipmentApi, Equipment } from '../api/equipment';
import { discussionApi, Discussion } from '../api/discussions';
import { workflowApi, WorkflowStep } from '../api/workflows';
import { changeRequestApi, ChangeRequest } from '../api/change-requests';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [tasks, setTasks] = useState<WorkflowStep[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      equipmentApi.list().then((r) => setEquipment(r.data)),
      discussionApi.list().then((r) => setDiscussions(r.data)),
      user ? workflowApi.getActiveTasks().then((r) => setTasks(r.data)) : Promise.resolve(),
      changeRequestApi.list().then((r) => setChangeRequests(r.data)),
    ]).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;

  const myTasks = tasks.filter((t) => t.assigneeId === user?.id);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        {user?.discipline && <Chip label={user.discipline} size="small" sx={{ mr: 1 }} />}
        <Chip label={user?.role} size="small" variant="outlined" />
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardActionArea onClick={() => navigate('/equipment')}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <EquipmentIcon color="primary" />
                  <Typography variant="h6">Equipment</Typography>
                </Stack>
                <Typography variant="h3" textAlign="center" my={1}>{equipment.length}</Typography>
                <Typography variant="body2" color="text.secondary">items in database</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardActionArea onClick={() => navigate('/discussions')}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DiscussionIcon color="primary" />
                  <Typography variant="h6">Discussions</Typography>
                </Stack>
                <Typography variant="h3" textAlign="center" my={1}>{discussions.length}</Typography>
                <Typography variant="body2" color="text.secondary">active discussions</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardActionArea onClick={() => navigate('/tasks')}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TaskIcon color="secondary" />
                  <Typography variant="h6">My Tasks</Typography>
                </Stack>
                <Typography variant="h3" textAlign="center" my={1}>{myTasks.length}</Typography>
                <Typography variant="body2" color="text.secondary">pending approval</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardActionArea onClick={() => navigate('/change-requests')}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ChangeIcon color="secondary" />
                  <Typography variant="h6">Changes</Typography>
                </Stack>
                <Typography variant="h3" textAlign="center" my={1}>
                  {changeRequests.filter((c) => c.status === 'PENDING').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">pending requests</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      {/* Recent discussions */}
      <Typography variant="h5" mt={4} mb={2}>Recent Discussions</Typography>
      <Stack spacing={1}>
        {discussions.slice(0, 5).map((d) => (
          <Card key={d.id} variant="outlined">
            <CardActionArea onClick={() => navigate(`/discussions/${d.id}`)}>
              <CardContent sx={{ py: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1">{d.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      by {d.author.name} - {d._count?.comments ?? 0} comments
                      {d.equipment && ` - ${d.equipment.tagNumber}`}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </>
  );
}
