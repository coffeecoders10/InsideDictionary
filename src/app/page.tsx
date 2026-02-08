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
import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Image from 'next/image';
import AddEntryModal, { DictionaryEntry } from '../components/AddEntryModal';
import AdminModeToggle from '../components/AdminModeToggle';

type Order = 'asc' | 'desc';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  let aValue = a[orderBy];
  let bValue = b[orderBy];

  // Handle arrays (like examples) by taking the first element
  if (Array.isArray(aValue)) aValue = aValue[0];
  if (Array.isArray(bValue)) bValue = bValue[0];

  // Handle null/undefined
  if (bValue === undefined || bValue === null) {
    if (aValue === undefined || aValue === null) return 0;
    return -1;
  }
  if (aValue === undefined || aValue === null) return 1;

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: any },
  b: { [key in Key]: any },
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
    id: 'origin',
    numeric: false,
    disablePadding: false,
    label: 'Origin',
  },
  {
    id: 'examples',
    numeric: false,
    disablePadding: false,
    label: 'Example',
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
  const [editingEntry, setEditingEntry] = React.useState<DictionaryEntry | null>(null);

  const [rows, setRows] = React.useState<DictionaryEntry[]>([]);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');

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
          const normalizedData = jsonData.pjson.map((entry: any) => ({
            ...entry,
            origin: entry.origin || "",
            // Ensure examples is an array. If it's missing, default to [""].
            // If it exists but is not an array (legacy single string?), wrap it.
            examples: Array.isArray(entry.examples)
              ? entry.examples
              : (entry.example ? [entry.example] : [""]),
          }));
          setRows(normalizedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    fetchData();
  }, []);

  const handleSaveData = async () => {
    try {
      const response = await fetch('/api/project/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pjson: rows }),
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      setSnackbarMessage('Data saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving data:', error);
      setSnackbarMessage('Error saving data. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleAdminToggle = (status: boolean) => {
    setIsAdmin(status);
  };

  const handleClickOpen = () => {
    setEditingEntry(null);
    setOpen(true);
  };

  const handleEditClick = (entry: DictionaryEntry) => {
    setEditingEntry(entry);
    setOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setRows((prevRows) => prevRows.filter((row) => row.id !== id));
    }
  };

  const handleSaveEntry = (entry: DictionaryEntry | Omit<DictionaryEntry, 'id'>) => {
    if ('id' in entry) {
      // Edit
      setRows((prevRows) => prevRows.map((row) => (row.id === (entry as DictionaryEntry).id ? (entry as DictionaryEntry) : row)));
    } else {
      // Add
      const newId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
      setRows((prevRows) => [...prevRows, { ...entry, id: newId } as DictionaryEntry]);
    }
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
        row.date.toLowerCase().includes(searchLower) ||
        (row.origin || '').toLowerCase().includes(searchLower) ||
        (row.examples && row.examples[0] ? row.examples[0].toLowerCase().includes(searchLower) : false)
      );
    });
  }, [rows, searchTerm]);

  const sortedRows = React.useMemo(() => {
    return [...filteredRows].sort(getComparator(order, orderBy));
  }, [filteredRows, order, orderBy]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ width: '100%', minHeight: '100vh', py: 4, display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
          <Image src="/coffeecoders_logo.png" alt="Inside Dictionary Logo" width={60} height={60} style={{ objectFit: 'contain' }} />
        </Box>
        <Container maxWidth="lg">
          <Box mb={4} textAlign="center">
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Inside Words
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              A dictionary of all the inside words of the coffee coders.
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
                <>
                  <Tooltip title="Save Changes">
                    <IconButton
                      onClick={handleSaveData}
                      color="primary"
                      aria-label="save"
                      size="large"
                      sx={{ ml: 2, border: '1px solid', borderColor: 'divider' }}
                    >
                      <SaveIcon />
                    </IconButton>
                  </Tooltip>
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
                </>
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
                            <TableCell>{row.origin || '-'}</TableCell>
                            <TableCell>{row.examples && row.examples.length > 0 ? row.examples[0] : '-'}</TableCell>
                            <TableCell>{row.date}</TableCell>
                            {isAdmin && (
                              <>
                                <TableCell align="center">
                                  <IconButton aria-label="edit" onClick={() => handleEditClick(row)}>
                                    <EditIcon />
                                  </IconButton>
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton aria-label="delete" onClick={() => handleDeleteClick(row.id)}>
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
            <AddEntryModal
              open={open}
              handleClose={handleClose}
              onSave={handleSaveEntry}
              initialData={editingEntry}
            />
          </Paper>
          <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
            <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
