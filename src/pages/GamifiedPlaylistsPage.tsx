import React, { useState, useEffect } from 'react';
import { Container, CircularProgress, Alert, Box, Typography } from '@mui/material';
import { PlaylistCard } from '../components/playlists/PlaylistCard';
import { CreatePlaylistCard } from '../components/playlists/CreatePlaylistCard';
import { CreatePlaylistDialog } from '../components/playlists/CreatePlaylistDialog';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FolderCard } from '../components/folders/FolderCard';
import { CreateFolderCard } from '../components/folders/CreateFolderCard';
import { CreateFolderDialog } from '../components/folders/CreateFolderDialog';
import { EditFolderNameDialog } from '../components/folders/EditFolderNameDialog';
import { usePlaylistsQuery } from '../hooks/usePlaylistsQuery';
import { useFoldersQuery } from '../hooks/useFoldersQuery';
import { useCreatePlaylistMutation } from '../hooks/useCreatePlaylistMutation';
import { useUpdatePlaylistStatusMutation } from '../hooks/useUpdatePlaylistStatusMutation';
import { useDeletePlaylistMutation } from '../hooks/useDeletePlaylistMutation';
import { useCreateFolderMutation } from '../hooks/useCreateFolderMutation';
import { useUpdateFolderPinMutation } from '../hooks/useUpdateFolderPinMutation';
import { useDeleteFolderMutation } from '../hooks/useDeleteFolderMutation';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import type { PlaylistFolder } from '../types/folder.types';
import { currentMundoId } from '../constants';
import { useUpdateFolderNameMutation } from '../hooks/useUpdateFolderNameMutation';

