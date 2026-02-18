import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Typography, Box, TextField, Stack, MenuItem, Chip, CircularProgress,
  InputAdornment, Collapse, Button, IconButton, Divider, Card, CardContent,
  Accordion, AccordionSummary, AccordionDetails, Avatar, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, Badge,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';
import EmailIcon from '@mui/icons-material/Email';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import ForumIcon from '@mui/icons-material/Forum';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PushPinIcon from '@mui/icons-material/PushPin';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/Clear';
import {
  searchApi, SearchFilters, SearchResults, SavedSearch,
  SearchResultDocument, SearchResultTransmittal, SearchResultEmail,
  SearchResultEquipment, SearchResultDiscussion, SearchResultRegister,
} from '../api/search';
import { useProjectId } from '../auth/ProjectContext';
import ExportExcelButton from '../components/ExportExcelButton';

const ENTITY_TYPES = [
  { value: 'documents', label: 'Documents', icon: <DescriptionIcon fontSize="small" /> },
  { value: 'transmittals', label: 'Transmittals', icon: <SendIcon fontSize="small" /> },
  { value: 'emails', label: 'Emails', icon: <EmailIcon fontSize="small" /> },
  { value: 'equipment', label: 'Equipment', icon: <PrecisionManufacturingIcon fontSize="small" /> },
  { value: 'discussions', label: 'Discussions', icon: <ForumIcon fontSize="small" /> },
  { value: 'register', label: 'Doc Register', icon: <AssignmentIcon fontSize="small" /> },
];

