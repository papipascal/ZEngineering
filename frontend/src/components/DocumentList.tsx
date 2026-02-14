import { useState } from 'react';
import {
  List, ListItem, ListItemIcon, ListItemText, IconButton, Typography,
  Chip, Stack, Tooltip, Menu, MenuItem, Box,
} from '@mui/material';
import {
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
} from '@mui/icons-material';
import { Document, documentApi } from '../api/documents';
import ShareDocumentDialog from './ShareDocumentDialog';

function fileIcon(mimeType: string) {
  if (mimeType.includes('pdf')) return <PdfIcon color="error" />;
  if (mimeType.startsWith('image/')) return <ImageIcon color="primary" />;
  if (mimeType.includes('word') || mimeType.includes('document')) return <DocIcon color="info" />;
  return <FileIcon />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  documents: Document[];
  onDeleted?: (id: string) => void;
  compact?: boolean;
}

export default function DocumentList({ documents, onDeleted, compact = false }: Props) {
  const [shareDoc, setShareDoc] = useState<Document | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; doc: Document } | null>(null);

  const handleDownload = async (doc: Document) => {
    try {
      const res = await documentApi.download(doc.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!window.confirm(`Delete "${doc.fileName}"?`)) return;
    try {
      await documentApi.remove(doc.id);
      onDeleted?.(doc.id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
    setMenuAnchor(null);
  };

  if (documents.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        No documents yet.
      </Typography>
    );
  }

  return (
    <>
      <List dense={compact} disablePadding>
        {documents.map((doc) => (
          <ListItem
            key={doc.id}
            secondaryAction={
              <Stack direction="row" spacing={0}>
                <Tooltip title="Download">
                  <IconButton size="small" onClick={() => handleDownload(doc)}>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share via email">
                  <IconButton size="small" onClick={() => setShareDoc(doc)}>
                    <ShareIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {onDeleted && (
                  <IconButton size="small" onClick={(e) => setMenuAnchor({ el: e.currentTarget, doc })}>
                    <MoreIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            }
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {fileIcon(doc.mimeType)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{doc.fileName}</Typography>
                  {doc.category && <Chip label={doc.category} size="small" variant="outlined" />}
                </Stack>
              }
              secondary={compact ? undefined : (
                <Box component="span">
                  {formatSize(doc.fileSize)} &middot; {doc.uploadedBy.name} &middot; {new Date(doc.createdAt).toLocaleDateString()}
                  {doc.description && ` — ${doc.description}`}
                </Box>
              )}
            />
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={menuAnchor?.el}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => menuAnchor && handleDelete(menuAnchor.doc)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {shareDoc && (
        <ShareDocumentDialog
          document={shareDoc}
          open={!!shareDoc}
          onClose={() => setShareDoc(null)}
        />
      )}
    </>
  );
}
