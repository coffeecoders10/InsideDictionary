'use client';

import { createTheme } from '@mui/material/styles';

// Create a dark theme
export const darkTheme = createTheme({
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
