import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Card, CardContent, Box, Divider, TextField, Button, Stack,
  Chip, Avatar, CircularProgress,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useAuth } from '../auth/AuthContext';
import { discussionApi, Discussion } from '../api/discussions';
import { documentApi, Document as DocType } from '../api/documents';
import DocumentList from '../components/DocumentList';
import FileUploadButton from '../components/FileUploadButton';

export default function DiscussionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [documents, setDocuments] = useState<DocType[]>([]);

  const load = () => {
    if (!id) return;
    Promise.all([
      discussionApi.getById(id).then((r) => setDiscussion(r.data)),
      documentApi.list({ discussionId: id }).then((r) => setDocuments(r.data)),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleAddComment = async () => {
    if (!comment.trim() || !id || !user) return;
    setPosting(true);
    await discussionApi.addComment(id, { content: comment, authorId: user.id });
    setComment('');
    setPosting(false);
    load();
  };

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (!discussion) return <Typography>Discussion not found</Typography>;

  return (
    <>
      <Button variant="text" onClick={() => navigate('/discussions')} sx={{ mb: 1 }}>
        &larr; Back to Discussions
      </Button>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>{discussion.title}</Typography>
          <Stack direction="row" spacing={1} mb={2}>
            <Chip label={discussion.author.name} size="small" avatar={<Avatar>{discussion.author.name[0]}</Avatar>} />
            {discussion.equipment && (
              <Chip
                label={discussion.equipment.tagNumber}
                size="small"
                color="primary"
                variant="outlined"
                onClick={() => navigate(`/equipment/${discussion.equipment!.id}`)}
              />
            )}
            <Chip label={new Date(discussion.createdAt).toLocaleDateString()} size="small" variant="outlined" />
          </Stack>
          <Typography variant="body1" whiteSpace="pre-wrap">{discussion.content}</Typography>
        </CardContent>
      </Card>

      {/* Documents attached to this discussion */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AttachFileIcon fontSize="small" />
              <Typography variant="h6">Attachments</Typography>
            </Stack>
            {discussion.projectId && (
              <FileUploadButton
                projectId={discussion.projectId}
                discussionId={discussion.id}
                onUploaded={(doc) => setDocuments((prev) => [doc, ...prev])}
                label="Attach file"
              />
            )}
          </Stack>
          <DocumentList
            documents={documents}
            onDeleted={(docId) => setDocuments((prev) => prev.filter((d) => d.id !== docId))}
            compact
          />
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Comments ({discussion.comments?.length ?? 0})
      </Typography>

      <Stack spacing={2} mb={3}>
        {discussion.comments?.map((c) => (
          <Card key={c.id} variant="outlined">
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>{c.author.name[0]}</Avatar>
                <Typography variant="subtitle2">{c.author.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(c.createdAt).toLocaleString()}
                </Typography>
              </Stack>
              <Typography variant="body2">{c.content}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Divider sx={{ mb: 2 }} />
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          fullWidth
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
        />
        <Button variant="contained" onClick={handleAddComment} disabled={!comment.trim() || posting}>
          Post
        </Button>
      </Stack>
    </>
  );
}
