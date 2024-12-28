import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  Button,
  Link,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { SERVIDOR_MAIN } from '../../tools/config';

// Cabeçalhos da tabela
const headCells = [
  { id: 'codigo', numeric: false, label: 'Código' },
  { id: 'descricao', numeric: false, label: 'Descrição' },
  { id: 'zona', numeric: false, label: 'Zona' },
];

// Função para o cabeçalho da tabela (ordenação)
function EnhancedTableHead({ order, orderBy, onRequestSort }) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell key={headCell.id} align={headCell.numeric ? 'right' : 'left'}>
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// Barra de ferramentas com o botão de criação
function EnhancedTableToolbar({ numSelected, onCreateNew }) {
  return (
    <Toolbar
      sx={{
        bgcolor: numSelected > 0
          ? (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity)
          : 'transparent',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 16px',
      }}
    >
      <Typography variant="h6" sx={{ flex: 1 }}>
        {numSelected > 0 ? `${numSelected} selecionados` : 'Planejamentos'}
      </Typography>
      <Button
        variant="contained"
        style={{ backgroundColor: '#A9007A' }}
        href="/planejamento/cadastrar/0"
      >
        Criar Novo Planejamento
      </Button>
    </Toolbar>
  );
}

// Função principal do componente Planejamento
export default function Planejamento() {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('codigo');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    // Faz a requisição para a API ao carregar o componente
    fetch(SERVIDOR_MAIN+'/api/planejamento-list') 
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao buscar os dados');
        }
        return response.json();
      })
      .then((data) => {
        setRows(data);
      })
      .catch((error) => {
        console.error('Erro:', error);
      });
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const visibleRows = React.useMemo(
    () =>
      rows
        .slice()
        .sort((a, b) => {
          if (order === 'desc') {
            return b[orderBy] < a[orderBy] ? -1 : 1;
          }
          return a[orderBy] < b[orderBy] ? -1 : 1;
        })
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, order, orderBy, page, rowsPerPage]
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Planejamento</h1>
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <EnhancedTableToolbar numSelected={selected.length} />

          <TableContainer>
            <Table sx={{ minWidth: 750 }} size="medium">
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
              />
              <TableBody>
                {visibleRows.map((row) => (
                  <TableRow key={row.codigo}>
                    <TableCell align="left" component="th" scope="row">
                      <Link href={"/planejamento/cadastrar/"+row.codigo} >
                        {row.codigo}
                      </Link>
                    </TableCell>
                    <TableCell align="left">{row.descricao}</TableCell>
                    <TableCell align="left">{row.zona}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '90vw',
    margin: '0 auto',
    padding: '20px',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '30px',
    color: '#333',
  },
};
