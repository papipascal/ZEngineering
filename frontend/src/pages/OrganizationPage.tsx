import { useEffect, useState, useMemo } from 'react';
import {
  Typography, Box, CircularProgress, Card, CardContent, Tabs, Tab,
  Stack, Chip, Avatar, Button, Snackbar, Alert, Divider,
  Select, MenuItem, FormControl,
} from '@mui/material';
import {
  AccountTree as TreeIcon,
  People as OrgIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useProject, useIsProjectManager } from '../auth/ProjectContext';
import { useAuth } from '../auth/AuthContext';
import { organizationApi, OrgPosition } from '../api/organization';
import { authApi } from '../api/auth';
import type { User } from '../api/auth';

interface TreeNode {
  id: string;
  name: string;
  level: number;
  order: number;
  children: TreeNode[];
}

// ─── Read-only org chart ───────────────────────────────────────────────────

function OrgChart({ positions }: { positions: OrgPosition[] }) {
  const buildHierarchy = (parentRole: string | null): OrgPosition[] =>
    positions.filter((p) => p.parentRole === parentRole).sort((a, b) => a.order - b.order);

  const renderNode = (pos: OrgPosition, depth: number) => {
    const children = buildHierarchy(pos.role);
    return (
      <Box key={pos.role} sx={{ ml: depth * 3, mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{
          p: 1.5, borderRadius: 1,
          bgcolor: depth === 0 ? 'primary.50' : 'background.paper',
          border: '1px solid', borderColor: pos.userId ? 'primary.200' : 'grey.200',
        }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: pos.userId ? 'primary.main' : 'grey.300', fontSize: 14 }}>
            {pos.user?.name?.charAt(0) ?? '?'}
          </Avatar>
          <Box flex={1}>
            <Typography variant="subtitle2">{pos.label}</Typography>
            {pos.user ? (
              <Typography variant="caption" color="text.secondary">{pos.user.name}</Typography>
            ) : (
              <Typography variant="caption" color="warning.main">Non assigné</Typography>
            )}
          </Box>
          <Chip label={pos.role} size="small" variant="outlined" sx={{ fontSize: 10 }} />
        </Stack>
        {children.map((child) => renderNode(child, depth + 1))}
      </Box>
    );
  };

  const roots = buildHierarchy(null);
  return <Box>{roots.map((r) => renderNode(r, 0))}</Box>;
}

// ─── Edit mode org chart ───────────────────────────────────────────────────

