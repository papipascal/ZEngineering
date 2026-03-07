import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Grid, Card, CardContent, CardActionArea, Box, CircularProgress,
  AppBar, Toolbar, Avatar, Chip, Stack, IconButton, Menu, MenuItem, Divider,
} from '@mui/material';
import { Business as ProjectIcon } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { useProject } from '../auth/ProjectContext';
import { projectApi, Project } from '../api/projects';

export default function ProjectSelectionPage() {
  const { user, logout } = useAuth();
  const { selectProject } = useProject();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    projectApi.list()
      .then((r) => setProjects(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (p: Project) => {
    selectProject({ id: p.id, name: p.name, status: p.status, myRole: p.myRole });
    navigate('/version-select');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Zen-gineering — Select Project
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>{user?.name}</Typography>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.name?.charAt(0)}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled><Typography variant="body2">{user?.email}</Typography></MenuItem>
            <Divider />
            <MenuItem onClick={() => { logout(); navigate('/login'); }}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
        <Typography variant="h4" gutterBottom>Your Projects</Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Select a project to start working
        </Typography>

        {loading ? (
          <Box textAlign="center" mt={4}><CircularProgress /></Box>
        ) : projects.length === 0 ? (
          <Typography color="text.secondary">No projects found.</Typography>
        ) : (
          <Grid container spacing={3}>
            {projects.map((p) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p.id}>
                <Card sx={{ height: '100%' }}>
                  <CardActionArea onClick={() => handleSelect(p)} sx={{ height: '100%' }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <ProjectIcon color="primary" />
                        <Typography variant="h6" noWrap>{p.name}</Typography>
                      </Stack>
                      {p.description && (
                        <Typography variant="body2" color="text.secondary" mb={2} sx={{
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        }}>
                          {p.description}
                        </Typography>
                      )}
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip label={p.status} size="small" color={p.status === 'active' ? 'success' : 'default'} />
                        {p.myRole && <Chip label={p.myRole} size="small" color="primary" variant="outlined" />}
                        {p._count && (
                          <>
                            <Chip label={`${p._count.equipment} equip.`} size="small" variant="outlined" />
                            <Chip label={`${p._count.members} members`} size="small" variant="outlined" />
                          </>
                        )}
                      </Stack>
                      {p.clientName && (
                        <Typography variant="caption" color="text.secondary" mt={1} display="block">
                          Client: {p.clientName}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