export const GamifiedPlaylistsPage: React.FC = () => {
  // Estados para diálogos
  const [isCreatePlaylistDialogOpen, setIsCreatePlaylistDialogOpen] = useState(false);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [deletingPlaylistId, setDeletingPlaylistId] = useState<string | null>(null);
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<PlaylistFolder | null>(null);
  
  // User info
  const { user } = useAuth();
  
  // Query hooks
  const { data: playlists = [], isLoading: isLoadingPlaylists, error: errorPlaylists } = usePlaylistsQuery();
  const { data: folders = [], isLoading: isLoadingFolders, error: errorFolders } = useFoldersQuery(currentMundoId);

  // Mutaciones Playlists
  const { mutate: createPlaylistMutate, isPending: isCreatingPlaylist } = useCreatePlaylistMutation();
  const { mutate: updatePlaylistStatusMutate } = useUpdatePlaylistStatusMutation();
  const { mutate: deletePlaylistMutate, isPending: isDeletingPlaylist } = useDeletePlaylistMutation();

  // Mutaciones Carpetas
  const { mutate: createFolderMutate, isPending: isCreatingFolder } = useCreateFolderMutation(currentMundoId);
  const { mutate: updatePinMutate } = useUpdateFolderPinMutation(currentMundoId);
  const { mutate: deleteFolderMutate, isPending: isDeletingFolder } = useDeleteFolderMutation(currentMundoId);
  const { mutate: updateFolderNameMutate, isPending: isUpdatingName } = useUpdateFolderNameMutation(currentMundoId);

  // Manejadores Creación Playlist
  const handleOpenCreatePlaylistDialog = () => setIsCreatePlaylistDialogOpen(true);
  const handleCloseCreatePlaylistDialog = () => setIsCreatePlaylistDialogOpen(false);
  const handleCreatePlaylistSubmit = (name: string) => {
    const userId = user?.id;
    if (!userId) {
      toast.error("Error: ID de usuario no encontrado.");
      return;
    }
    
    const playlistData = { name, mundo_id: currentMundoId };
    createPlaylistMutate({ data: playlistData, userId }, {
      onSuccess: handleCloseCreatePlaylistDialog
    });
  };

  // Manejadores Creación Carpeta
  const handleOpenCreateFolderDialog = () => setIsCreateFolderDialogOpen(true);
  const handleCloseCreateFolderDialog = () => setIsCreateFolderDialogOpen(false);
  const handleCreateFolderSubmit = (name: string) => {
    const userId = user?.id;
    if (!userId) {
      toast.error("Error: ID de usuario no encontrado.");
      return;
    }
    
    const folderData = { name, mundo_id: currentMundoId };
    createFolderMutate({ data: folderData, userId }, {
      onSuccess: handleCloseCreateFolderDialog
    });
  };

  // Manejadores Eliminación Playlist
  const handleDeletePlaylistClick = (playlistId: string) => setDeletingPlaylistId(playlistId);
  const handleDeletePlaylistDialogClose = () => setDeletingPlaylistId(null);
  const handleDeletePlaylistConfirm = () => {
    if (!deletingPlaylistId) return;
    deletePlaylistMutate(deletingPlaylistId, { onSuccess: handleDeletePlaylistDialogClose });
  };

  // Manejadores Eliminación Carpeta
  const handleDeleteFolderClick = (folderId: string) => setDeletingFolderId(folderId);
  const handleDeleteFolderDialogClose = () => setDeletingFolderId(null);
  const handleDeleteFolderConfirm = () => {
    if (!deletingFolderId) return;
    deleteFolderMutate(deletingFolderId, { onSuccess: handleDeleteFolderDialogClose });
  };

  // Manejadores Toggle Estado Playlist
  const handleTogglePlaylistActive = (id: string, isActive: boolean) => {
    updatePlaylistStatusMutate({ id, isActive });
  };

  // Manejadores Toggle Pin Carpeta
  const handleToggleFolderPin = (id: string, isPinned: boolean) => {
    updatePinMutate({ folderId: id, isPinned });
  };

  // Manejador Edición Carpeta
  const handleEditFolderClick = (folder: PlaylistFolder) => {
    setEditingFolder(folder);
  };

  const handleCloseEditFolderDialog = () => setEditingFolder(null);
  
  const handleEditFolderSubmit = (newName: string) => {
    if (!editingFolder) return;
    updateFolderNameMutate(
      { id: editingFolder.id, name: newName },
      { onSuccess: handleCloseEditFolderDialog }
    );
  };

  // --- Renderizado ---
  const isLoading = isLoadingPlaylists || isLoadingFolders;
  const error = errorPlaylists || errorFolders;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Error al cargar datos: { (error as Error)?.message ?? 'Error desconocido'}</Alert>
      </Container>
    );
  }

  const pinnedFolders = folders.filter(f => f.is_pinned && !f.is_deleted);
  const regularFolders = folders.filter(f => !f.is_pinned && !f.is_deleted);
  const activePlaylists = playlists; // Asumimos que fetchPlaylists ya filtra por activas si es necesario

  const folderToDelete = folders.find(f => f.id === deletingFolderId);
  const playlistToDelete = playlists.find(p => p.id === deletingPlaylistId);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* --- Sección Fijados --- */}
      {pinnedFolders.length > 0 && (
        <>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
            Fijado
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3, mb: 4 }}>
            {pinnedFolders.map((folder) => (
              <Box key={folder.id} sx={{ gridColumn: {xs: 'span 12', sm: 'span 6', md: 'span 4', lg: 'span 3'} }}>
                <FolderCard
                  folder={folder}
                  onPinToggle={handleToggleFolderPin}
                  onDelete={handleDeleteFolderClick}
                  onEdit={handleEditFolderClick}
                />
              </Box>
            ))}
          </Box>
        </>
      )}

      {/* --- Sección Carpetas --- */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
        Carpetas
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3, mb: 4 }}>
        <Box sx={{ gridColumn: {xs: 'span 12', sm: 'span 6', md: 'span 4', lg: 'span 3'} }}>
          <CreateFolderCard onClick={handleOpenCreateFolderDialog} />
        </Box>
        {regularFolders.map((folder) => (
          <Box key={folder.id} sx={{ gridColumn: {xs: 'span 12', sm: 'span 6', md: 'span 4', lg: 'span 3'} }}>
            <FolderCard
              folder={folder}
              onPinToggle={handleToggleFolderPin}
              onDelete={handleDeleteFolderClick}
              onEdit={handleEditFolderClick}
            />
          </Box>
        ))}
      </Box>

      {/* --- Sección Playlists --- */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
        Playlists
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
        <Box sx={{ gridColumn: {xs: 'span 12', sm: 'span 6', md: 'span 4', lg: 'span 3'} }}>
          <CreatePlaylistCard onClick={handleOpenCreatePlaylistDialog} />
        </Box>
        {activePlaylists.map((playlist) => (
          <Box key={playlist.id} sx={{ gridColumn: {xs: 'span 12', sm: 'span 6', md: 'span 4', lg: 'span 3'} }}>
            <PlaylistCard
              playlist={playlist}
              onToggleActive={handleTogglePlaylistActive}
              onDelete={handleDeletePlaylistClick}
              onEdit={() => console.log("Editar playlist pendiente:", playlist.id)}
            />
          </Box>
        ))}
      </Box>

      {/* --- Diálogos --- */}
      <CreatePlaylistDialog
        open={isCreatePlaylistDialogOpen}
        onClose={handleCloseCreatePlaylistDialog}
        onSubmit={handleCreatePlaylistSubmit}
        isLoading={isCreatingPlaylist}
      />

      <CreateFolderDialog
        open={isCreateFolderDialogOpen}
        onClose={handleCloseCreateFolderDialog}
        onSubmit={handleCreateFolderSubmit}
        isLoading={isCreatingFolder}
      />

      <EditFolderNameDialog
        open={Boolean(editingFolder)}
        onClose={handleCloseEditFolderDialog}
        onSubmit={handleEditFolderSubmit}
        isLoading={isUpdatingName}
        initialName={editingFolder?.name ?? ''}
      />

      <ConfirmDialog
        open={!!deletingPlaylistId}
        title="Eliminar Playlist"
        message={`¿Estás seguro de que deseas eliminar la playlist "${playlistToDelete?.name ?? ''}"?`}
        onConfirm={handleDeletePlaylistConfirm}
        onClose={handleDeletePlaylistDialogClose}
        isLoading={isDeletingPlaylist}
      />

      <ConfirmDialog
        open={!!deletingFolderId}
        title="Eliminar Carpeta"
        message={`¿Deseas eliminar este elemento? Se moverá '${folderToDelete?.name ?? ''}' a la papelera y se eliminará definitivamente en 30 días.`}
        onConfirm={handleDeleteFolderConfirm}
        onClose={handleDeleteFolderDialogClose}
        isLoading={isDeletingFolder}
      />
    </Container>
  );
}; 