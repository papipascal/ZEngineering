import { useEffect, useState } from 'react';
import {
  Typography, Box, CircularProgress, Card, CardContent, Tabs, Tab,
  Stack, Chip, Avatar, Button, Snackbar, Alert, Divider,
} from '@mui/material';
import {
  AccountTree as TreeIcon,
  People as OrgIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useProject } from '../auth/ProjectContext';
import { organizationApi, OrgPosition } from '../api/organization';

interface TreeNode {
  id: string;
  name: string;
  level: number;
  order: number;
  children: TreeNode[];
}

function OrgChart({ positions }: { positions: OrgPosition[] }) {
  const buildHierarchy = (parentRole: string | null): OrgPosition[] =>
    positions
      .filter((p) => p.parentRole === parentRole)
      .sort((a, b) => a.order - b.order);

  const renderNode = (pos: OrgPosition, depth: number) => {
    const children = buildHierarchy(pos.role);
    return (
      <Box key={pos.role} sx={{ ml: depth * 3, mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{
          p: 1.5, borderRadius: 1,
          bgcolor: depth === 0 ? 'primary.50' : 'background.paper',
          border: '1px solid', borderColor: pos.userId ? 'primary.200' : 'grey.200',
        }}>
          <Avatar sx={{
            width: 36, height: 36,
            bgcolor: pos.userId ? 'primary.main' : 'grey.300',
            fontSize: 14,
          }}>
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

  const roots = nodes.filter((n) => !nodes.some((p) => p.children?.some((c) => c.id === n.id)));
  // If the data is already hierarchical (children nested), render directly
  if (nodes.length > 0 && nodes[0].children) {
    return <Box>{nodes.sort((a, b) => a.order - b.order).map((n) => renderTree(n, 0))}</Box>;
  }
  return <Box>{roots.sort((a, b) => a.order - b.order).map((n) => renderTree(n, 0))}</Box>;
}

export default function OrganizationPage() {
  const { project } = useProject();
  const [tab, setTab] = useState(0);
  const [positions, setPositions] = useState<OrgPosition[]>([]);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState('');

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
      // If no org exists yet, try to init from defaults
      try {
        await organizationApi.initProject(project.id);
        const [orgRes, treeRes] = await Promise.all([
          organizationApi.getProjectOrg(project.id),
          organizationApi.getProjectTree(project.id),
        ]);
        setPositions(orgRes.data);
        setTree(treeRes.data);
        setSnack('Organization initialized from defaults');
      } catch {
        setSnack('Failed to load organization');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [project]);

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Typography variant="h4">Project Organization</Typography>
        <Button startIcon={<RefreshIcon />} onClick={load} size="small">Refresh</Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<OrgIcon />} iconPosition="start" label={`Org Chart (${positions.length})`} />
        <Tab icon={<TreeIcon />} iconPosition="start" label="Project Tree" />
      </Tabs>

      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Organization Chart</Typography>
            <Divider sx={{ mb: 2 }} />
            {positions.length === 0 ? (
              <Typography color="text.secondary">No organization defined yet.</Typography>
            ) : (
              <OrgChart positions={positions} />
            )}
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Project Tree Structure</Typography>
            <Divider sx={{ mb: 2 }} />
            {tree.length === 0 ? (
              <Typography color="text.secondary">No tree structure defined yet.</Typography>
            ) : (
              <ProjectTreeView nodes={tree} />
            )}
          </CardContent>
        </Card>
      )}

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}>
        <Alert severity="info" onClose={() => setSnack('')}>{snack}</Alert>
      </Snackbar>
    </>
  );
}
