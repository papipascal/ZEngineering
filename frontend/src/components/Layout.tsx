import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Box, Avatar, Menu, MenuItem, Divider, Button, Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Build as EquipmentIcon,
  Forum as DiscussionIcon,
  Assignment as TaskIcon,
  Store as VendorIcon,
  SwapHoriz as ChangeIcon,
  Folder as DocumentIcon,
  ListAlt as RegisterIcon,
  Send as SendIcon,
  Inbox as InboxIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Gavel as ContractReqIcon,
  CompareArrows as ChangeLogIcon,
  VerifiedUser as AgoIcon,
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { useProject, useIsProjectManager } from '../auth/ProjectContext';

const DRAWER_WIDTH = 240;

const navItems = [
  { label: 'Search', path: '/search', icon: <SearchIcon /> },
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Equipment', path: '/equipment', icon: <EquipmentIcon /> },
  { label: 'Discussions', path: '/discussions', icon: <DiscussionIcon /> },
  { label: 'My Tasks', path: '/tasks', icon: <TaskIcon /> },
  { label: 'Change Requests', path: '/change-requests', icon: <ChangeIcon /> },
  { label: 'Doc Register', path: '/document-register', icon: <RegisterIcon /> },
  { label: 'Contract Req.', path: '/contract-requirements', icon: <ContractReqIcon /> },
  { label: 'Change Log', path: '/contract-change-log', icon: <ChangeLogIcon /> },
  { label: 'AGO Report', path: '/ago-report', icon: <AgoIcon /> },
  { label: 'Transmittals', path: '/transmittals', icon: <SendIcon /> },
  { label: 'Inbox', path: '/incoming-emails', icon: <InboxIcon /> },
  { label: 'Documents', path: '/documents', icon: <DocumentIcon /> },
  { label: 'Vendors', path: '/vendors', icon: <VendorIcon /> },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { project, clearProject } = useProject();
  const isManager = useIsProjectManager();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSwitchProject = () => {
    clearProject();
    navigate('/select-project');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(!drawerOpen)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ mr: 2 }}>
            Zen-gineering
          </Typography>
          {project && (
            <>
              <Chip
                label={project.name}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', mr: 1 }}
              />
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={handleSwitchProject}
                sx={{ mr: 2, textTransform: 'none', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                Switch
              </Button>
            </>
          )}
          <IconButton color="inherit" onClick={() => navigate('/search')} sx={{ mr: 1 }}>
            <SearchIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.name} ({user?.discipline ?? user?.role})
          </Typography>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.name?.charAt(0)}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Typography variant="body2">{user?.email}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { logout(); navigate('/login'); setAnchorEl(null); }}>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <List>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => { navigate(item.path); }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
          {isManager && (
            <>
              <Divider sx={{ my: 1 }} />
              <ListItemButton
                selected={location.pathname === '/project-setup'}
                onClick={() => navigate('/project-setup')}
              >
                <ListItemIcon><SettingsIcon /></ListItemIcon>
                <ListItemText primary="Project Setup" />
              </ListItemButton>
            </>
          )}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: drawerOpen ? `${DRAWER_WIDTH}px` : 0,
          transition: 'margin 0.3s',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
