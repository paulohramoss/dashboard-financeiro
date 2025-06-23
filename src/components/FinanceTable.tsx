import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Typography,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DataItem } from '../types';
import { formatCurrency, parseCurrency } from '../utils/calculations';
import { globalStyles } from '../styles/globalStyles';

interface FinanceTableProps {
  data: DataItem[];
  setData: (data: DataItem[]) => void;
}

export const FinanceTable: React.FC<FinanceTableProps> = ({ data, setData }) => {
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState<DataItem>({ categoria: '', valor: 0 });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleEdit = (row: number, col: string) => {
    setEditingCell({ row, col });
    setEditValue(data[row][col as keyof DataItem].toString());
  };

  const handleEditConfirm = (row: number, col: string) => {
    const newData = [...data];
    if (col === 'valor') {
      newData[row].valor = parseCurrency(editValue);
    } else {
      newData[row].categoria = editValue;
    }
    setData(newData);
    setEditingCell(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleDelete = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
    handleMenuClose();
  };

  const handleAddNew = () => {
    if (newCategory.categoria && newCategory.valor) {
      setData([...data, newCategory]);
      setIsAddingNew(false);
      setNewCategory({ categoria: '', valor: 0 });
    }
  };

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h6" component="h3" sx={globalStyles.tableTitle}>
          Editar Dados
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="body2" sx={globalStyles.tableSubtitle}>
            Clique no ícone de edição para modificar os valores
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsAddingNew(true)}
            size="small"
          >
            Nova Categoria
          </Button>
        </Box>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={globalStyles.tableHeader}>Categoria</TableCell>
              <TableCell sx={globalStyles.tableHeader}>Valor</TableCell>
              <TableCell sx={globalStyles.tableCell}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isAddingNew && (
              <TableRow sx={globalStyles.newRow}>
                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Nova categoria"
                    value={newCategory.categoria}
                    onChange={(e) => setNewCategory({ ...newCategory, categoria: e.target.value })}
                    autoFocus
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Valor"
                    value={newCategory.valor}
                    onChange={(e) => setNewCategory({ ...newCategory, valor: parseCurrency(e.target.value) })}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={handleAddNew}
                      disabled={!newCategory.categoria || !newCategory.valor}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => {
                        setIsAddingNew(false);
                        setNewCategory({ categoria: '', valor: 0 });
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            )}
            {data.map((item, index) => (
              <TableRow 
                key={index}
                sx={globalStyles.tableRow}
              >
                <TableCell>
                  {editingCell?.row === index && editingCell?.col === 'categoria' ? (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        size="small"
                        fullWidth
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                        variant="outlined"
                      />
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditConfirm(index, 'categoria')}
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={handleEditCancel}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography>{item.categoria}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {editingCell?.row === index && editingCell?.col === 'valor' ? (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        size="small"
                        fullWidth
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                        variant="outlined"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleEditConfirm(index, 'valor');
                          }
                        }}
                      />
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditConfirm(index, 'valor')}
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={handleEditCancel}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography>{formatCurrency(item.valor)}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, index)}
                      sx={globalStyles.actionButton}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedRow !== null) {
            handleEdit(selectedRow, 'categoria');
          }
          handleMenuClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar Categoria
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedRow !== null) {
            handleEdit(selectedRow, 'valor');
          }
          handleMenuClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar Valor
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedRow !== null) {
            handleDelete(selectedRow);
          }
        }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>
    </Box>
  );
}; 