import React from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Container,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: '100%'
}));

const GridExample = () => {
  // Sample data for grid items
  const gridItems = [
    { id: 1, title: 'Продажи', value: '₸ 1,245,890', 
      description: 'Общий объем продаж за текущий месяц' },
    { id: 2, title: 'Клиенты', value: '648', 
      description: 'Количество активных клиентов' },
    { id: 3, title: 'Проекты', value: '24', 
      description: 'Текущие активные проекты' },
    { id: 4, title: 'Задачи', value: '156', 
      description: 'Невыполненные задачи' },
    { id: 5, title: 'Встречи', value: '12', 
      description: 'Запланированные встречи на неделю' },
    { id: 6, title: 'Отчеты', value: '35', 
      description: 'Отчеты за текущий квартал' },
  ];

  // Responsive grid that shows different columns based on screen size
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Панель мониторинга
      </Typography>

      <Grid container spacing={3}>
        {gridItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Item elevation={2}>
              <Typography variant="h6" color="primary" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="h4" sx={{ my: 2 }}>
                {item.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            </Item>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" sx={{ mt: 6, mb: 3 }}>
        Различные варианты сетки
      </Typography>

      {/* Grid with different column widths */}
      <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
        Разная ширина колонок
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={8}>
          <Item>xs=12 sm=6 md=8</Item>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Item>xs=12 sm=6 md=4</Item>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Item>xs=12 sm=6 md=4</Item>
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <Item>xs=12 sm=6 md=8</Item>
        </Grid>
      </Grid>

      {/* Grid with nested grids */}
      <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
        Вложенная сетка
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={7}>
          <Item>
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1, textAlign: 'center' }}>Вложенный 1</Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1, textAlign: 'center' }}>Вложенный 2</Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 1, textAlign: 'center' }}>Вложенный 3</Paper>
                </Grid>
              </Grid>
            </Box>
          </Item>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Item>xs=12 sm=5</Item>
        </Grid>
      </Grid>

      {/* Card grid example */}
      <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
        Пример с карточками
      </Typography>
      <Grid container spacing={3}>
        {[1, 2, 3].map((item) => (
          <Grid item xs={12} md={4} key={item}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="div">
                  Карточка {item}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Это пример карточки внутри сетки Material UI. 
                  Grid позволяет легко создавать отзывчивые макеты.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default GridExample; 