import { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
} from '@mui/material';
import { useMundosQuery } from '../hooks/useMundosQuery';
import { MundoFormDialog } from '../components/mundos/MundoFormDialog';
import { useCreateMundoMutation } from '../hooks/useCreateMundoMutation';
import { useUpdateMundoMutation } from '../hooks/useUpdateMundoMutation';
import { useDeleteMundoMutation } from '../hooks/useDeleteMundoMutation';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import type { Mundo } from '../types/mundo.types';
import { useNavigate } from 'react-router-dom';

export const MundosPage = () => {
  // Estados para diálogos
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMundo, setEditingMundo] = useState<Mundo | null>(null);
  const [deletingMundoId, setDeletingMundoId] = useState<string | null>(null);

  // Router
  const navigate = useNavigate();

  // Auth
  const { user } = useAuth();

  // Queries y mutaciones
  const { data: mundos, isLoading, error } = useMundosQuery();
  const { mutate: createMundo, isPending: isCreatePending } = useCreateMundoMutation();
  const { mutate: updateMundo, isPending: isUpdatePending } = useUpdateMundoMutation();
  const { mutate: deleteMundo, isPending: isDeletePending } = useDeleteMundoMutation();

  // Manejadores para crear
  const handleCreateDialogClose = () => setIsCreateDialogOpen(false);
  const handleCreateDialogSubmit = (formData: Pick<Mundo, 'name' | 'description' | 'is_active'>) => {
    if (!user?.id) {
      toast.error('No se pudo obtener el ID del usuario');
      return;
    }

    console.log('Intentando crear mundo con:', { data: formData, userId: user.id });
    
    createMundo({ data: formData, userId: user.id }, {
      onSuccess: () => {
        handleCreateDialogClose();
        toast.success('Mundo creado exitosamente');
      },
      onError: (error) => {
        toast.error(`Error al crear el mundo: ${error.message}`);
      }
    });
  };

  // Manejadores para editar
  const handleEditClick = (mundo: Mundo) => setEditingMundo(mundo);
  const handleEditDialogClose = () => setEditingMundo(null);
  const handleEditDialogSubmit = (formData: Pick<Mundo, 'name' | 'description' | 'is_active'>) => {
    if (editingMundo) {
      updateMundo(
        { id: editingMundo.id, data: formData },
        { onSuccess: handleEditDialogClose }
      );
    }
  };

  // Manejadores para eliminar
  const handleDeleteClick = (id: string) => setDeletingMundoId(id);
  const handleDeleteDialogClose = () => setDeletingMundoId(null);
  const handleDeleteConfirm = () => {
    if (deletingMundoId) {
      deleteMundo(deletingMundoId, { onSuccess: handleDeleteDialogClose });
    }
  };

  // Navegación al detalle del mundo
  const handleMundoClick = (mundoId: string) => {
    navigate(`/mundos/${mundoId}/contenido`);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error al cargar los mundos: {error instanceof Error ? error.message : 'Error desconocido'}
      </Alert>
    );
  }

  const mundoToDelete = mundos?.find(m => m.id === deletingMundoId);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">
          Gestión de Mundos
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Crear Mundo
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Activo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mundos?.map((mundo) => (
              <TableRow 
                key={mundo.id}
                onClick={() => handleMundoClick(mundo.id)}
                sx={{ 
                  cursor: 'pointer', 
                  '&:hover': { backgroundColor: 'action.hover' } 
                }}
              >
                <TableCell>{mundo.name}</TableCell>
                <TableCell>
                  {mundo.description
                    ? (mundo.description.length > 50
                        ? `${mundo.description.substring(0, 50)}...`
                        : mundo.description)
                    : ''}
                </TableCell>
                <TableCell>
                  <Chip
                    label={mundo.is_active ? 'Sí' : 'No'}
                    color={mundo.is_active ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    size="small" 
                    sx={{ mr: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(mundo);
                    }}
                  >
                    Editar
                  </Button>
                  <Button 
                    size="small" 
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(mundo.id);
                    }}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de Crear */}
      <MundoFormDialog
        open={isCreateDialogOpen}
        onClose={handleCreateDialogClose}
        onSubmit={handleCreateDialogSubmit}
        isLoading={isCreatePending}
      />

      {/* Diálogo de Editar */}
      <MundoFormDialog
        open={Boolean(editingMundo)}
        onClose={handleEditDialogClose}
        onSubmit={handleEditDialogSubmit}
        isLoading={isUpdatePending}
        initialData={editingMundo ?? undefined}
      />

      {/* Diálogo de Confirmación para Eliminar */}
      <ConfirmDialog
        open={Boolean(deletingMundoId)}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Eliminación"
        message={
          mundoToDelete
            ? `¿Estás seguro de que deseas eliminar el mundo "${mundoToDelete.name}"? Esta acción no se puede deshacer.`
            : 'Error: Mundo no encontrado'
        }
        isLoading={isDeletePending}
      />
    </Box>
  );
}; 