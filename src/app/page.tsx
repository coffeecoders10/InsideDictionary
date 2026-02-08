"use client";

import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
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

// Define the data structure
interface DictionaryEntry {
  id: number;
  word: string;
  meaning: string;
  pronunciation: string;
  date: string;
}

// Prepopulated data
const initialData: DictionaryEntry[] = [
  {
    id: 1,
    word: "Serendipity",
    meaning: "The occurrence of events by chance in a happy or beneficial way.",
    pronunciation: "/ˌserənˈdipədē/",
    date: "2023-10-26"
  },
  {
    id: 2,
    word: "Ephemeral",
    meaning: "Lasting for a very short time.",
    pronunciation: "/əˈfem(ə)rəl/",
    date: "2023-10-27"
  },
  {
    id: 3,
    word: "Luminous",
    meaning: "Full of or shedding light; bright or shining, especially in the dark.",
    pronunciation: "/ˈlo͞omənəs/",
    date: "2023-10-28"
  },
  {
    id: 4,
    word: "Mellifluous",
    meaning: "(of a voice or words) sweet or musical; pleasant to hear.",
    pronunciation: "/məˈliflo͞oəs/",
    date: "2023-10-29"
  },
  {
    id: 5,
    word: "Quixotic",
    meaning: "Exceedingly idealistic; unrealistic and impractical.",
    pronunciation: "/kwikˈsädik/",
    date: "2023-10-30"
  }
];

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

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
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
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
      </TableRow>
    </TableHead>
  );
}

export default function DictionaryTable() {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof DictionaryEntry>('word');
  const [searchTerm, setSearchTerm] = React.useState('');
  
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
  };

  const filteredRows = React.useMemo(() => {
    return initialData.filter((row) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        row.word.toLowerCase().includes(searchLower) ||
        row.meaning.toLowerCase().includes(searchLower) ||
        row.pronunciation.toLowerCase().includes(searchLower) ||
        row.date.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm]);

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

          <Paper sx={{ width: '100%', mb: 2, p: 2, borderRadius: 2, boxShadow: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search Dictionary"
              placeholder="Search by word, meaning, etc..."
              value={searchTerm}
              onChange={handleSearch}
              sx={{ mb: 2 }}
            />
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
                />
                <TableBody>
                  {sortedRows.length > 0 ? (
                    sortedRows.map((row) => {
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
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1">No entries found for "{searchTerm}"</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
