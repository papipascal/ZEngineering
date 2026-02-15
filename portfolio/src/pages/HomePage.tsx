import {
  Typography, Grid, Card, CardContent, CardActionArea, Stack, Box, Chip,
} from '@mui/material';
import { Person, School, Engineering, ContactMail } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const SECTIONS = [
  {
    title: 'CV / Resume',
    description: 'Professional experience, education, certifications, and technical skills.',
    icon: <Person sx={{ fontSize: 48 }} />,
    path: '/cv',
    color: '#1a237e',
  },
  {
    title: 'National Studies Projects',
    description: 'Engineering studies and national-scale project references.',
    icon: <School sx={{ fontSize: 48 }} />,
    path: '/projects',
    color: '#00897b',
    badge: 'Coming Soon',
  },
  {
    title: "Z'Engineering Platform",
    description: 'Full-stack engineering project management platform — live demo & source code.',
    icon: <Engineering sx={{ fontSize: 48 }} />,
    path: '/zengineering',
    color: '#e65100',
  },
  {
    title: 'Feedback & Orders',
    description: 'Send feedback, request a quote, or place an order for engineering services.',
    icon: <ContactMail sx={{ fontSize: 48 }} />,
    path: '/feedback',
    color: '#6a1b9a',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      <Box mb={4}>
        <Typography variant="h3" gutterBottom>
          Welcome{user ? `, ${user.name}` : ''}
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight="normal">
          Engineering Portfolio & Project Showcase
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {SECTIONS.map((s) => (
          <Grid key={s.path} size={{ xs: 12, sm: 6, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea onClick={() => navigate(s.path)} sx={{ height: '100%', p: 1 }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box sx={{ color: s.color }}>{s.icon}</Box>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                        <Typography variant="h5">{s.title}</Typography>
                        {s.badge && <Chip label={s.badge} size="small" color="warning" />}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {s.description}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
