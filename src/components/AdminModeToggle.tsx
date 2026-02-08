
import * as React from 'react';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

interface AdminModeToggleProps {
    isAdmin: boolean;
    onToggle: (isAdmin: boolean) => void;
}

export default function AdminModeToggle({ isAdmin, onToggle }: AdminModeToggleProps) {
    const [open, setOpen] = React.useState(false);
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');

    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setOpen(true);
        } else {
            onToggle(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setPassword('');
        setError('');
    };

    const handleSubmit = () => {
        const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Coffee";
        if (password === validPassword) {
            onToggle(true);
            handleClose();
        } else {
            setError('Incorrect password');
        }
    };

    return (
        <>
            <FormControlLabel
                control={<Switch checked={isAdmin} onChange={handleSwitchChange} />}
                label="Admin Mode"
            />
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Enter Admin Password</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="standard"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!error}
                        helperText={error}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSubmit();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
