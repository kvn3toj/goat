import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { PlaylistCard } from '../components/playlists/PlaylistCard';
import { CreatePlaylistCard } from '../components/playlists/CreatePlaylistCard';
import { CreatePlaylistDialog } from '../components/playlists/CreatePlaylistDialog';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { usePlaylistsQuery } from '../hooks/usePlaylistsQuery';
import { useCreatePlaylistMutation } from '../hooks/useCreatePlaylistMutation';
import { useUpdatePlaylistStatusMutation } from '../hooks/useUpdatePlaylistStatusMutation';
import { useDeletePlaylistMutation } from '../hooks/useDeletePlaylistMutation';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { currentMundoId } from '../constants';
import { useUpdatePlaylistMutation } from '../hooks/useUpdatePlaylistMutation';
import { EditPlaylistDialog } from '../components/playlists/EditPlaylistDialog';

export const GamifiedPlaylistsPage = () => {
  // Estados para diálogos
  const [isCreatePlaylistDialogOpen, setIsCreatePlaylistDialogOpen] = useState(false);
  const [deletingPlaylistId, setDeletingPlaylistId] = useState<string | null>(null);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

  // User info
  const { user } = useAuth();

  // Queries
  const {
    data: playlists = [],
    isLoading,
    error,
  } = usePlaylistsQuery();

  // Mutations
  const { mutate: createPlaylistMutate, isPending: isCreatingPlaylist } = useCreatePlaylistMutation();
  const { mutate: updatePlaylistStatusMutate } = useUpdatePlaylistStatusMutation();
  const { mutate: deletePlaylistMutate, isPending: isDeletingPlaylist } = useDeletePlaylistMutation();
  const { mutate: updatePlaylistMutate, isPending: isUpdatingPlaylist } = useUpdatePlaylistMutation(currentMundoId);

  // Handlers
  const handleOpenCreatePlaylistDialog = () => setIsCreatePlaylistDialogOpen(true);
  const handleCloseCreatePlaylistDialog = () => setIsCreatePlaylistDialogOpen(false);
  
  const handleEditPlaylistClick = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
  };

  const handleCloseEditPlaylistDialog = () => setEditingPlaylist(null);
  
  const handleEditPlaylistSubmit = (data: Pick<Playlist, 'name' | 'description' | 'is_active' | 'order_index'>) => {
    if (editingPlaylist) {
      updatePlaylistMutate(
        { id: editingPlaylist.id, data },
        { 
          onSuccess: () => {
            handleCloseEditPlaylistDialog();
            toast.success('Playlist actualizada exitosamente');
          },
          onError: (error) => {
            toast.error('Error al actualizar la playlist: ' + error.message);
          }
        }
      );
    }
  };

  const handleCreatePlaylistSubmit = (name: string) => {
    const userId = user?.id;
    if (!userId) {
      toast.error("Error: ID de usuario no encontrado.");
      return;
    }

    const playlistData = { name, mundo_id: currentMundoId };
    createPlaylistMutate(
      { data: playlistData, userId },
      {
        onSuccess: () => {
          handleCloseCreatePlaylistDialog();
          toast.success('Playlist creada exitosamente');
        },
        onError: (error) => {
          toast.error('Error al crear la playlist: ' + error.message);
        },
      }
    );
  };

  const handleToggleActive = (playlistId: string, isActive: boolean) => {
    updatePlaylistStatusMutate(
      { id: playlistId, isActive },
      {
        onSuccess: () => {
          toast.success(`Playlist ${isActive ? 'activada' : 'desactivada'} exitosamente`);
        },
        onError: (error) => {
          toast.error('Error al actualizar el estado: ' + error.message);
        },
      }
    );
  };

  const handleDeleteClick = (playlistId: string) => {
    setDeletingPlaylistId(playlistId);
  };

  const handleDeleteConfirm = () => {
    if (deletingPlaylistId) {
      deletePlaylistMutate(deletingPlaylistId, {
        onSuccess: () => {
          setDeletingPlaylistId(null);
          toast.success('Playlist eliminada exitosamente');
        },
        onError: (error) => {
          toast.error('Error al eliminar la playlist: ' + error.message);
        },
      });
    }
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
        Error al cargar las playlists: {error.message}
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gamified Playlists
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid xs={12} sm={6} md={4} lg={3}>
            <CreatePlaylistCard onClick={handleOpenCreatePlaylistDialog} />
          </Grid>
          
          {playlists.map((playlist) => (
            <Grid xs={12} sm={6} md={4} lg={3} key={playlist.id}>
              <PlaylistCard
                playlist={playlist}
                onToggleActive={handleToggleActive}
                onDelete={handleDeleteClick}
                onEdit={handleEditPlaylistClick}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Dialogs */}
      <CreatePlaylistDialog
        open={isCreatePlaylistDialogOpen}
        onClose={handleCloseCreatePlaylistDialog}
        onSubmit={handleCreatePlaylistSubmit}
        isLoading={isCreatingPlaylist}
      />

      <ConfirmDialog
        open={Boolean(deletingPlaylistId)}
        onClose={() => setDeletingPlaylistId(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Playlist"
        message="¿Estás seguro de que deseas eliminar esta playlist? Esta acción no se puede deshacer."
        isLoading={isDeletingPlaylist}
      />

      <EditPlaylistDialog
        open={Boolean(editingPlaylist)}
        onClose={handleCloseEditPlaylistDialog}
        onSubmit={handleEditPlaylistSubmit}
        isLoading={isUpdatingPlaylist}
        initialData={editingPlaylist ?? undefined}
      />
    </Container>
  );
}; 