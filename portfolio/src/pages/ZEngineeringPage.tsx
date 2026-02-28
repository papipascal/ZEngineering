import {
  Typography, Card, CardContent, Button, Stack, Box, Chip, Grid, Divider, Alert,
} from '@mui/material';
import {
  Engineering, GitHub, OpenInNew, CheckCircle, Storage, Code, Email,
  Description, Assignment, People, Settings, RocketLaunch, Dashboard,
  AccountTree, Search, Security, Notifications, FileDownload, MailOutline,
  TrackChanges, Article, Person, Timeline, FolderOpen,
} from '@mui/icons-material';

// ── Feature categories ────────────────────────────────────────────────────────
const FEATURE_CATEGORIES = [
  {
    label: 'Projet & Équipe',
    color: '#1565C0',
    bg: '#E3F2FD',
    features: [
      { icon: <Dashboard />, title: 'Tableau de bord', desc: 'KPIs projet en temps réel : équipements, workflows actifs, documents, distribution par catégorie.' },
      { icon: <Assignment />, title: 'Gestion de projet', desc: 'Multi-projets, membres, partenaires (licencier, EPC), fournisseurs avec notes par projet.' },
      { icon: <AccountTree />, title: 'Organigramme & Arborescence', desc: '31 rôles projet hiérarchiques (chef de projet, leads discipline…). Arborescence documentaire standard industriel.' },
      { icon: <Timeline />, title: 'Mes Tâches', desc: 'Vue personnelle des tâches assignées par rôle organigramme. Filtres active / pending / completed.' },
    ],
  },
  {
    label: 'Données Engineering',
    color: '#2E7D32',
    bg: '#E8F5E9',
    features: [
      { icon: <Settings />, title: 'Liste des équipements', desc: '27 équipements réalistes (vessels, pompes, échangeurs, valves). Fiches complètes, filtres multi-critères, search par tag.' },
      { icon: <TrackChanges />, title: 'Data Origin / AGO', desc: 'Traçabilité Approved & Guaranteed Origin par champ technique. Staleness check automatique, historique de révisions.' },
      { icon: <Article />, title: 'Articles de contrat', desc: 'Exigences contractuelles avec statuts OPEN/IN_PROGRESS/CLOSED. Journal des modifications (change log), import Excel.' },
      { icon: <People />, title: 'Gestion fournisseurs', desc: 'Vendor list 100+ fournisseurs industriels avec spécialités et pays. Sélection par projet avec notes.' },
    ],
  },
  {
    label: 'Document Control',
    color: '#E65100',
    bg: '#FFF3E0',
    features: [
      { icon: <Description />, title: 'Registre de documents', desc: 'Registre officiel avec cycle de vie DRAFT → FOR_REVIEW → APPROVED. Disciplines, révisions, émetteurs.' },
      { icon: <Storage />, title: 'Upload de fichiers (MinIO)', desc: 'Stockage S3-compatible on-premise. Presigned URLs temporaires. Isolation par projet : uploads app sous projects/{id}/, pièces jointes email sous projects/{id}/inbox/.' },
      { icon: <FolderOpen />, title: 'Transmittals', desc: 'Envois officiels formalisés (FOR_REVIEW, FOR_APPROVAL…). Lettre de couverture, suivi DRAFT/SENT, destinataires clients/licenciers.' },
      { icon: <MailOutline />, title: 'Propositions de documents', desc: 'Email entrant → pièce jointe détectée → proposition PENDING → validation → registre. Zéro saisie manuelle.' },
    ],
  },
  {
    label: 'Workflow & Collaboration',
    color: '#6A1B9A',
    bg: '#F3E5F5',
    features: [
      { icon: <Code />, title: 'Moteur Workflow', desc: '3 circuits configurables en JSON (Simple Approval, Validation document, Approbation achat). Auto-assignation via organigramme. Zéro licence Camunda.' },
      { icon: <Email />, title: 'Inbox IMAP & Whitelist', desc: 'Polling IMAP toutes les 5 min. Whitelist par email ou domaine. Routage automatique par mot-clé projet. Statuts UNREAD/READ/ARCHIVED.' },
      { icon: <Assignment />, title: 'Discussions', desc: 'Discussions threadées liées aux équipements ou au projet. Commentaires, historique permanent des décisions techniques.' },
      { icon: <Search />, title: 'Recherche globale', desc: 'Full-text multi-entités (équipements, documents, discussions). Recherches sauvegardées et épinglées.' },
    ],
  },
  {
    label: 'Plateforme & Conformité',
    color: '#00838F',
    bg: '#E0F7FA',
    features: [
      { icon: <Security />, title: 'Audit Trail', desc: 'Journal complet de toutes les modifications — champ, ancienne/nouvelle valeur, utilisateur, horodatage. Export CSV pour audit ISO 9001.' },
      { icon: <Notifications />, title: 'Notifications temps réel', desc: 'Server-Sent Events (SSE) — push instantané sans polling. Icône cloche mise à jour en temps réel.' },
      { icon: <FileDownload />, title: 'Export CSV', desc: '6 types : équipements, registre, audit, discussions, transmittals, workflows. Compatible Excel/LibreOffice.' },
      { icon: <Person />, title: 'Profil utilisateur', desc: 'Mise à jour nom/téléphone, changement de mot de passe sécurisé avec validation de l\'ancien mot de passe.' },
    ],
  },
];

