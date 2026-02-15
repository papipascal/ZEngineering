import {
  Typography, Card, CardContent, Box, Stack, Chip, Alert,
} from '@mui/material';
import { Construction } from '@mui/icons-material';

const PLACEHOLDER_PROJECTS = [
  {
    name: 'Oil Refinery Expansion - Phase II',
    client: 'National Oil Company',
    scope: 'Process design, piping, instrumentation for CDU/VDU expansion',
    status: 'Coming Soon',
  },
  {
    name: 'Gas Treatment Plant',
    client: 'Ministry of Energy',
    scope: 'FEED study and detailed engineering for 200 MMSCFD gas processing facility',
    status: 'Coming Soon',
  },
  {
    name: 'Water Treatment Facility Upgrade',
    client: 'Municipal Authority',
    scope: 'Modernization of existing water treatment plant with new filtration and SCADA systems',
    status: 'Coming Soon',
  },
];

export default function ProjectsPage() {
  return (
    <>
      <Typography variant="h3" gutterBottom>National Studies Projects</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Engineering studies and national-scale project references.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        This section is under construction. Detailed project case studies will be added soon with full documentation, drawings, and technical summaries.
      </Alert>

      <Stack spacing={2}>
        {PLACEHOLDER_PROJECTS.map((p) => (
          <Card key={p.name} sx={{ opacity: 0.7 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Construction color="action" />
                    <Typography variant="h6">{p.name}</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    <strong>Client:</strong> {p.client}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Scope:</strong> {p.scope}
                  </Typography>
                </Box>
                <Chip label={p.status} color="warning" size="small" />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </>
  );
}
