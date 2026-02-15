import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, IconButton, Avatar, Menu, MenuItem, Divider, useMediaQuery, useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon, Home, Person, School, Engineering, ContactMail, Logout,
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Home', icon: <Home />, path: '/' },
  { label: 'CV / Resume', icon: <Person />, path: '/cv' },
  { label: 'National Studies', icon: <School />, path: '/projects' },
  { label: "Z'Engineering", icon: <Engineering />, path: '/zengineering' },
  { label: 'Feedback & Orders', icon: <ContactMail />, path: '/feedback' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="primary" fontWeight="bold">Z'Engineering</Typography>
        <Typography variant="caption" color="text.secondary">Portfolio</Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => handleNav(item.path)}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, borderRight: 'none', bgcolor: 'white' },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Box flexGrow={1} />
            <Typography variant="body2" color="text.secondary" mr={1}>
              {user?.name}
            </Typography>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                {user?.name?.charAt(0) ?? '?'}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled>
                <Typography variant="body2">{user?.email}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); logout(); navigate('/login'); }}>
                <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                Sign Out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, maxWidth: 1200 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
