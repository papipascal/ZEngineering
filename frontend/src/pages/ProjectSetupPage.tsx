import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Card, CardContent, Box, CircularProgress, Chip, Stack, TextField,
  Button, Alert, Divider, Avatar, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
  Email as EmailIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Business as PartnerIcon,
  Store as VendorIcon,
} from '@mui/icons-material';
import { useProject, useIsProjectManager } from '../auth/ProjectContext';
import { projectApi, ProjectDetail } from '../api/projects';
import { authApi, User } from '../api/auth';
import { incomingEmailApi } from '../api/incoming-emails';

export default function ProjectSetupPage() {
  const { project: selectedProject } = useProject();
  const isManager = useIsProjectManager();
  const navigate = useNavigate();

  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [imapStatus, setImapStatus] = useState<{ configured: boolean; host?: string } | null>(null);

  // Email settings
  const [emailField, setEmailField] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [docNumberPattern, setDocNumberPattern] = useState('');

  // Project info editing
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoSaved, setInfoSaved] = useState(false);

  // Dialogs
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [addPartnerOpen, setAddPartnerOpen] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerRole, setPartnerRole] = useState('');
  const [partnerContactName, setPartnerContactName] = useState('');
  const [partnerContactEmail, setPartnerContactEmail] = useState('');
  const [addVendorOpen, setAddVendorOpen] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [vendorNotes, setVendorNotes] = useState('');

  useEffect(() => {
    if (!selectedProject) { navigate('/select-project'); return; }
    if (!isManager) { navigate('/'); return; }
    Promise.all([
      projectApi.getById(selectedProject.id).then((r) => {
        setProjectDetail(r.data);
        setEmailField(r.data.projectEmail || '');
        setDocNumberPattern((r.data as any).docNumberPattern || '');
        setProjectName(r.data.name);
        setProjectDesc(r.data.description || '');
        setClientName(r.data.clientName || '');
        setClientContact(r.data.clientContact || '');
      }),
      authApi.listUsers().then((r) => setAllUsers(r.data)),
      incomingEmailApi.getStatus().then((r) => setImapStatus(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [selectedProject, isManager, navigate]);

  const reload = () => {
    if (!selectedProject) return;
    projectApi.getById(selectedProject.id).then((r) => setProjectDetail(r.data));
  };

  const handleSaveEmail = async () => {
    if (!selectedProject) return;
    setEmailSaving(true);
    setEmailSaved(false);
    try {
      await projectApi.update(selectedProject.id, {
        projectEmail: emailField || null,
        docNumberPattern: docNumberPattern || null,
      } as any);
      setEmailSaved(true);
      setTimeout(() => setEmailSaved(false), 3000);
    } finally {
      setEmailSaving(false);
    }
  };

  const handleSaveInfo = async () => {
    if (!selectedProject) return;
    setInfoSaving(true);
    setInfoSaved(false);
    try {
      await projectApi.update(selectedProject.id, {
        name: projectName,
        description: projectDesc || null,
        clientName: clientName || null,
        clientContact: clientContact || null,
      } as any);
      setInfoSaved(true);
      setTimeout(() => setInfoSaved(false), 3000);
    } finally {
      setInfoSaving(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedProject || !selectedUserId) return;
    await projectApi.addMember(selectedProject.id, { userId: selectedUserId, role: selectedRole });
    setAddMemberOpen(false);
    setSelectedUserId('');
    setSelectedRole('member');
    reload();
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedProject) return;
    await projectApi.removeMember(selectedProject.id, userId);
    reload();
  };

  const handleAddPartner = async () => {
    if (!selectedProject || !partnerName) return;
    await projectApi.addPartner(selectedProject.id, {
      name: partnerName,
      role: partnerRole || undefined,
      contactName: partnerContactName || undefined,
      contactEmail: partnerContactEmail || undefined,
    });
    setAddPartnerOpen(false);
    setPartnerName('');
    setPartnerRole('');
    setPartnerContactName('');
    setPartnerContactEmail('');
    reload();
  };

  const handleRemovePartner = async (partnerId: string) => {
    if (!selectedProject) return;
    await projectApi.removePartner(selectedProject.id, partnerId);
    reload();
  };

  const handleAssignVendor = async () => {
    if (!selectedProject || !vendorId) return;
    await projectApi.assignVendor(selectedProject.id, { vendorId, notes: vendorNotes || undefined });
    setAddVendorOpen(false);
    setVendorId('');
    setVendorNotes('');
    reload();
  };

  const handleRemoveVendor = async (vId: string) => {
    if (!selectedProject) return;
    await projectApi.removeVendor(selectedProject.id, vId);
    reload();
  };

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (!projectDetail) return null;

  const existingMemberIds = projectDetail.members.map((m) => m.user.id);
  const availableUsers = allUsers.filter((u) => !existingMemberIds.includes(u.id));

  return (
    <>
      <Typography variant="h4" gutterBottom>Project Setup</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage project settings, team, partners, and vendors. Only project owners and managers can access this page.
      </Typography>

      {/* Project Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Project Information</Typography>
          <Stack spacing={2}>
            <TextField size="small" label="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} fullWidth />
            <TextField size="small" label="Description" value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} fullWidth multiline rows={2} />
            <Stack direction="row" spacing={2}>
              <TextField size="small" label="Client Name" value={clientName} onChange={(e) => setClientName(e.target.value)} sx={{ flex: 1 }} />
              <TextField size="small" label="Client Contact" value={clientContact} onChange={(e) => setClientContact(e.target.value)} sx={{ flex: 1 }} />
            </Stack>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button variant="contained" size="small" onClick={handleSaveInfo} disabled={infoSaving}>
                {infoSaving ? 'Saving...' : 'Save Project Info'}
              </Button>
              {infoSaved && <Alert severity="success" sx={{ py: 0 }}>Saved</Alert>}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <EmailIcon color="primary" />
            <Typography variant="h6">Email Settings</Typography>
          </Stack>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
              <TextField
                size="small"
                label="Project Email Address"
                value={emailField}
                onChange={(e) => { setEmailField(e.target.value); setEmailSaved(false); }}
                placeholder="e.g. project-ua@company.com"
                sx={{ minWidth: 300 }}
              />
              <Box sx={{ ml: 'auto' }}>
                <Chip
                  label={imapStatus?.configured ? `IMAP: ${imapStatus.host}` : 'IMAP: Not configured'}
                  size="small"
                  color={imapStatus?.configured ? 'success' : 'default'}
                  variant="outlined"
                />
              </Box>
            </Stack>
            <TextField
              size="small"
              label="Document Number Pattern (regex)"
              value={docNumberPattern}
              onChange={(e) => { setDocNumberPattern(e.target.value); setEmailSaved(false); }}
              placeholder={String.raw`e.g. [A-Z]{2}-\d{3}-[A-Z]{2,4}-\d{3}`}
              helperText="Regex used to extract document numbers from attachment filenames and email subjects"
              sx={{ maxWidth: 500 }}
            />
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button
                variant="contained"
                size="small"
                onClick={handleSaveEmail}
                disabled={emailSaving}
              >
                {emailSaving ? 'Saving...' : 'Save Email Settings'}
              </Button>
              {emailSaved && <Alert severity="success" sx={{ py: 0 }}>Saved</Alert>}
            </Stack>
          </Stack>
          {!imapStatus?.configured && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Set IMAP_HOST, IMAP_PORT, IMAP_USER, IMAP_PASSWORD environment variables on the backend to enable inbox polling.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Team Members</Typography>
            <Button size="small" startIcon={<PersonAddIcon />} onClick={() => setAddMemberOpen(true)}>
              Add Member
            </Button>
          </Stack>
          <Stack spacing={1}>
            {projectDetail.members.map((m) => (
              <Stack key={m.id} direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: m.role === 'owner' ? 'primary.main' : 'grey.400' }}>
                  {m.user.name.charAt(0)}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="body2">{m.user.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{m.user.email}</Typography>
                </Box>
                <Chip label={m.role} size="small" variant="outlined" />
                {m.user.discipline && <Chip label={m.user.discipline} size="small" />}
                {m.role !== 'owner' && (
                  <IconButton size="small" color="error" onClick={() => handleRemoveMember(m.user.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Partners */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PartnerIcon color="primary" />
              <Typography variant="h6">Partners & Interfaces</Typography>
            </Stack>
            <Button size="small" onClick={() => setAddPartnerOpen(true)}>Add Partner</Button>
          </Stack>
          {projectDetail.partners.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No partners yet</Typography>
          ) : (
            <Stack spacing={1}>
              {projectDetail.partners.map((p) => (
                <Stack key={p.id} direction="row" alignItems="center" spacing={1}>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight="bold">{p.name}</Typography>
                    {p.role && <Chip label={p.role} size="small" variant="outlined" sx={{ ml: 1 }} />}
                    {p.contactName && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {p.contactName}{p.contactEmail && ` — ${p.contactEmail}`}
                      </Typography>
                    )}
                  </Box>
                  <IconButton size="small" color="error" onClick={() => handleRemovePartner(p.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Vendors */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <VendorIcon color="primary" />
              <Typography variant="h6">Project Vendors</Typography>
            </Stack>
            <Button size="small" onClick={() => setAddVendorOpen(true)}>Assign Vendor</Button>
          </Stack>
          {projectDetail.projectVendors.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No vendors assigned</Typography>
          ) : (
            <Stack spacing={1}>
              {projectDetail.projectVendors.map((pv) => (
                <Stack key={pv.id} direction="row" alignItems="center" spacing={1}>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight="bold">{pv.vendor.name}</Typography>
                    {pv.vendor.country && <Chip label={pv.vendor.country} size="small" sx={{ ml: 1 }} />}
                    {pv.notes && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {pv.notes}
                      </Typography>
                    )}
                  </Box>
                  <IconButton size="small" color="error" onClick={() => handleRemoveVendor(pv.vendor.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onClose={() => setAddMemberOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Team Member</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <FormControl size="small" fullWidth>
              <InputLabel>User</InputLabel>
              <Select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} label="User">
                {availableUsers.map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.name} ({u.email})</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Role</InputLabel>
              <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} label="Role">
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddMember} disabled={!selectedUserId}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Add Partner Dialog */}
      <Dialog open={addPartnerOpen} onClose={() => setAddPartnerOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Partner</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField size="small" label="Company Name" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} fullWidth required />
            <TextField size="small" label="Role (e.g. EPC Contractor)" value={partnerRole} onChange={(e) => setPartnerRole(e.target.value)} fullWidth />
            <TextField size="small" label="Contact Name" value={partnerContactName} onChange={(e) => setPartnerContactName(e.target.value)} fullWidth />
            <TextField size="small" label="Contact Email" value={partnerContactEmail} onChange={(e) => setPartnerContactEmail(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPartnerOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddPartner} disabled={!partnerName}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Vendor Dialog */}
      <Dialog open={addVendorOpen} onClose={() => setAddVendorOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Vendor</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField size="small" label="Vendor ID" value={vendorId} onChange={(e) => setVendorId(e.target.value)} fullWidth placeholder="Enter vendor UUID" />
            <TextField size="small" label="Notes" value={vendorNotes} onChange={(e) => setVendorNotes(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddVendorOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignVendor} disabled={!vendorId}>Assign</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
