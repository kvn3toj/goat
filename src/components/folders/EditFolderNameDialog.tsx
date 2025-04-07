import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { useState, useEffect } from 'react';

interface EditFolderNameDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isLoading: boolean;
  initialName: string;
}

export const EditFolderNameDialog = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  initialName,
}: EditFolderNameDialogProps) => {
  const [name, setName] = useState(initialName);

  // Actualizar el nombre cuando cambie initialName o se abra el diálogo
  useEffect(() => {
    if (open) {
      setName(initialName);
    }
  }, [initialName, open]);

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar nombre de carpeta</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Nombre de la carpeta"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name.trim() || isLoading}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 