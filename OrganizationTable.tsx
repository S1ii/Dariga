import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Checkbox,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon
} from '@mui/icons-material';

interface OrganizationData {
  id: number;
  name: string;
  address: string;
  status: string;
  type: string;
  contacts: number;
}

const createData = (
  id: number,
  name: string,
  address: string,
  status: string,
  type: string,
  contacts: number,
): OrganizationData => {
  return { id, name, address, status, type, contacts };
}

const rows = [
  createData(1, 'ТОО "Астана Строй"', 'г. Астана, ул. Кунаева, 10', 'active', 'Строительство', 5),
  createData(2, 'ИП "Алматы Торг"', 'г. Алматы, пр. Абая, 52', 'inactive', 'Розничная торговля', 2),
  createData(3, 'АО "КазТрансОйл"', 'г. Астана, ул. Кабанбай батыра, 19', 'active', 'Нефть и газ', 8),
  createData(4, 'ТОО "Медикал Плюс"', 'г. Шымкент, ул. Тауке хана, 5', 'active', 'Медицина', 4),
  createData(5, 'ИП "Караганда Хлеб"', 'г. Караганда, ул. Ермекова, 29', 'inactive', 'Пищевая промышленность', 1),
  createData(6, 'ТОО "АгроТех"', 'г. Костанай, ул. Баймагамбетова, 3', 'pending', 'Сельское хозяйство', 3),
  createData(7, 'АО "ФинКонсалт"', 'г. Астана, пр. Республики, 24', 'active', 'Финансы', 6),
  createData(8, 'ТОО "IT Solutions"', 'г. Алматы, ул. Жибек Жолы, 135', 'active', 'IT', 7),
  createData(9, 'ИП "ЛогистикПро"', 'г. Актау, мкр. 12, д. 7', 'pending', 'Логистика', 2),
  createData(10, 'ТОО "ЭкоСтрой"', 'г. Атырау, ул. Сатпаева, 15', 'active', 'Экология', 4),
  createData(11, 'АО "ЭнергоСбыт"', 'г. Павлодар, ул. Ломова, 45', 'active', 'Энергетика', 5),
  createData(12, 'ТОО "ТрансСервис"', 'г. Уральск, ул. Сарайшык, 38', 'inactive', 'Транспорт', 3),
];

const OrganizationTable: React.FC = () => {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [selected, setSelected] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredRows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (_event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filteredRows = rows.filter(row => 
    row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Avoid a layout jump when reaching the last page with empty rows
  const emptyRows = page > 0 
    ? Math.max(0, (1 + page) * rowsPerPage - filteredRows.length) 
    : 0;

  const getStatusChip = (status: string) => {
    const statusProps: { label: string; color: "success" | "error" | "warning" | "default" } = 
      status === 'active' 
        ? { label: 'Активен', color: 'success' } 
        : status === 'inactive' 
          ? { label: 'Неактивен', color: 'error' } 
          : { label: 'В ожидании', color: 'warning' };

    return <Chip size="small" {...statusProps} />;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" component="div" sx={{ mb: 2 }}>
            Организации
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Поиск по названию, адресу или типу"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        </Box>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            size="medium"
            aria-label="таблица организаций"
          >
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < filteredRows.length}
                    checked={filteredRows.length > 0 && selected.length === filteredRows.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Адрес</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell align="center">Контакты</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  const isItemSelected = isSelected(row.id);

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={isItemSelected} />
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {row.name}
                      </TableCell>
                      <TableCell>{row.address}</TableCell>
                      <TableCell>{getStatusChip(row.status)}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell align="center">{row.contacts}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Просмотр">
                          <IconButton size="small">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Редактировать">
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton size="small">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        />
      </Paper>
    </Box>
  );
};

export default OrganizationTable; 