// ── Tech stack ────────────────────────────────────────────────────────────────
const TECH_STACK = [
  { label: 'NestJS', color: '#E53935' },
  { label: 'React 19', color: '#1565C0' },
  { label: 'TypeScript', color: '#0D47A1' },
  { label: 'Prisma v6', color: '#00897B' },
  { label: 'PostgreSQL', color: '#1565C0' },
  { label: 'Material UI v7', color: '#1565C0' },
  { label: 'MinIO (S3)', color: '#E65100' },
  { label: 'MailHog (SMTP)', color: '#6A1B9A' },
  { label: 'imapflow', color: '#37474F' },
  { label: 'JWT Auth', color: '#2E7D32' },
  { label: 'Docker', color: '#0277BD' },
  { label: 'Swagger/OpenAPI', color: '#2E7D32' },
  { label: 'SSE (real-time)', color: '#E65100' },
  { label: 'AWS SDK S3', color: '#E65100' },
];

// ── Architecture items ────────────────────────────────────────────────────────
const ARCH_ITEMS = [
  'Backend: NestJS REST API (19 modules) + Prisma ORM + PostgreSQL',
  'Frontend: React 19 SPA — Material UI v7 — Vite 7 — TypeScript',
  'Stockage fichiers: MinIO S3-compatible — bucket "zengineering-files" — chemin projects/{projectId}/{uuid}-{filename}',
  'Email sortant: MailHog (dev) / SMTP réel (prod) via nodemailer',
  'Email entrant: IMAP polling (imapflow) — whitelist — routage automatique',
  'Auth: JWT Bearer Token — rôles admin/manager/member',
  'Workflow: Moteur state-machine maison JSON-configurable (sans Camunda)',
  'Notifications: Server-Sent Events (SSE) — connexion persistante navigateur',
  'Déploiement: Docker images → Synology NAS (docker-compose.nas.yml)',
];

// ── What\'s new v3.2 ───────────────────────────────────────────────────────────
const WHATS_NEW = [
  'Whitelist emails par adresse ou domaine (@licensortech.com) avec CRUD complet',
  'Propositions de documents auto-générées depuis emails entrants avec pièces jointes',
  'Profil utilisateur : mise à jour nom, téléphone, changement de mot de passe sécurisé',
  'Page organigramme : protection par rôle chef de projet pour les modifications',
];

