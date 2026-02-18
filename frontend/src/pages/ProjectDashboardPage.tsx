import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Grid, Card, CardContent, CardActionArea, Box, CircularProgress,
  Chip, Stack, Avatar, Divider, Button,
} from '@mui/material';
import {
  Build as EquipmentIcon,
  Forum as DiscussionIcon,
  Assignment as TaskIcon,
  SwapHoriz as ChangeIcon,
  ListAlt as RegisterIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { useProject, useIsProjectManager } from '../auth/ProjectContext';
import { projectApi, ProjectDetail } from '../api/projects';
import { equipmentApi } from '../api/equipment';
import { discussionApi, Discussion } from '../api/discussions';
import { workflowApi, WorkflowStep } from '../api/workflows';
import { changeRequestApi } from '../api/change-requests';

export default function ProjectDashboardPage() {
  const { user } = useAuth();
  const { project: selectedProject } = useProject();
  const isManager = useIsProjectManager();
  const navigate = useNavigate();
  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null);
  const [equipmentCount, setEquipmentCount] = useState(0);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [tasks, setTasks] = useState<WorkflowStep[]>([]);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedProject) { navigate('/select-project'); return; }
    Promise.all([
      projectApi.getById(selectedProject.id).then((r) => setProjectDetail(r.data)),
      equipmentApi.list({ projectId: selectedProject.id }).then((r) => setEquipmentCount(r.data.length)),
      discussionApi.list({ projectId: selectedProject.id }).then((r) => setDiscussions(r.data)),
      workflowApi.getActiveTasks().then((r) => setTasks(r.data)),
      changeRequestApi.list({ status: 'PENDING' }).then((r) => setPendingChanges(r.data.length)),
    ]).finally(() => setLoading(false));
  }, [selectedProject, navigate]);

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (!projectDetail) return null;

  const myTasks = tasks.filter((t) => t.assigneeId === user?.id);

  return (
    <>
      {/* Project header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <Typography variant="h4">{projectDetail.name}</Typography>
        <Chip label={projectDetail.status} color={projectDetail.status === 'active' ? 'success' : 'default'} />
        {projectDetail.myRole && (
          <Chip label={`My role: ${projectDetail.myRole}`} size="small" color="primary" variant="outlined" />
        )}
        {isManager && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<SettingsIcon />}
            onClick={() => navigate('/project-setup')}
          >
            Project Setup
          </Button>
        )}
      </Stack>
      {projectDetail.description && (
        <Typography variant="body1" color="text.secondary" mb={1}>{projectDetail.description}</Typography>
      )}
      {projectDetail.clientName && (
        <Typography variant="body2" color="text.secondary" mb={3}>
          Client: <strong>{projectDetail.clientName}</strong>
          {projectDetail.clientContact && ` — ${projectDetail.clientContact}`}
        </Typography>
      )}

      {/* Stats cards */}
      <Grid container spacing={3} mb={4}>
        {[
          { label: 'Equipment', count: equipmentCount, icon: <EquipmentIcon color="primary" />, path: '/equipment' },
          { label: 'Discussions', count: discussions.length, icon: <DiscussionIcon color="primary" />, path: '/discussions' },
          { label: 'My Tasks', count: myTasks.length, icon: <TaskIcon color="secondary" />, path: '/tasks' },
          { label: 'Pending Changes', count: pendingChanges, icon: <ChangeIcon color="secondary" />, path: '/change-requests' },
          { label: 'Doc Register', count: projectDetail._count?.documentEntries ?? 0, icon: <RegisterIcon color="primary" />, path: '/document-register' },
        ].map((s) => (
          <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={s.label}>
            <Card>
              <CardActionArea onClick={() => navigate(s.path)}>
                <CardContent sx={{ textAlign: 'center' }}>
                  {s.icon}
                  <Typography variant="h4">{s.count}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Team Members */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Team Members</Typography>
              <Stack spacing={1}>
                {projectDetail.members.map((m) => (
                  <Stack key={m.id} direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: m.role === 'owner' ? 'primary.main' : 'grey.400' }}>
                      {m.user.name.charAt(0)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2">{m.user.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{m.user.email}</Typography>
                    </Box>
                    <Chip label={m.role} size="small" variant="outlined" />
                    {m.user.discipline && <Chip label={m.user.discipline} size="small" />}
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Partners & Vendors */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Partners & Interfaces</Typography>
              {projectDetail.partners.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No partners yet</Typography>
              ) : (
                <Stack spacing={1}>
                  {projectDetail.partners.map((p) => (
                    <Box key={p.id}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" fontWeight="bold">{p.name}</Typography>
                        {p.role && <Chip label={p.role} size="small" variant="outlined" />}
                      </Stack>
                      {p.contactName && (
                        <Typography variant="caption" color="text.secondary">
                          {p.contactName}{p.contactEmail && ` — ${p.contactEmail}`}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Project Vendors</Typography>
              {projectDetail.projectVendors.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No vendors assigned</Typography>
              ) : (
                <Stack spacing={1}>
                  {projectDetail.projectVendors.map((pv) => (
                    <Stack key={pv.id} direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" fontWeight="bold">{pv.vendor.name}</Typography>
                      {pv.vendor.country && <Chip label={pv.vendor.country} size="small" />}
                      {pv.notes && (
                        <Typography variant="caption" color="text.secondary">— {pv.notes}</Typography>
                      )}
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Discussions */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Discussions</Typography>
              <Stack spacing={1}>
                {discussions.slice(0, 5).map((d) => (
                  <Card key={d.id} variant="outlined">
                    <CardActionArea onClick={() => navigate(`/discussions/${d.id}`)}>
                      <CardContent sx={{ py: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle2">{d.title}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              by {d.author.name} — {d._count?.comments ?? 0} comments
                              {d.equipment && ` — ${d.equipment.tagNumber}`}
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
                {discussions.length === 0 && (
                  <Typography variant="body2" color="text.secondary">No discussions yet</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
