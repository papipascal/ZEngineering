import {
  Typography, Card, CardContent, Stack, Chip, Box, Divider, Avatar, Grid,
  LinearProgress,
} from '@mui/material';
import { Work, School, Build, Language } from '@mui/icons-material';

const SKILLS = [
  { name: 'Process Engineering', level: 95 },
  { name: 'Piping Design', level: 90 },
  { name: 'Instrumentation & Control', level: 85 },
  { name: 'Project Management', level: 90 },
  { name: 'HSE / Risk Assessment', level: 80 },
  { name: 'Full-Stack Development', level: 75 },
];

const EXPERIENCE = [
  {
    period: '2020 - Present',
    title: 'Senior Engineering Consultant',
    company: "Z'Engineering",
    description: 'Lead engineering consultant providing multi-discipline engineering services for oil & gas, petrochemical, and industrial projects. Managing project teams, vendor coordination, and technical document control.',
  },
  {
    period: '2015 - 2020',
    title: 'Process Engineer',
    company: 'Major EPC Contractor',
    description: 'Process design and optimization for refinery and petrochemical units. PFD/P&ID development, equipment sizing, HAZOP participation.',
  },
  {
    period: '2012 - 2015',
    title: 'Junior Engineer',
    company: 'Engineering Services Ltd.',
    description: 'Field engineering support, commissioning assistance, and technical documentation for industrial facilities.',
  },
];

const EDUCATION = [
  {
    period: '2008 - 2012',
    degree: 'Master of Engineering - Process Engineering',
    school: 'National Engineering School',
  },
  {
    period: '2006 - 2008',
    degree: 'Preparatory Classes - Mathematics & Physics',
    school: 'Lycee National',
  },
];

const CERTIFICATIONS = [
  'PMP - Project Management Professional',
  'NEBOSH International General Certificate',
  'API 570 - Piping Inspector',
  'Six Sigma Green Belt',
];

export default function CVPage() {
  return (
    <>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1a237e 0%, #00897b 100%)', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
            <Avatar sx={{ width: 100, height: 100, bgcolor: 'rgba(255,255,255,0.2)', fontSize: 40 }}>
              PG
            </Avatar>
            <Box>
              <Typography variant="h3">Pascal Goris</Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>Senior Engineering Consultant</Typography>
              <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
                <Chip label="Process Engineering" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label="Project Management" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label="Full-Stack Development" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left column */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Experience */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Work color="primary" />
                <Typography variant="h5">Professional Experience</Typography>
              </Stack>
              {EXPERIENCE.map((exp, i) => (
                <Box key={i}>
                  {i > 0 && <Divider sx={{ my: 2 }} />}
                  <Typography variant="caption" color="primary">{exp.period}</Typography>
                  <Typography variant="h6">{exp.title}</Typography>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>{exp.company}</Typography>
                  <Typography variant="body2">{exp.description}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Education */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <School color="primary" />
                <Typography variant="h5">Education</Typography>
              </Stack>
              {EDUCATION.map((edu, i) => (
                <Box key={i}>
                  {i > 0 && <Divider sx={{ my: 2 }} />}
                  <Typography variant="caption" color="primary">{edu.period}</Typography>
                  <Typography variant="h6">{edu.degree}</Typography>
                  <Typography variant="body2" color="text.secondary">{edu.school}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Right column */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Skills */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Build color="primary" />
                <Typography variant="h5">Skills</Typography>
              </Stack>
              <Stack spacing={2}>
                {SKILLS.map((skill) => (
                  <Box key={skill.name}>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">{skill.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{skill.level}%</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={skill.level}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Language color="primary" />
                <Typography variant="h5">Certifications</Typography>
              </Stack>
              <Stack spacing={1}>
                {CERTIFICATIONS.map((cert) => (
                  <Chip key={cert} label={cert} variant="outlined" size="small" />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          Note: This CV contains placeholder data for demonstration purposes. Update with your actual information.
        </Typography>
      </Box>
    </>
  );
}
