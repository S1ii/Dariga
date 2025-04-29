import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
  Chip,
  Stack,
  Tab,
  Tabs,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Avatar,
  ListItemSecondaryAction,
  Tooltip
} from '@mui/material';
import {
  Business,
  LocationOn,
  Phone,
  Email,
  Assignment,
  Visibility,
  Edit,
  Delete,
  Event,
  Group,
  Receipt,
  Timeline,
  Download
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`organization-tabpanel-${index}`}
      aria-labelledby={`organization-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface OrganizationData {
  id: string;
  name: string;
  address: string;
  type: string;
  bin: string;
  contactPerson: string;
  phone: string;
  email: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Sample data
const organizationData: OrganizationData = {
  id: '12345',
  name: 'ТОО "КазСтройИнвест"',
  address: 'г. Алматы, ул. Абая, 150, офис 305',
  type: 'Строительство',
  bin: '123456789012',
  contactPerson: 'Ахметов Нурлан Серикович',
  phone: '+7 701 555 44 33',
  email: 'info@kazstroy.kz',
  description: 'Компания специализируется на строительстве жилых и коммерческих объектов на территории Казахстана. Основана в 2010 году.',
  isActive: true,
  createdAt: '2022-05-15T10:30:00Z',
  updatedAt: '2023-11-20T14:45:00Z'
};

const projectsList = [
  { id: '1', name: 'ЖК "Аспан"', status: 'В процессе', date: '2023-05-20' },
  { id: '2', name: 'Торговый центр "Мега"', status: 'Завершен', date: '2022-12-10' },
  { id: '3', name: 'Офисное здание "Бизнес Плаза"', status: 'Планируется', date: '2024-03-15' }
];

const contactsList = [
  { id: '1', name: 'Ахметов Нурлан', position: 'Директор', phone: '+7 701 555 44 33', email: 'n.akhmetov@kazstroy.kz' },
  { id: '2', name: 'Сергеева Айгуль', position: 'Бухгалтер', phone: '+7 702 444 33 22', email: 'a.sergeeva@kazstroy.kz' },
  { id: '3', name: 'Тулегенов Ержан', position: 'Проектный менеджер', phone: '+7 707 333 22 11', email: 'e.tulegenov@kazstroy.kz' }
];

const documentsList = [
  { id: '1', name: 'Свидетельство о регистрации', type: 'PDF', date: '2010-06-20' },
  { id: '2', name: 'Лицензия на строительство', type: 'PDF', date: '2023-01-15' },
  { id: '3', name: 'Финансовый отчет 2022', type: 'XLSX', date: '2023-03-30' }
];

const OrganizationDetail: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Детали организации
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Visibility />}>
            Просмотр
          </Button>
          <Button variant="contained" startIcon={<Edit />} color="primary">
            Редактировать
          </Button>
          <Button variant="outlined" startIcon={<Delete />} color="error">
            Удалить
          </Button>
        </Stack>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title={
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h5">{organizationData.name}</Typography>
              {organizationData.isActive ? (
                <Chip label="Активна" color="success" size="small" />
              ) : (
                <Chip label="Неактивна" color="error" size="small" />
              )}
            </Stack>
          }
          subheader={`БИН/ИИН: ${organizationData.bin}`}
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business color="primary" />
                  <Typography variant="body1" fontWeight="medium">Тип:</Typography>
                  <Typography variant="body1">{organizationData.type}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn color="primary" />
                  <Typography variant="body1" fontWeight="medium">Адрес:</Typography>
                  <Typography variant="body1">{organizationData.address}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone color="primary" />
                  <Typography variant="body1" fontWeight="medium">Телефон:</Typography>
                  <Typography variant="body1">{organizationData.phone}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email color="primary" />
                  <Typography variant="body1" fontWeight="medium">Email:</Typography>
                  <Typography variant="body1">{organizationData.email}</Typography>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Group color="primary" />
                  <Typography variant="body1" fontWeight="medium">Контактное лицо:</Typography>
                  <Typography variant="body1">{organizationData.contactPerson}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Event color="primary" />
                  <Typography variant="body1" fontWeight="medium">Создано:</Typography>
                  <Typography variant="body1">
                    {new Date(organizationData.createdAt).toLocaleDateString('ru-RU')}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Event color="primary" />
                  <Typography variant="body1" fontWeight="medium">Обновлено:</Typography>
                  <Typography variant="body1">
                    {new Date(organizationData.updatedAt).toLocaleDateString('ru-RU')}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            
            {organizationData.description && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Assignment color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body1" fontWeight="medium">Описание:</Typography>
                    <Typography variant="body1">{organizationData.description}</Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Проекты" icon={<Timeline />} iconPosition="start" />
          <Tab label="Контакты" icon={<Group />} iconPosition="start" />
          <Tab label="Документы" icon={<Receipt />} iconPosition="start" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <List>
            {projectsList.map((project) => (
              <ListItem 
                key={project.id}
                divider
                secondaryAction={
                  <IconButton edge="end">
                    <Visibility />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={project.name}
                  secondary={
                    <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                      <Chip 
                        label={project.status} 
                        size="small"
                        color={
                          project.status === 'В процессе' ? 'primary' : 
                          project.status === 'Завершен' ? 'success' : 'warning'
                        }
                      />
                      <Typography variant="body2" color="text.secondary">
                        Дата: {new Date(project.date).toLocaleDateString('ru-RU')}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <List>
            {contactsList.map((contact) => (
              <ListItem 
                key={contact.id}
                divider
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <IconButton>
                      <Phone fontSize="small" />
                    </IconButton>
                    <IconButton>
                      <Email fontSize="small" />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemIcon>
                  <Avatar>{contact.name.charAt(0)}</Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={contact.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {contact.position}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {contact.phone} • {contact.email}
                        </Typography>
                      </Box>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <List>
            {documentsList.map((document) => (
              <ListItem 
                key={document.id}
                divider
                secondaryAction={
                  <ListItemSecondaryAction>
                    <Tooltip title="Просмотр">
                      <IconButton edge="end" aria-label="view">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Скачать">
                      <IconButton edge="end" aria-label="download">
                        <Download />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                }
              >
                <ListItemIcon>
                  <Assignment />
                </ListItemIcon>
                <ListItemText
                  primary={document.name}
                  secondary={
                    <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                      <Chip label={document.type} size="small" />
                      <Typography variant="body2" color="text.secondary">
                        Дата: {new Date(document.date).toLocaleDateString('ru-RU')}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default OrganizationDetail; 