function OrgChartEditor({
  positions,
  allUsers,
  onChange,
}: {
  positions: OrgPosition[];
  allUsers: User[];
  onChange: (updated: OrgPosition[]) => void;
}) {
  const handleUserChange = (role: string, userId: string) => {
    onChange(
      positions.map((p) =>
        p.role === role
          ? { ...p, userId: userId || null, user: allUsers.find((u) => u.id === userId) ?? null }
          : p,
      ),
    );
  };

  const buildHierarchy = (parentRole: string | null): OrgPosition[] =>
    positions.filter((p) => p.parentRole === parentRole).sort((a, b) => a.order - b.order);

  const renderNode = (pos: OrgPosition, depth: number) => {
    const children = buildHierarchy(pos.role);
    return (
      <Box key={pos.role} sx={{ ml: depth * 3, mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{
          p: 1.5, borderRadius: 1,
          border: '1px solid', borderColor: 'primary.200',
          bgcolor: 'background.paper',
        }}>
          <Box flex={1}>
            <Typography variant="subtitle2">{pos.label}</Typography>
            <Typography variant="caption" color="text.secondary">{pos.role}</Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <Select
              value={pos.userId ?? ''}
              displayEmpty
              onChange={(e) => handleUserChange(pos.role, e.target.value)}
            >
              <MenuItem value=""><em>Non assigné</em></MenuItem>
              {allUsers.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name}{u.discipline ? ` — ${u.discipline}` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        {children.map((child) => renderNode(child, depth + 1))}
      </Box>
    );
  };

  return <Box>{buildHierarchy(null).map((r) => renderNode(r, 0))}</Box>;
}

// ─── Project tree view ─────────────────────────────────────────────────────

function ProjectTreeView({ nodes }: { nodes: TreeNode[] }) {
  const renderTree = (node: TreeNode, depth: number) => (
    <Box key={node.id} sx={{ ml: depth * 3, mb: 0.5 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{
        p: 1, borderRadius: 1,
        bgcolor: depth === 0 ? 'secondary.50' : depth === 1 ? 'grey.50' : 'transparent',
        borderLeft: depth > 0 ? '2px solid' : 'none',
        borderColor: 'secondary.200',
      }}>
        <TreeIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
        <Typography variant={depth === 0 ? 'subtitle2' : 'body2'}>{node.name}</Typography>
        <Chip label={`L${node.level}`} size="small" sx={{ fontSize: 10, height: 18 }} />
      </Stack>
      {node.children?.sort((a, b) => a.order - b.order).map((child) => renderTree(child, depth + 1))}
    </Box>
  );

  if (nodes.length > 0 && nodes[0].children) {
    return <Box>{nodes.sort((a, b) => a.order - b.order).map((n) => renderTree(n, 0))}</Box>;
  }
  const roots = nodes.filter((n) => !nodes.some((p) => p.children?.some((c) => c.id === n.id)));
  return <Box>{roots.sort((a, b) => a.order - b.order).map((n) => renderTree(n, 0))}</Box>;
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function OrganizationPage() {
  const { project } = useProject();
  const { user } = useAuth();
  const isProjectManager = useIsProjectManager();

  const [tab, setTab] = useState(0);
  const [positions, setPositions] = useState<OrgPosition[]>([]);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState('');
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'info' | 'error'>('info');

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editPositions, setEditPositions] = useState<OrgPosition[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);

  // Determine if current user can edit the org chart
  const canEdit = useMemo(() => {
    const chefPosition = positions.find((p) => p.role === 'chef_de_projet');
    if (!chefPosition) return isProjectManager; // org not initialized yet
    if (chefPosition.userId) {
      return chefPosition.userId === user?.id || user?.role === 'admin';
    }
    // No chef assigned: fall back to project manager
    return isProjectManager || user?.role === 'admin';
  }, [positions, user, isProjectManager]);

  const load = async () => {
    if (!project) return;
    setLoading(true);
    try {
      const [orgRes, treeRes] = await Promise.all([
        organizationApi.getProjectOrg(project.id),
        organizationApi.getProjectTree(project.id),
      ]);
      setPositions(orgRes.data);
      setTree(treeRes.data);
    } catch {
      // If no org exists and user is manager, try to init from defaults
      if (isProjectManager || user?.role === 'admin') {
        try {
          await organizationApi.initProject(project.id);
          const [orgRes, treeRes] = await Promise.all([
            organizationApi.getProjectOrg(project.id),
            organizationApi.getProjectTree(project.id),
          ]);
          setPositions(orgRes.data);
          setTree(treeRes.data);
          setSnackSeverity('info');
          setSnack('Organisation initialisée depuis les modèles par défaut');
        } catch {
          setSnackSeverity('error');
          setSnack('Impossible de charger l\'organisation');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [project]);

  const enterEditMode = async () => {
    if (!allUsers.length) {
      const res = await authApi.listUsers();
      setAllUsers(res.data);
    }
    setEditPositions([...positions]);
    setEditMode(true);
  };

  const handleSave = async () => {
    if (!project) return;
    setSaving(true);
    try {
      await organizationApi.updateProjectOrg(project.id, editPositions);
      setPositions(editPositions);
      setEditMode(false);
      setSnackSeverity('success');
      setSnack('Organisation sauvegardée avec succès');
    } catch {
      setSnackSeverity('error');
      setSnack('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={2} mb={2} flexWrap="wrap">
        <Typography variant="h4">Organisation du projet</Typography>
        {!editMode && (
          <Button startIcon={<RefreshIcon />} onClick={load} size="small">Actualiser</Button>
        )}
        {canEdit && !editMode && (
          <Button variant="contained" startIcon={<EditIcon />} onClick={enterEditMode} size="small">
            Modifier
          </Button>
        )}
        {editMode && (
          <>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} /> : undefined}
              size="small"
            >
              Enregistrer
            </Button>
            <Button variant="outlined" onClick={() => setEditMode(false)} disabled={saving} size="small">
              Annuler
            </Button>
          </>
        )}
        {!canEdit && positions.length > 0 && (
          <Chip label="Lecture seule" size="small" color="warning" />
        )}
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<OrgIcon />} iconPosition="start" label={`Organigramme (${positions.length})`} />
        <Tab icon={<TreeIcon />} iconPosition="start" label="Arborescence" />
      </Tabs>

      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Organigramme</Typography>
            <Divider sx={{ mb: 2 }} />
            {positions.length === 0 ? (
              <Typography color="text.secondary">Aucune organisation définie pour ce projet.</Typography>
            ) : editMode ? (
              <OrgChartEditor
                positions={editPositions}
                allUsers={allUsers}
                onChange={setEditPositions}
              />
            ) : (
              <OrgChart positions={positions} />
            )}
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Arborescence du projet</Typography>
            <Divider sx={{ mb: 2 }} />
            {tree.length === 0 ? (
              <Typography color="text.secondary">Aucune arborescence définie pour ce projet.</Typography>
            ) : (
              <ProjectTreeView nodes={tree} />
            )}
          </CardContent>
        </Card>
      )}

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}>
        <Alert severity={snackSeverity} onClose={() => setSnack('')}>{snack}</Alert>
      </Snackbar>
    </>
  );
}