const CATEGORIES = ['DATASHEET', 'SPECIFICATION', 'DRAWING', 'CERTIFICATION', 'QUOTE', 'REPORT', 'MANUAL', 'OTHER'];
const FOLDERS = ['CONTRACT', 'CLIENT_SPECS', 'ENGINEERING', 'EMAILS', 'OTHER'];
const DISCIPLINES = ['PROCESS', 'PIPING', 'ELECTRICAL', 'INSTRUMENTATION', 'CIVIL', 'MECHANICAL'];
const STATUSES = ['DRAFT', 'FOR_REVIEW', 'FOR_APPROVAL', 'APPROVED', 'SENT', 'ACKNOWLEDGED', 'SUPERSEDED'];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function SearchPage() {
  const projectId = useProjectId();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search state
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(ENTITY_TYPES.map(t => t.value));
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [category, setCategory] = useState('');
  const [folder, setFolder] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [status, setStatus] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [equipmentTag, setEquipmentTag] = useState('');

  // Results
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  // Sidebar
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recentSearches, setRecentSearches] = useState<SavedSearch[]>([]);

  // Save dialog
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const hasFilters = dateFrom || dateTo || category || folder || discipline || status || companyName || equipmentTag
    || selectedTypes.length < ENTITY_TYPES.length;

  const buildFilters = useCallback((): SearchFilters => {
    const f: SearchFilters = { projectId: projectId || '' };
    if (query) f.query = query;
    if (selectedTypes.length < ENTITY_TYPES.length) f.entityTypes = selectedTypes;
    if (dateFrom) f.dateFrom = dateFrom;
    if (dateTo) f.dateTo = dateTo;
    if (category) f.category = category;
    if (folder) f.folder = folder;
    if (discipline) f.discipline = discipline;
    if (status) f.status = status;
    if (companyName) f.companyName = companyName;
    if (equipmentTag) f.equipmentTag = equipmentTag;
    return f;
  }, [projectId, query, selectedTypes, dateFrom, dateTo, category, folder, discipline, status, companyName, equipmentTag]);

  const doSearch = useCallback(() => {
    if (!projectId) return;
    const filters = buildFilters();
    if (!filters.query && !hasFilters) { setResults(null); return; }
    setLoading(true);
    searchApi.search(filters)
      .then(r => setResults(r.data))
      .finally(() => setLoading(false));
  }, [projectId, buildFilters, hasFilters]);

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch();
      if (query) setSearchParams({ q: query }, { replace: true });
      else setSearchParams({}, { replace: true });
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch, setSearchParams]);

  // Re-search when filters change
  useEffect(() => { doSearch(); }, [selectedTypes, dateFrom, dateTo, category, folder, discipline, status, companyName, equipmentTag]);

  // Load saved & recent searches
  useEffect(() => {
    if (!projectId) return;
    searchApi.listSaved(projectId).then(r => setSavedSearches(r.data)).catch(() => {});
    searchApi.listRecent(projectId).then(r => setRecentSearches(r.data)).catch(() => {});
  }, [projectId, results]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedTypes(ENTITY_TYPES.map(t => t.value));
    setDateFrom(''); setDateTo(''); setCategory(''); setFolder('');
    setDiscipline(''); setStatus(''); setCompanyName(''); setEquipmentTag('');
  };

  const applySavedSearch = (s: SavedSearch) => {
    setQuery(s.query || '');
    if (s.filters) {
      const f = s.filters as SearchFilters;
      setSelectedTypes(f.entityTypes || ENTITY_TYPES.map(t => t.value));
      setDateFrom(f.dateFrom || ''); setDateTo(f.dateTo || '');
      setCategory(f.category || ''); setFolder(f.folder || '');
      setDiscipline(f.discipline || ''); setStatus(f.status || '');
      setCompanyName(f.companyName || ''); setEquipmentTag(f.equipmentTag || '');
      if (f.dateFrom || f.dateTo || f.category || f.folder || f.discipline || f.status || f.companyName || f.equipmentTag) {
        setShowFilters(true);
      }
    }
  };

  const handleSave = async () => {
    if (!projectId || !saveName) return;
    const filters = buildFilters();
    await searchApi.save({ projectId, name: saveName, query: query || '', filters });
    setSaveOpen(false);
    setSaveName('');
    searchApi.listSaved(projectId).then(r => setSavedSearches(r.data));
  };

  const handleDeleteSearch = async (id: string) => {
    await searchApi.deleteSearch(id);
    setSavedSearches(prev => prev.filter(s => s.id !== id));
  };

  const handleTogglePin = async (id: string) => {
    const res = await searchApi.togglePin(id);
    setSavedSearches(prev => prev.map(s => s.id === id ? res.data : s));
  };

  // Flatten results for Excel export
  const flatResults = results ? [
    ...results.documents.map(d => ({ type: 'Document', name: d.fileName, detail: d.category, date: d.createdAt })),
    ...results.transmittals.map(t => ({ type: 'Transmittal', name: t.transmittalNumber, detail: t.subject, date: t.createdAt })),
    ...results.emails.map(e => ({ type: 'Email', name: e.subject, detail: e.fromAddress, date: e.receivedAt })),
    ...results.equipment.map(eq => ({ type: 'Equipment', name: eq.tagNumber, detail: eq.service, date: '' })),
    ...results.discussions.map(d => ({ type: 'Discussion', name: d.title, detail: d.author.name, date: d.createdAt })),
    ...results.register.map(r => ({ type: 'Register', name: r.documentNumber, detail: r.title, date: r.createdAt })),
  ] : [];

  return (
    <Stack direction="row" spacing={2} sx={{ height: '100%' }}>
      {/* Sidebar */}
      <Box sx={{ width: 280, flexShrink: 0 }}>
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ pb: '12px !important' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <BookmarkIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2">Saved Searches</Typography>
              </Stack>
              <Tooltip title="Save current search">
                <IconButton size="small" onClick={() => setSaveOpen(true)} disabled={!query && !hasFilters}>
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            {savedSearches.filter(s => s.pinned).length > 0 && (
              <>
                <Typography variant="caption" color="text.secondary">Pinned</Typography>
                {savedSearches.filter(s => s.pinned).map(s => (
                  <Stack key={s.id} direction="row" alignItems="center" spacing={0.5} sx={{ py: 0.5 }}>
                    <PushPinIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                    <Typography
                      variant="body2"
                      sx={{ flex: 1, cursor: 'pointer', '&:hover': { color: 'primary.main' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      onClick={() => applySavedSearch(s)}
                    >
                      {s.name}
                    </Typography>
                    <IconButton size="small" onClick={() => handleTogglePin(s.id)}><PushPinIcon sx={{ fontSize: 14 }} /></IconButton>
                    <IconButton size="small" onClick={() => handleDeleteSearch(s.id)}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                  </Stack>
                ))}
                <Divider sx={{ my: 0.5 }} />
              </>
            )}
            {savedSearches.filter(s => !s.pinned).length > 0 ? (
              savedSearches.filter(s => !s.pinned).map(s => (
                <Stack key={s.id} direction="row" alignItems="center" spacing={0.5} sx={{ py: 0.5 }}>
                  <BookmarkBorderIcon sx={{ fontSize: 14 }} />
                  <Typography
                    variant="body2"
                    sx={{ flex: 1, cursor: 'pointer', '&:hover': { color: 'primary.main' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    onClick={() => applySavedSearch(s)}
                  >
                    {s.name}
                  </Typography>
                  <IconButton size="small" onClick={() => handleTogglePin(s.id)}><PushPinIcon sx={{ fontSize: 14 }} /></IconButton>
                  <IconButton size="small" onClick={() => handleDeleteSearch(s.id)}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                </Stack>
              ))
            ) : (
              !savedSearches.some(s => s.pinned) && (
                <Typography variant="caption" color="text.secondary">No saved searches yet</Typography>
              )
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ pb: '12px !important' }}>
            <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
              <HistoryIcon fontSize="small" color="action" />
              <Typography variant="subtitle2">Recent Team Searches</Typography>
            </Stack>
            {recentSearches.length > 0 ? (
              recentSearches.slice(0, 15).map(s => (
                <Stack key={s.id} direction="row" alignItems="center" spacing={1} sx={{ py: 0.3 }}>
                  <Avatar sx={{ width: 20, height: 20, fontSize: 11 }}>
                    {s.user.name.charAt(0)}
                  </Avatar>
                  <Typography
                    variant="caption"
                    sx={{ flex: 1, cursor: 'pointer', '&:hover': { color: 'primary.main' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    onClick={() => applySavedSearch(s)}
                  >
                    {s.query || '(filters only)'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    {timeAgo(s.createdAt)}
                  </Typography>
                </Stack>
              ))
            ) : (
              <Typography variant="caption" color="text.secondary">No recent searches</Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Search</Typography>
          {results && results.totalCount > 0 && (
            <ExportExcelButton
              data={flatResults as unknown as Record<string, unknown>[]}
              columns={[
                { key: 'type', header: 'Type' },
                { key: 'name', header: 'Name' },
                { key: 'detail', header: 'Detail' },
                { key: 'date', header: 'Date' },
              ]}
              fileName="search-results"
            />
          )}
        </Stack>

        {/* Search Bar */}
        <TextField
          fullWidth
          size="medium"
          placeholder="Search across documents, transmittals, emails, equipment, discussions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                {query && (
                  <IconButton size="small" onClick={() => setQuery('')}><ClearIcon fontSize="small" /></IconButton>
                )}
                <Tooltip title="Toggle filters">
                  <IconButton onClick={() => setShowFilters(!showFilters)}>
                    <Badge color="primary" variant="dot" invisible={!hasFilters}>
                      <FilterListIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />

        {/* Active filter chips */}
        {hasFilters && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" mb={1} useFlexGap>
            {selectedTypes.length < ENTITY_TYPES.length && (
              <Chip size="small" label={`Types: ${selectedTypes.length}/${ENTITY_TYPES.length}`} onDelete={() => setSelectedTypes(ENTITY_TYPES.map(t => t.value))} />
            )}
            {dateFrom && <Chip size="small" label={`From: ${dateFrom}`} onDelete={() => setDateFrom('')} />}
            {dateTo && <Chip size="small" label={`To: ${dateTo}`} onDelete={() => setDateTo('')} />}
            {category && <Chip size="small" label={`Category: ${category}`} onDelete={() => setCategory('')} />}
            {folder && <Chip size="small" label={`Folder: ${folder}`} onDelete={() => setFolder('')} />}
            {discipline && <Chip size="small" label={`Discipline: ${discipline}`} onDelete={() => setDiscipline('')} />}
            {status && <Chip size="small" label={`Status: ${status}`} onDelete={() => setStatus('')} />}
            {companyName && <Chip size="small" label={`Company: ${companyName}`} onDelete={() => setCompanyName('')} />}
            {equipmentTag && <Chip size="small" label={`Tag: ${equipmentTag}`} onDelete={() => setEquipmentTag('')} />}
            <Chip size="small" label="Clear all" variant="outlined" onClick={clearFilters} />
          </Stack>
        )}

        {/* Advanced Filters */}
        <Collapse in={showFilters}>
          <Card sx={{ mb: 2, p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Entity Types</Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" mb={2} useFlexGap>
              {ENTITY_TYPES.map(t => (
                <Chip
                  key={t.value}
                  icon={t.icon}
                  label={t.label}
                  size="small"
                  color={selectedTypes.includes(t.value) ? 'primary' : 'default'}
                  variant={selectedTypes.includes(t.value) ? 'filled' : 'outlined'}
                  onClick={() => toggleType(t.value)}
                />
              ))}
            </Stack>

            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <TextField size="small" type="date" label="Date From" value={dateFrom} onChange={e => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 160 }} />
              <TextField size="small" type="date" label="Date To" value={dateTo} onChange={e => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 160 }} />
              <TextField select size="small" label="Category" value={category} onChange={e => setCategory(e.target.value)} sx={{ width: 160 }}>
                <MenuItem value="">All</MenuItem>
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="Folder" value={folder} onChange={e => setFolder(e.target.value)} sx={{ width: 160 }}>
                <MenuItem value="">All</MenuItem>
                {FOLDERS.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="Discipline" value={discipline} onChange={e => setDiscipline(e.target.value)} sx={{ width: 160 }}>
                <MenuItem value="">All</MenuItem>
                {DISCIPLINES.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="Status" value={status} onChange={e => setStatus(e.target.value)} sx={{ width: 160 }}>
                <MenuItem value="">All</MenuItem>
                {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField size="small" label="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Vendor, partner..." sx={{ width: 180 }} />
              <TextField size="small" label="Equipment Tag" value={equipmentTag} onChange={e => setEquipmentTag(e.target.value)} placeholder="e.g. P-101" sx={{ width: 160 }} />
            </Stack>
          </Card>
        </Collapse>

        {/* Results */}
        {loading ? (
          <Box textAlign="center" mt={4}><CircularProgress /></Box>
        ) : results ? (
          <>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {results.totalCount} result{results.totalCount !== 1 ? 's' : ''} found
            </Typography>

            {results.documents.length > 0 && (
              <ResultSection
                title="Documents"
                icon={<DescriptionIcon />}
                count={results.documents.length}
                defaultExpanded
              >
                {results.documents.map(d => (
                  <ResultRow key={d.id} onClick={() => navigate('/documents')}>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={500}>{d.fileName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {d.description || 'No description'} — by {d.uploadedBy.name}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Chip label={d.category} size="small" variant="outlined" />
                      {d.folder && <Chip label={d.folder} size="small" />}
                      <Typography variant="caption" color="text.secondary">{new Date(d.createdAt).toLocaleDateString()}</Typography>
                    </Stack>
                  </ResultRow>
                ))}
              </ResultSection>
            )}

            {results.transmittals.length > 0 && (
              <ResultSection title="Transmittals" icon={<SendIcon />} count={results.transmittals.length}>
                {results.transmittals.map(t => (
                  <ResultRow key={t.id} onClick={() => navigate(`/transmittals/${t.id}`)}>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={500}>{t.transmittalNumber} — {t.subject}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        To: {t.recipientName} — by {t.sentBy.name}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Chip label={t.purpose} size="small" variant="outlined" />
                      <Chip label={t.status} size="small" color={t.status === 'SENT' ? 'success' : 'default'} />
                      <Typography variant="caption" color="text.secondary">{new Date(t.createdAt).toLocaleDateString()}</Typography>
                    </Stack>
                  </ResultRow>
                ))}
              </ResultSection>
            )}

            {results.emails.length > 0 && (
              <ResultSection title="Emails" icon={<EmailIcon />} count={results.emails.length}>
                {results.emails.map(e => (
                  <ResultRow key={e.id} onClick={() => navigate('/incoming-emails')}>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={500}>{e.subject}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        From: {e.fromName || e.fromAddress}{e.isExternal ? ' (external)' : ''}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {e.purpose && <Chip label={e.purpose} size="small" variant="outlined" />}
                      <Chip label={e.status} size="small" />
                      <Typography variant="caption" color="text.secondary">{new Date(e.receivedAt).toLocaleDateString()}</Typography>
                    </Stack>
                  </ResultRow>
                ))}
              </ResultSection>
            )}

            {results.equipment.length > 0 && (
              <ResultSection title="Equipment" icon={<PrecisionManufacturingIcon />} count={results.equipment.length}>
                {results.equipment.map(eq => (
                  <ResultRow key={eq.id} onClick={() => navigate(`/equipment/${eq.id}`)}>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={500}>{eq.tagNumber} — {eq.service}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[eq.subType, eq.material].filter(Boolean).join(' — ') || 'No additional details'}
                      </Typography>
                    </Box>
                    <Chip label={eq.category} size="small" variant="outlined" />
                  </ResultRow>
                ))}
              </ResultSection>
            )}

            {results.discussions.length > 0 && (
              <ResultSection title="Discussions" icon={<ForumIcon />} count={results.discussions.length}>
                {results.discussions.map(d => (
                  <ResultRow key={d.id} onClick={() => navigate(`/discussions/${d.id}`)}>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={500}>{d.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        by {d.author.name}{d.equipment ? ` — ${d.equipment.tagNumber}` : ''}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">{new Date(d.createdAt).toLocaleDateString()}</Typography>
                  </ResultRow>
                ))}
              </ResultSection>
            )}

            {results.register.length > 0 && (
              <ResultSection title="Document Register" icon={<AssignmentIcon />} count={results.register.length}>
                {results.register.map(r => (
                  <ResultRow key={r.id} onClick={() => navigate('/document-register')}>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={500}>{r.documentNumber} — {r.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Rev {r.revision} — Owner: {r.owner.name}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Chip label={r.discipline} size="small" variant="outlined" />
                      <Chip label={r.status} size="small" color={r.status === 'APPROVED' ? 'success' : 'default'} />
                    </Stack>
                  </ResultRow>
                ))}
              </ResultSection>
            )}

            {results.totalCount === 0 && (
              <Box textAlign="center" mt={4}>
                <Typography color="text.secondary">No results found. Try different search terms or filters.</Typography>
              </Box>
            )}
          </>
        ) : (
          <Box textAlign="center" mt={6}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            <Typography color="text.secondary" mt={1}>
              Start typing to search across your project data
            </Typography>
          </Box>
        )}
      </Box>

      {/* Save Search Dialog */}
      <Dialog open={saveOpen} onClose={() => setSaveOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Save Search</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Search Name"
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            placeholder="e.g. Q3 vendor documents"
            sx={{ mt: 1 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Query: {query || '(empty)'} {hasFilters ? '+ filters' : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!saveName}>Save</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

// ── Helper Components ──

function ResultSection({ title, icon, count, children, defaultExpanded }: {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  return (
    <Accordion defaultExpanded={defaultExpanded ?? true} disableGutters sx={{ mb: 1, '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {icon}
          <Typography variant="subtitle2">{title}</Typography>
          <Chip label={count} size="small" color="primary" />
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

function ResultRow({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        px: 2, py: 1, cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
      onClick={onClick}
    >
      {children}
    </Stack>
  );
}
