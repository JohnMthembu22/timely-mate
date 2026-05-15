import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  LinearProgress,
  Divider,
  Paper,
  Stack,
  IconButton,
} from '@mui/material';
import {
  PlayCircle,
  CheckCircle,
  Assignment,
  Quiz,
  ArrowBack,
  BookmarkBorder,
  Bookmark,
  Download,
  Article,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';

interface Module {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'quiz' | 'assignment' | 'reading';
  completed: boolean;
}

interface CourseViewProps {
  courseId: string;
  onBack: () => void;
}

const CourseView: React.FC<CourseViewProps> = ({ courseId, onBack }) => {
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const modules: Module[] = [
    {
      id: '1',
      title: 'Introduction to Construction Project Management',
      duration: '15 min',
      type: 'video',
      completed: true,
    },
    {
      id: '2',
      title: 'Understanding Project Lifecycle',
      duration: '20 min',
      type: 'video',
      completed: false,
    },
    {
      id: '3',
      title: 'Project Planning Fundamentals',
      duration: '25 min',
      type: 'reading',
      completed: false,
    },
    {
      id: '4',
      title: 'Module 1 Assessment',
      duration: '15 min',
      type: 'quiz',
      completed: false,
    },
    {
      id: '5',
      title: 'Practical Exercise: Create a Project Plan',
      duration: '45 min',
      type: 'assignment',
      completed: false,
    },
  ];

  const getModuleIcon = (type: string, completed: boolean) => {
    if (completed) return <CheckCircle color="success" />;
    switch (type) {
      case 'video':
        return <PlayCircle color="primary" />;
      case 'quiz':
        return <Quiz color="warning" />;
      case 'assignment':
        return <Assignment color="info" />;
      case 'reading':
        return <Article color="primary" />;
      default:
        return <PlayCircle />;
    }
  };

  const calculateProgress = () => {
    const completedModules = modules.filter(m => m.completed).length;
    return (completedModules / modules.length) * 100;
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <IconButton 
              onClick={() => {
                console.log('Back button clicked');
                onBack();
              }}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1">
              Construction Project Management
            </Typography>
            <IconButton 
              onClick={() => setIsSaved(!isSaved)}
              sx={{
                bgcolor: isSaved ? 'primary.main' : 'transparent',
                color: isSaved ? 'white' : 'primary.main',
                '&:hover': {
                  bgcolor: isSaved ? 'primary.dark' : 'primary.light',
                  color: 'white',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
                boxShadow: isSaved ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {isSaved ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={calculateProgress()} 
            sx={{ height: 8, borderRadius: 4, mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            {Math.round(calculateProgress())}% Complete
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ mb: 3, p: 3 }}>
              {currentModule ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Module Content
                  </Typography>
                  {/* Placeholder for actual module content */}
                  <Box
                    sx={{
                      bgcolor: 'grey.100',
                      height: 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      Module content will be displayed here
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" gutterBottom>
                    Select a module to begin
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose from the module list on the right to start learning
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Course Modules
                </Typography>
                <List>
                  {modules.map((module, index) => (
                    <React.Fragment key={module.id}>
                      {index > 0 && <Divider />}
                      <ListItemButton
                        selected={currentModule === module.id}
                        onClick={() => setCurrentModule(module.id)}
                      >
                        <ListItemIcon>
                          {getModuleIcon(module.type, module.completed)}
                        </ListItemIcon>
                        <ListItemText
                          primary={module.title}
                          secondary={`${module.duration} • ${module.type.charAt(0).toUpperCase() + module.type.slice(1)}`}
                        />
                      </ListItemButton>
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
};

export default CourseView; 