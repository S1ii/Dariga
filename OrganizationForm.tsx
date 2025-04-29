import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Stack,
  Switch,
  FormControlLabel,
  Typography
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

const organizationTypes = [
  'Строительство',
  'Розничная торговля',
  'Оптовая торговля',
  'Нефть и газ',
  'Медицина',
  'Пищевая промышленность',
  'Сельское хозяйство',
  'Финансы',
  'IT',
  'Логистика',
  'Экология',
  'Энергетика',
  'Транспорт',
  'Образование',
  'Другое'
];

interface OrganizationFormData {
  name: string;
  address: string;
  type: string;
  bin: string;
  contactPerson: string;
  phone: string;
  email: string;
  description: string;
  isActive: boolean;
}

const initialFormData: OrganizationFormData = {
  name: '',
  address: '',
  type: '',
  bin: '',
  contactPerson: '',
  phone: '',
  email: '',
  description: '',
  isActive: true
};

interface FormErrors {
  name?: string;
  address?: string;
  type?: string;
  bin?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

const OrganizationForm: React.FC = () => {
  const [formData, setFormData] = useState<OrganizationFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    
    if (!name) return;
    
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name as keyof FormErrors]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: undefined
      }));
    }
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      isActive: event.target.checked
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Название организации обязательно';
      isValid = false;
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Адрес обязателен';
      isValid = false;
    }

    if (!formData.type) {
      newErrors.type = 'Выберите тип организации';
      isValid = false;
    }

    if (!formData.bin.trim()) {
      newErrors.bin = 'БИН/ИИН обязателен';
    } else if (!/^\d{12}$/.test(formData.bin)) {
      newErrors.bin = 'БИН/ИИН должен содержать 12 цифр';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен';
    } else if (!/^\+7\s\d{3}\s\d{3}\s\d{2}\s\d{2}$/.test(formData.phone)) {
      newErrors.phone = 'Формат: +7 XXX XXX XX XX';
      isValid = false;
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Сбросить форму после успешной отправки
      // setFormData(initialFormData);
      
      // В реальном приложении здесь был бы редирект или другая логика
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader 
          title="Информация об организации" 
          subheader="Добавьте или отредактируйте данные организации"
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Название организации"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                error={Boolean(errors.name)}
                helperText={errors.name}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="БИН/ИИН"
                name="bin"
                required
                value={formData.bin}
                onChange={handleChange}
                error={Boolean(errors.bin)}
                helperText={errors.bin || 'Введите 12 цифр'}
                inputProps={{ maxLength: 12 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Адрес"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                error={Boolean(errors.address)}
                helperText={errors.address}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={Boolean(errors.type)} required>
                <InputLabel id="type-label">Тип организации</InputLabel>
                <Select
                  labelId="type-label"
                  name="type"
                  value={formData.type}
                  label="Тип организации"
                  onChange={handleChange}
                >
                  {organizationTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Контактное лицо"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Телефон"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                error={Boolean(errors.phone)}
                helperText={errors.phone || 'Формат: +7 XXX XXX XX XX'}
                placeholder="+7 XXX XXX XX XX"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={Boolean(errors.email)}
                helperText={errors.email}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Описание"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={formData.isActive}
                    onChange={handleSwitchChange}
                    name="isActive"
                  />
                }
                label={
                  <Typography variant="body2">
                    {formData.isActive ? 'Организация активна' : 'Организация неактивна'}
                  </Typography>
                }
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined">
              Отмена
            </Button>
            <LoadingButton 
              loading={loading} 
              type="submit" 
              variant="contained"
              color="primary"
            >
              Сохранить
            </LoadingButton>
          </Stack>
        </Box>
      </Card>
    </form>
  );
};

export default OrganizationForm; 