export default function ZEngineeringPage() {
  return (
    <>
      {/* ── Hero ── */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 60%, #E65100 100%)', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-start">
            <Engineering sx={{ fontSize: 88, opacity: 0.9, flexShrink: 0 }} />
            <Box flex={1}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
                <Typography variant="h3" fontWeight="bold">Zen-gineering</Typography>
                <Chip
                  label="v3.2"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}
                />
              </Stack>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                Plateforme de gestion de projets Engineering — Oil &amp; Gas · Pétrochimique · Process
              </Typography>
              <Stack direction="row" spacing={2} mb={2.5} flexWrap="wrap" useFlexGap>
                {[
                  { v: '21', l: 'Modules' },
                  { v: '19', l: 'APIs' },
                  { v: '27', l: 'Équipements' },
                  { v: '0', l: 'Licence externe' },
                ].map(({ v, l }) => (
                  <Box key={l} textAlign="center" sx={{ bgcolor: 'rgba(255,255,255,0.15)', px: 2, py: 0.5, borderRadius: 1 }}>
                    <Typography variant="h5" fontWeight="bold">{v}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>{l}</Typography>
                  </Box>
                ))}
              </Stack>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                <Button
                  variant="contained"
                  startIcon={<RocketLaunch />}
                  href="/zengineering-app/"
                  sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.4)' } }}
                >
                  Lancer l'application
                </Button>
                <Button
                  variant="contained"
                  startIcon={<GitHub />}
                  href="https://github.com/papipascal/ZEngineering"
                  target="_blank"
                  sx={{ bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}
                >
                  Code source
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<OpenInNew />}
                  href="https://github.com/papipascal/ZEngineering#readme"
                  target="_blank"
                  sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white' } }}
                >
                  Documentation
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* ── What's new v3.2 ── */}
      <Alert
        severity="info"
        icon={<CheckCircle />}
        sx={{ mb: 3, '& .MuiAlert-message': { width: '100%' } }}
      >
        <Typography variant="subtitle2" fontWeight="bold" mb={0.5}>Nouveautés v3.2</Typography>
        <Stack spacing={0.5}>
          {WHATS_NEW.map((item) => (
            <Stack key={item} direction="row" spacing={1} alignItems="flex-start">
              <CheckCircle sx={{ fontSize: 14, color: 'info.main', mt: '3px', flexShrink: 0 }} />
              <Typography variant="body2">{item}</Typography>
            </Stack>
          ))}
        </Stack>
      </Alert>

      {/* ── Feature categories ── */}
      <Typography variant="h4" gutterBottom>Fonctionnalités — 5 domaines</Typography>

      <Stack spacing={3} mb={4}>
        {FEATURE_CATEGORIES.map((cat) => (
          <Box key={cat.label}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
              <Box sx={{ width: 4, height: 24, bgcolor: cat.color, borderRadius: 1 }} />
              <Typography variant="h6" fontWeight="bold" color={cat.color}>{cat.label}</Typography>
            </Stack>
            <Grid container spacing={2}>
              {cat.features.map((f) => (
                <Grid key={f.title} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ height: '100%', borderTop: `3px solid ${cat.color}` }}>
                    <CardContent sx={{ pb: '12px !important' }}>
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <Box sx={{ color: cat.color, mt: 0.3, flexShrink: 0 }}>{f.icon}</Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{f.title}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>{f.desc}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* ── Stockage des fichiers ── */}
      <Typography variant="h4" gutterBottom>Stockage des fichiers par projet</Typography>

      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'warning.light' }}>
        <CardContent>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
            <Storage color="warning" />
            <Typography variant="h6">Architecture MinIO — Isolation par projet</Typography>
          </Stack>

          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ bgcolor: '#263238', color: '#ECEFF1', p: 2, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.8 }}>
                <Box sx={{ color: '#81D4FA' }}>Bucket MinIO : zengineering-files</Box>
                <Box sx={{ color: '#90A4AE', mt: 1 }}>└── projects/</Box>
                <Box sx={{ color: '#90A4AE' }}>    └── {'{projectId}'}/ </Box>
                <Box sx={{ color: '#A5D6A7' }}>        ├── uuid1-PFD_RevB.pdf       ← upload app</Box>
                <Box sx={{ color: '#A5D6A7' }}>        ├── uuid2-Datasheet.pdf      ← upload app</Box>
                <Box sx={{ color: '#90A4AE' }}>        └── inbox/                   ← emails IMAP</Box>
                <Box sx={{ color: '#FFE082' }}>            ├── uuid3-specs.pdf      → Document+Proposal</Box>
                <Box sx={{ color: '#FFE082' }}>            └── uuid4-drawing.xlsx   → Document+Proposal</Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1.5}>
                {[
                  { label: 'Bucket unique', desc: '"zengineering-files" partagé entre tous les projets' },
                  { label: 'Isolation projet', desc: 'Chemin projects/{projectId}/ — accès vérifié côté API' },
                  { label: 'Nom fichier', desc: '{uuid}-{nom_original} — évite les collisions de noms' },
                  { label: 'Accès sécurisé', desc: 'Presigned URL temporaire S3 (expire 1h) — jamais d\'URL permanente publique' },
                  { label: 'Déploiement', desc: 'On-premise Synology NAS ou cloud AWS S3 / Azure Blob sans modification de code' },
                ].map(({ label, desc }) => (
                  <Stack key={label} direction="row" spacing={1} alignItems="flex-start">
                    <CheckCircle color="success" fontSize="small" sx={{ mt: '2px', flexShrink: 0 }} />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">{label}</Typography>
                      <Typography variant="caption" color="text.secondary">{desc}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>

          <Alert severity="success" sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>Pipeline complet :</strong> Les pièces jointes des emails IMAP entrants sont automatiquement
              sauvegardées dans MinIO sous <code>projects/{'{projectId}'}/inbox/{'{uuid}'}-{'{filename}'}</code>,
              créées comme enregistrement <code>Document</code> (folder: EMAILS), et liées à une <code>DocumentProposal</code>
              en statut PENDING — le tout dans une seule transaction atomique.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* ── Tech Stack ── */}
      <Typography variant="h4" gutterBottom>Stack technologique</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={4}>
        {TECH_STACK.map((tech) => (
          <Chip
            key={tech.label}
            icon={<Storage sx={{ fontSize: 14 }} />}
            label={tech.label}
            variant="outlined"
            size="small"
            sx={{ borderColor: tech.color, color: tech.color, '& .MuiChip-icon': { color: tech.color } }}
          />
        ))}
      </Stack>

      {/* ── Architecture ── */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Vue d'ensemble de l'architecture</Typography>
          <Stack spacing={1}>
            {ARCH_ITEMS.map((item) => (
              <Stack key={item} direction="row" spacing={1} alignItems="flex-start">
                <CheckCircle color="success" fontSize="small" sx={{ mt: '2px', flexShrink: 0 }} />
                <Typography variant="body2">{item}</Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
