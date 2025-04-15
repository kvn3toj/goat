// MundoContentPage.tsx

import React, { useState } from 'react';
import { Container, CircularProgress, Alert, Box, Typography, Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';
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
import { useUpdateFolderNameMutation } from '../hooks/useUpdateFolderNameMutation';
import { useParams, Navigate } from 'react-router-dom';
import { EditPlaylistDialog } from '../components/playlists/EditPlaylistDialog';
import { useUpdatePlaylistMutation } from '../hooks/useUpdatePlaylistMutation';
import type { Playlist } from '../types/playlist.types';
import { ViewList, ViewModule } from '@mui/icons-material';

export const MundoContentPage: React.FC = () => {
  // Obtener el mundoId de los parámetros de la URL
  const { mundoId } = useParams<{ mundoId: string }>();
  
  // Verificar que existe el mundoId
  if (!mundoId) {
    return <Navigate to="/mundos" />;
  }
  
  // Estados para diálogos
  const [isCreatePlaylistDialogOpen, setIsCreatePlaylistDialogOpen] = useState(false);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [deletingPlaylistId, setDeletingPlaylistId] = useState<string | null>(null);
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<PlaylistFolder | null>(null);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // User info
  const { user } = useAuth();
  
  // Query hooks
  const { data: playlists = [], isLoading: isLoadingPlaylists, error: errorPlaylists } = usePlaylistsQuery();
  const { data: folders = [], isLoading: isLoadingFolders, error: errorFolders } = useFoldersQuery(mundoId);

  // Debug logs
  console.log('[MundoContentPage] Renderizando. Estado:', {
    mundoId,
    isLoadingFolders,
    isLoadingPlaylists,
    foldersCount: folders?.length,
    playlistsCount: playlists?.length,
    errorFolders: errorFolders?.message,
    errorPlaylists: errorPlaylists?.message
  });

  // Mutaciones Playlists
  const { mutate: createPlaylistMutate, isPending: isCreatingPlaylist } = useCreatePlaylistMutation();
  const { mutate: updatePlaylistStatusMutate } = useUpdatePlaylistStatusMutation();
  const { mutate: deletePlaylistMutate, isPending: isDeletingPlaylist } = useDeletePlaylistMutation();

  // Mutaciones Carpetas
  const { mutate: createFolderMutate, isPending: isCreatingFolder } = useCreateFolderMutation(mundoId);
  const { mutate: updatePinMutate } = useUpdateFolderPinMutation(mundoId);
  const { mutate: deleteFolderMutate, isPending: isDeletingFolder } = useDeleteFolderMutation(mundoId);
  const { mutate: updateFolderNameMutate, isPending: isUpdatingName } = useUpdateFolderNameMutation(mundoId);

  // Mutaciones Playlists
  const { mutate: updatePlaylistMutate, isPending: isUpdatingPlaylist } = useUpdatePlaylistMutation(mundoId);

  // Manejadores Creación Playlist
  const handleOpenCreatePlaylistDialog = () => setIsCreatePlaylistDialogOpen(true);
  const handleCloseCreatePlaylistDialog = () => setIsCreatePlaylistDialogOpen(false);
  const handleCreatePlaylistSubmit = (name: string) => {
    const userId = user?.id;
    if (!userId) {
      toast.error("Error: ID de usuario no encontrado.");
      return;
    }
    
    const playlistData = { name, mundo_id: mundoId };
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
    
    const folderData = { name, mundo_id: mundoId };
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

  // Manejador Edición Playlist
  const handleEditPlaylistClick = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
  };

  const handleCloseEditPlaylistDialog = () => setEditingPlaylist(null);
  
  const handleEditPlaylistSubmit = (data: Pick<Playlist, 'name' | 'description' | 'is_active' | 'order_index'>) => {
    if (editingPlaylist) {
      updatePlaylistMutate(
        { id: editingPlaylist.id, data },
        { onSuccess: handleCloseEditPlaylistDialog }
      );
    }
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
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            Contenido del Mundo
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(event, newViewMode) => { if (newViewMode) setViewMode(newViewMode); }}
            aria-label="Vista"
            size="small"
          >
            <ToggleButton value="list" aria-label="Vista de lista">
              <ViewList />
            </ToggleButton>
            <ToggleButton value="grid" aria-label="Vista de cuadrícula">
              <ViewModule />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Sección de Carpetas */}
        <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
          Carpetas
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CreateFolderCard onClick={handleOpenCreateFolderDialog} />
          </Grid>
          {folders.map((folder) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={folder.id}>
              <FolderCard
                folder={folder}
                onPinToggle={handleToggleFolderPin}
                onDelete={handleDeleteFolderClick}
                onEdit={handleEditFolderClick}
              />
            </Grid>
          ))}
        </Grid>

        {/* Sección de Playlists */}
        <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
          Playlists
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CreatePlaylistCard onClick={handleOpenCreatePlaylistDialog} />
          </Grid>
          {playlists.map((playlist) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={playlist.id}>
              <PlaylistCard
                playlist={playlist}
                onToggleActive={handleTogglePlaylistActive}
                onDelete={handleDeletePlaylistClick}
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

      <EditPlaylistDialog
        open={!!editingPlaylist}
        onClose={handleCloseEditPlaylistDialog}
        onSubmit={handleEditPlaylistSubmit}
        isLoading={isUpdatingPlaylist}
        initialData={editingPlaylist ?? undefined}
      />
    </Container>
  );
};
