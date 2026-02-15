import { useState } from 'react';
import {
  Typography, Card, CardContent, TextField, Button, Stack, MenuItem,
  Alert, Grid, Box,
} from '@mui/material';
import { Send, RateReview, ShoppingCart } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';

type FormType = 'feedback' | 'quote' | 'order';

const FORM_TYPES: { value: FormType; label: string; icon: React.ReactNode }[] = [
  { value: 'feedback', label: 'General Feedback', icon: <RateReview /> },
  { value: 'quote', label: 'Request a Quote', icon: <Send /> },
  { value: 'order', label: 'Place an Order', icon: <ShoppingCart /> },
];

export default function FeedbackPage() {
  const { user } = useAuth();
  const [formType, setFormType] = useState<FormType>('feedback');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to an API
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubject('');
      setMessage('');
      setCompany('');
    }, 3000);
  };

  return (
    <>
      <Typography variant="h3" gutterBottom>Feedback & Orders</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Send us your feedback, request a quote for engineering services, or place an order.
      </Typography>

      <Grid container spacing={3}>
        {/* Form Type Selection */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>
            {FORM_TYPES.map((ft) => (
              <Card
                key={ft.value}
                sx={{
                  cursor: 'pointer',
                  border: 2,
                  borderColor: formType === ft.value ? 'primary.main' : 'transparent',
                  transition: 'all 0.2s',
                }}
                onClick={() => setFormType(ft.value)}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box color={formType === ft.value ? 'primary.main' : 'text.secondary'}>
                      {ft.icon}
                    </Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={formType === ft.value ? 'bold' : 'normal'}
                    >
                      {ft.label}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>

        {/* Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              {submitted ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Thank you! Your {formType === 'feedback' ? 'feedback' : formType === 'quote' ? 'quote request' : 'order'} has been submitted successfully. We will get back to you shortly.
                </Alert>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Stack spacing={2.5}>
                    <TextField
                      label="Request Type"
                      select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as FormType)}
                    >
                      {FORM_TYPES.map((ft) => (
                        <MenuItem key={ft.value} value={ft.value}>{ft.label}</MenuItem>
                      ))}
                    </TextField>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        label="Your Name"
                        fullWidth
                        defaultValue={user?.name ?? ''}
                        required
                      />
                      <TextField
                        label="Your Email"
                        type="email"
                        fullWidth
                        defaultValue={user?.email ?? ''}
                        required
                      />
                    </Stack>

                    {(formType === 'quote' || formType === 'order') && (
                      <TextField
                        label="Company Name"
                        fullWidth
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                      />
                    )}

                    <TextField
                      label="Subject"
                      fullWidth
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />

                    <TextField
                      label={formType === 'order' ? 'Order Details' : formType === 'quote' ? 'Project Description' : 'Your Message'}
                      multiline
                      rows={5}
                      fullWidth
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      placeholder={
                        formType === 'order'
                          ? 'Describe the engineering services you need, timeline, and any specific requirements...'
                          : formType === 'quote'
                          ? 'Describe your project scope, discipline requirements, timeline expectations...'
                          : 'Share your thoughts, suggestions, or questions...'
                      }
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<Send />}
                    >
                      {formType === 'order' ? 'Submit Order' : formType === 'quote' ? 'Request Quote' : 'Send Feedback'}
                    </Button>
                  </Stack>
                </form>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
