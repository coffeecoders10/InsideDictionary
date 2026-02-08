
import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';

interface AddEntryModalProps {
    open: boolean;
    handleClose: () => void;
}

export default function AddEntryModal({ open, handleClose }: AddEntryModalProps) {
    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Entry</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    To add a new word to the dictionary, please fill in all the requisite information below.
                </DialogContentText>
                <Box
                    component="form"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <TextField
                        autoFocus
                        margin="dense"
                        id="word"
                        label="Word"
                        type="text"
                        fullWidth
                        variant="outlined"
                        required
                    />
                    <TextField
                        margin="dense"
                        id="meaning"
                        label="Meaning"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={3}
                        required
                    />
                    <TextField
                        margin="dense"
                        id="pronunciation"
                        label="Pronunciation"
                        type="text"
                        fullWidth
                        variant="outlined"
                        placeholder="/.../"
                        required
                    />
                    <TextField
                        margin="dense"
                        id="date"
                        label="Date Added"
                        type="date"
                        fullWidth
                        variant="outlined"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        required
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="inherit">Cancel</Button>
                <Button onClick={handleClose} variant="contained" color="primary">Add</Button>
            </DialogActions>
        </Dialog>
    );
}
