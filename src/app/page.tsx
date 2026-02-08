"use client";

import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import TablePagination from '@mui/material/TablePagination';
import { darkTheme } from './theme';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddEntryModal from '../components/AddEntryModal';
import AdminModeToggle from '../components/AdminModeToggle';

// Define the data structure
interface DictionaryEntry {
  id: number;
  word: string;
  meaning: string;
  pronunciation: string;
  date: string;
}

type Order = 'asc' | 'desc';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof DictionaryEntry;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'word',
    numeric: false,
    disablePadding: false,
    label: 'Word',
  },
  {
    id: 'meaning',
    numeric: false,
    disablePadding: false,
    label: 'Meaning',
  },
  {
    id: 'pronunciation',
    numeric: false,
    disablePadding: false,
    label: 'Pronunciation',
  },
  {
    id: 'date',
    numeric: false,
    disablePadding: false,
    label: 'Date Added',
  },
];

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof DictionaryEntry) => void;
  order: Order;
  orderBy: string;
  isAdmin: boolean;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort, isAdmin } = props;
  const createSortHandler =
    (property: keyof DictionaryEntry) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ fontWeight: 'bold' }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        {isAdmin && (
          <>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Edit</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Delete</TableCell>
          </>
        )}
      </TableRow>
    </TableHead>
  );
}

export default function DictionaryTable() {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof DictionaryEntry>('word');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [open, setOpen] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

  const [rows, setRows] = React.useState<DictionaryEntry[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/project/1');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        // The API returns the data in the 'pjson' field
        if (jsonData && Array.isArray(jsonData.pjson)) {
          setRows(jsonData.pjson);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleAdminToggle = (status: boolean) => {
    setIsAdmin(status);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof DictionaryEntry,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRows = React.useMemo(() => {
    return rows.filter((row) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        row.word.toLowerCase().includes(searchLower) ||
        row.meaning.toLowerCase().includes(searchLower) ||
        row.pronunciation.toLowerCase().includes(searchLower) ||
        row.date.toLowerCase().includes(searchLower)
      );
    });
  }, [rows, searchTerm]);

  const sortedRows = React.useMemo(() => {
    return [...filteredRows].sort(getComparator(order, orderBy));
  }, [filteredRows, order, orderBy]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ width: '100%', minHeight: '100vh', py: 4, display: 'flex', justifyContent: 'center' }}>
        <Container maxWidth="lg">
          <Box mb={4} textAlign="center">
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Inside Dictionary
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Explore words, meanings, and pronunciations.
            </Typography>
          </Box>


          <Box sx={{ ml: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <AdminModeToggle isAdmin={isAdmin} onToggle={handleAdminToggle} />
          </Box>

          <Paper sx={{ width: '100%', mb: 2, p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Search Dictionary"
                placeholder="Search by word, meaning, etc..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {isAdmin && (
                <Tooltip title="Add New Entry">
                  <IconButton
                    onClick={handleClickOpen}
                    color="primary"
                    aria-label="add"
                    size="large"
                    sx={{ ml: 2, border: '1px solid', borderColor: 'divider' }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <TableContainer>
              <Table
                sx={{ minWidth: 750 }}
                aria-labelledby="tableTitle"
                size={'medium'}
              >
                <EnhancedTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                  isAdmin={isAdmin}
                />
                <TableBody>
                  {sortedRows.length > 0 ? (
                    sortedRows
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => {
                        return (
                          <TableRow
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            key={row.id}
                          >
                            <TableCell component="th" scope="row" sx={{ fontWeight: 'medium', fontSize: '1.1rem' }}>
                              {row.word}
                            </TableCell>
                            <TableCell>{row.meaning}</TableCell>
                            <TableCell sx={{ fontStyle: 'italic', color: 'text.secondary' }}>{row.pronunciation}</TableCell>
                            <TableCell>{row.date}</TableCell>
                            {isAdmin && (
                              <>
                                <TableCell align="center">
                                  <IconButton aria-label="edit">
                                    <EditIcon />
                                  </IconButton>
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton aria-label="delete">
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        );
                      })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 6 : 4} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1">No entries found for "{searchTerm}"</Typography>
                      </TableCell>
                    </TableRow>
                  )
                  }
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={sortedRows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
            <AddEntryModal open={open} handleClose={handleClose} />
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
