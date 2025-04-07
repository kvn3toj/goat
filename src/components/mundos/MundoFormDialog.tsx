import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Box
} from '@mui/material';
import type { Mundo } from '../../types/mundo.types';

type MundoFormData = Pick<Mundo, 'name' | 'description' | 'is_active'>;

interface MundoFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: MundoFormData) => void;
  isLoading: boolean;
  initialData?: Mundo;
}

const DEFAULT_FORM_DATA: MundoFormData = {
  name: '',
  description: '',
  is_active: true,
};

export const MundoFormDialog = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: MundoFormDialogProps) => {
  const [formData, setFormData] = useState<MundoFormData>(DEFAULT_FORM_DATA);

  useEffect(() => {
    if (open) {
      setFormData(initialData ?? DEFAULT_FORM_DATA);
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData ? 'Editar Mundo' : 'Crear Nuevo Mundo'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              autoFocus
              name="name"
              label="Nombre del Mundo"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="description"
              label="Descripción"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              required
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
              }
              label="Activo"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 