import { useRef, useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { documentApi, Document } from '../api/documents';

interface Props {
  projectId: string;
  equipmentId?: string;
  vendorId?: string;
  discussionId?: string;
  commentId?: string;
  registerEntryId?: string;
  category?: string;
  folder?: string;
  onUploaded: (doc: Document) => void;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function FileUploadButton({
  projectId, equipmentId, vendorId, discussionId, commentId, registerEntryId, category, folder,
  onUploaded, label = 'Upload file', size = 'small',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await documentApi.upload(file, {
        projectId, equipmentId, vendorId, discussionId, commentId, registerEntryId, category, folder,
      });
      onUploaded(res.data);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" hidden onChange={handleFile} />
      <Button
        variant="outlined"
        size={size}
        startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : label}
      </Button>
    </>
  );
}
