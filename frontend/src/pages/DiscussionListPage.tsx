import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Card, CardActionArea, CardContent, Stack, TextField,
  InputAdornment, Box, Chip, CircularProgress, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert,
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { discussionApi, Discussion } from '../api/discussions';

export default function DiscussionListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    discussionApi.list(search ? { search } : {}).then((r) => setDiscussions(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleCreate = async () => {
    setError('');
    try {
      await discussionApi.create({
        title,
        content,
        authorId: user!.id,
        projectId: discussions[0]?.projectId || '',
      });
      setDialogOpen(false);
      setTitle('');
      setContent('');
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      setError(msg);
    }
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Discussions</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          New Discussion
        </Button>
      </Stack>

      <TextField
        size="small"
        placeholder="Search discussions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          },
        }}
      />

      {loading ? (
        <Box textAlign="center" mt={4}><CircularProgress /></Box>
      ) : (
        <Stack spacing={1}>
          {discussions.map((d) => (
            <Card key={d.id} variant="outlined">
              <CardActionArea onClick={() => navigate(`/discussions/${d.id}`)}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6">{d.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {d.content.length > 150 ? d.content.slice(0, 150) + '...' : d.content}
                      </Typography>
                      <Stack direction="row" spacing={1} mt={1}>
                        <Chip label={d.author.name} size="small" variant="outlined" />
                        {d.equipment && <Chip label={d.equipment.tagNumber} size="small" color="primary" variant="outlined" />}
                        <Chip label={`${d._count?.comments ?? 0} comments`} size="small" />
                      </Stack>
                    </Box>
                    <Typography variant="caption" color="text.secondary" whiteSpace="nowrap">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </Typography>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
          {discussions.length === 0 && (
            <Typography color="text.secondary" textAlign="center">No discussions found</Typography>
          )}
        </Stack>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Discussion</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2} mt={1}>
            <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
            <TextField label="Content" value={content} onChange={(e) => setContent(e.target.value)} fullWidth multiline rows={4} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!title || !content}>Post</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
