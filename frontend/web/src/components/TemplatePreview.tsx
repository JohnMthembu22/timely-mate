import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { invoiceTemplates, quoteTemplates, getDefaultCompanyInfo, TemplateData } from '../utils/invoiceTemplates';
import { previewHTML } from '../utils/pdfGenerator';

interface TemplatePreviewProps {
  open: boolean;
  onClose: () => void;
  type: 'quote' | 'invoice';
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ open, onClose, type }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('modern-blue');
  
  const templates = type === 'quote' ? quoteTemplates : invoiceTemplates;
  const companyInfo = getDefaultCompanyInfo();

  // Sample data for preview
  const sampleData: TemplateData = {
    documentNumber: type === 'quote' ? 'QUO-2024-0001' : 'INV-2024-0001',
    documentType: type === 'quote' ? 'Quote' : 'Invoice',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: type === 'invoice' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
    expiryDate: type === 'quote' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
    status: 'draft',
    companyName: companyInfo.companyName,
    companyAddress: companyInfo.companyAddress,
    companyEmail: companyInfo.companyEmail,
    companyPhone: companyInfo.companyPhone,
    companyWebsite: companyInfo.companyWebsite,
    clientName: 'Sample Client Ltd.',
    clientEmail: 'client@example.com',
    clientAddress: '456 Client Street\nClient City, 1234\nSouth Africa',
    items: [
      {
        description: 'Web Development Services',
        quantity: 1,
        unitPrice: 15000,
        total: 15000,
      },
      {
        description: 'UI/UX Design',
        quantity: 20,
        unitPrice: 800,
        total: 16000,
      },
      {
        description: 'Project Management',
        quantity: 1,
        unitPrice: 5000,
        total: 5000,
      },
    ],
    subtotal: 36000,
    vatRate: 15,
    vatAmount: 5400,
    total: 41400,
    notes: 'Thank you for your business!',
    terms: 'Payment due within 30 days of invoice date.',
  };

  const handlePreviewTemplate = (templateId: string) => {
    previewHTML(templateId, sampleData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {type === 'quote' ? 'Quote' : 'Invoice'} Template Gallery
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Choose from our professionally designed templates. Click "Preview" to see how your {type} will look.
          </Typography>
          
          <FormControl sx={{ minWidth: 200, mb: 2 }}>
            <InputLabel>Quick Preview</InputLabel>
            <Select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              label="Quick Preview"
            >
              {templates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            onClick={() => handlePreviewTemplate(selectedTemplate)}
            sx={{ ml: 2 }}
          >
            Quick Preview
          </Button>
        </Box>

        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: selectedTemplate === template.id ? 2 : 1,
                  borderColor: selectedTemplate === template.id ? 'primary.main' : 'divider',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%',
                        bgcolor: template.id === 'modern-blue' ? '#2196f3' :
                                template.id === 'classic' ? '#000' :
                                template.id === 'minimalist' ? '#666' :
                                '#4caf50',
                        mr: 1
                      }} 
                    />
                    <Typography variant="h6" component="h3">
                      {template.name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>
                  
                  <Box sx={{ 
                    bgcolor: 'grey.50', 
                    p: 2, 
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'grey.200',
                    minHeight: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                      {template.id === 'modern-blue' && '🎨 Modern design with blue gradient header'}
                      {template.id === 'classic' && '📋 Traditional black & white layout'}
                      {template.id === 'minimalist' && '✨ Clean design with lots of whitespace'}
                      {template.id === 'corporate' && '🏢 Professional green corporate theme'}
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => handlePreviewTemplate(template.id)}
                    fullWidth
                    variant={selectedTemplate === template.id ? 'contained' : 'outlined'}
                  >
                    Preview Template
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplatePreview; 