import { useNavigate } from 'react-router-dom';
import { Box, Typography, AppBar, Toolbar, Avatar, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useProject } from '../auth/ProjectContext';

const V41_URL = import.meta.env.VITE_V41_URL || 'http://localhost:5174';

export default function VersionSelectPage() {
  const { user, token, logout } = useAuth();
  const { project, clearProject } = useProject();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const goV3 = () => {
    navigate('/');
  };

  const goV41 = () => {
    // Passer le contexte auth + projet à V4.1 via URL params
    const params = new URLSearchParams({
      token: token || '',
      user: JSON.stringify(user),
      project: JSON.stringify(project),
    });
    window.location.href = `${V41_URL}?${params.toString()}`;
  };

  const handleChangeProject = () => {
    clearProject();
    navigate('/select-project');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0f1e', color: '#f0f4ff' }}>
      {/* AppBar */}
      <AppBar position="static" sx={{ bgcolor: '#111827', borderBottom: '1px solid #2a3a55' }} elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            ⚙️ Zengineering
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 1 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ color: '#f0f4ff', lineHeight: 1.2 }}>{user?.name}</Typography>
              <Typography variant="caption" sx={{ color: '#8b9dc3' }}>{project?.myRole} — {project?.name}</Typography>
            </Box>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
              <Avatar sx={{ width: 34, height: 34, bgcolor: '#3b82f6', fontSize: 14, fontWeight: 700 }}>
                {user?.name?.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Box>
                <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleChangeProject}>🔄 Changer de projet</MenuItem>
            <MenuItem onClick={() => { logout(); navigate('/login'); }}>🚪 Déconnexion</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Contenu */}
      <Box sx={{ maxWidth: 900, mx: 'auto', px: 3, py: 8, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#f0f4ff' }}>
          Choisissez votre interface
        </Typography>
        <Typography sx={{ color: '#8b9dc3', mb: 2, fontSize: 16 }}>
          Projet : <strong style={{ color: '#3b82f6' }}>{project?.name}</strong>
        </Typography>
        <Typography sx={{ color: '#4a5f82', mb: 6, fontSize: 14 }}>
          Les deux versions partagent vos données et vos droits ({project?.myRole})
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {/* V3 — Classique */}
          <Box
            onClick={goV3}
            onMouseEnter={() => setHoveredCard('v3')}
            onMouseLeave={() => setHoveredCard(null)}
            sx={{
              background: hoveredCard === 'v3' ? '#1f2d45' : '#1a2235',
              border: `2px solid ${hoveredCard === 'v3' ? '#3b82f6' : '#2a3a55'}`,
              borderRadius: '16px',
              padding: '36px 28px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: hoveredCard === 'v3' ? 'translateY(-4px)' : 'none',
              boxShadow: hoveredCard === 'v3' ? '0 12px 40px rgba(59,130,246,0.2)' : 'none',
            }}
          >
            <Box sx={{ fontSize: 56, mb: 2 }}>🏗️</Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#f0f4ff' }}>
              Interface Classique
            </Typography>
            <Typography variant="body2" sx={{ color: '#8b9dc3', mb: 3 }}>
              Version 3 — Complète
            </Typography>
            <Box sx={{ textAlign: 'left', mb: 3 }}>
              {[
                'Gestion documentaire complète',
                'Équipements & Line List',
                'Transmittals & Emails IMAP',
                'Workflows de validation',
                'Achats & Fournisseurs',
                'Discussions temps réel',
                'Rapports AGO & Audit',
              ].map((f) => (
                <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                  <span style={{ color: '#10b981', fontSize: 13 }}>✓</span>
                  <Typography variant="body2" sx={{ color: '#8b9dc3', fontSize: 13 }}>{f}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{
              background: '#0a0f1e', borderRadius: '8px', py: 1.5, px: 2,
              border: '1px solid #2a3a55',
            }}>
              <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                → Ouvrir V3 Classique
              </Typography>
            </Box>
          </Box>

          {/* V4.1 — IA */}
          <Box
            onClick={goV41}
            onMouseEnter={() => setHoveredCard('v41')}
            onMouseLeave={() => setHoveredCard(null)}
            sx={{
              background: hoveredCard === 'v41'
                ? 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(124,58,237,0.15))'
                : 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(124,58,237,0.08))',
              border: `2px solid ${hoveredCard === 'v41' ? '#7c3aed' : '#3b4f72'}`,
              borderRadius: '16px',
              padding: '36px 28px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: hoveredCard === 'v41' ? 'translateY(-4px)' : 'none',
              boxShadow: hoveredCard === 'v41' ? '0 12px 40px rgba(124,58,237,0.25)' : 'none',
              position: 'relative',
            }}
          >
            <Box sx={{
              position: 'absolute', top: 16, right: 16,
              background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
              borderRadius: '20px', px: 1.5, py: 0.4,
              fontSize: 11, fontWeight: 700, color: '#fff',
            }}>
              NOUVEAU
            </Box>
            <Box sx={{ fontSize: 56, mb: 2 }}>🧠</Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#f0f4ff' }}>
              Interface IA
            </Typography>
            <Typography variant="body2" sx={{ color: '#8b9dc3', mb: 3 }}>
              Version 4.1 — Claude AI Orchestrator
            </Typography>
            <Box sx={{ textAlign: 'left', mb: 3 }}>
              {[
                'Assistant IA permanent (Claude claude-sonnet-4-6)',
                'Commande en langage naturel',
                'Ctrl+K : palette de commandes',
                '13 modules de gestion intégrés',
                'Analyse risques, budget, planning',
                'Génération automatique de rapports',
                'Vue 360° sans navigation par menus',
              ].map((f) => (
                <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                  <span style={{ color: '#7c3aed', fontSize: 13 }}>✦</span>
                  <Typography variant="body2" sx={{ color: '#8b9dc3', fontSize: 13 }}>{f}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{
              background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
              borderRadius: '8px', py: 1.5, px: 2,
            }}>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                → Ouvrir V4.1 avec IA
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="caption" sx={{ color: '#4a5f82', mt: 4, display: 'block' }}>
          Vous pouvez revenir à tout moment sur cette page pour changer d'interface
        </Typography>
      </Box>
    </Box>
  );
}
