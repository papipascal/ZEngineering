import {
  Typography, Card, CardContent, Button, Stack, Box, Chip, Grid, Divider,
} from '@mui/material';
import {
  Engineering, GitHub, OpenInNew, CheckCircle, Storage, Code, Email,
  Description, Assignment, People, Settings,
} from '@mui/icons-material';

const FEATURES = [
  { icon: <Assignment />, title: 'Project Management', desc: 'Create and manage engineering projects with dashboards and KPIs' },
  { icon: <People />, title: 'Team & Vendors', desc: 'Manage team members, vendors, and project partners' },
  { icon: <Settings />, title: 'Equipment Register', desc: 'Track equipment with full specifications and change requests' },
  { icon: <Description />, title: 'Document Control', desc: 'Document register with revisions, file uploads, and Excel export' },
  { icon: <Email />, title: 'Transmittals & Inbox', desc: 'Send formal document packages and receive emails via IMAP polling' },
  { icon: <Code />, title: 'Workflow Engine', desc: 'Custom state-machine workflow with approval steps and task routing' },
];

const TECH_STACK = [
  'NestJS', 'React', 'TypeScript', 'Prisma', 'PostgreSQL', 'Material UI',
  'MinIO (S3)', 'MailHog (SMTP)', 'Docker', 'Swagger/OpenAPI',
];

export default function ZEngineeringPage() {
  return (
    <>
      {/* Hero */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #e65100 0%, #ff8f00 100%)', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
            <Engineering sx={{ fontSize: 80, opacity: 0.9 }} />
            <Box>
              <Typography variant="h3">Z'Engineering</Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                Full-Stack Engineering Project Management Platform
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <Button
                  variant="contained"
                  startIcon={<GitHub />}
                  href="https://github.com/papipascal/ZEngineering"
                  target="_blank"
                  sx={{ bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}
                >
                  View Source Code
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

      {/* Features */}
      <Typography variant="h4" gutterBottom>Platform Features</Typography>
      <Grid container spacing={2} mb={4}>
        {FEATURES.map((f) => (
          <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box color="primary.main" mt={0.5}>{f.icon}</Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Tech Stack */}
      <Typography variant="h4" gutterBottom>Technology Stack</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={4}>
        {TECH_STACK.map((tech) => (
          <Chip
            key={tech}
            icon={<Storage sx={{ fontSize: 16 }} />}
            label={tech}
            variant="outlined"
            color="primary"
          />
        ))}
      </Stack>

      {/* Architecture */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Architecture Overview</Typography>
          <Stack spacing={1}>
            {[
              'Backend: NestJS REST API with Prisma ORM and PostgreSQL',
              'Frontend: React SPA with Material UI and Vite bundler',
              'Storage: MinIO (S3-compatible) for document uploads',
              'Email: MailHog for SMTP testing, IMAP polling for incoming emails',
              'Auth: JWT-based authentication with role management',
              'Workflow: Custom lightweight state-machine engine (no external dependencies)',
            ].map((item) => (
              <Stack key={item} direction="row" spacing={1} alignItems="center">
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2">{item}</Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
