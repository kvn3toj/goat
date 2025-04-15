import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { usePlaylist } from '@/hooks/usePlaylist';
import { usePlaylistItemsQuery } from '@/hooks/usePlaylistItemsQuery';
import { useCreatePlaylistItemMutation } from '@/hooks/useCreatePlaylistItemMutation';
import { AddVideoDialog } from '@/components/playlists/AddVideoDialog';
import { PlaylistItemCard } from '@/components/playlists/PlaylistItemCard';
import { useAuthStore } from '@/store/authStore';

export const PlaylistDetailPage: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const { data: playlist, isLoading: isLoadingPlaylist, error: playlistError } = usePlaylist(playlistId || '');
  const { data: playlistItems = [], isLoading: isLoadingItems } = usePlaylistItemsQuery(playlistId);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [isAddVideoDialogOpen, setIsAddVideoDialogOpen] = useState(false);
  const { mutate: createPlaylistItem, isPending: isCreatingItem } = useCreatePlaylistItemMutation();
  const { session } = useAuthStore();

  if (!playlistId) {
    return (
      <Container>
        <Alert severity="error">No se encontró el ID de la playlist</Alert>
      </Container>
    );
  }

  if (isLoadingPlaylist || isLoadingItems) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (playlistError || !playlist) {
    return (
      <Container>
        <Alert severity="error">
          Error al cargar la playlist: {playlistError?.message || 'Playlist no encontrada'}
        </Alert>
      </Container>
    );
  }

  const handleAddVideo = (embedUrl: string) => {
    if (!session?.user?.id) {
      console.error('No user ID found');
      return;
    }

    createPlaylistItem({
      playlist_id: playlistId,
      content: embedUrl,
      created_by: session.user.id
    });
    setIsAddVideoDialogOpen(false);
  };

  return (
    <Container maxWidth="lg">
      <Box py={3}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={4}>
          <IconButton 
            onClick={() => navigate('/playlists')}
            sx={{ mr: 2 }}
            aria-label="volver"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {playlist.name}
          </Typography>
        </Box>

        {/* Actions Bar */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={4}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsAddVideoDialogOpen(true)}
          >
            Añadir nuevo video
          </Button>

          <Box>
            <IconButton 
              onClick={() => setViewMode('list')}
              color={viewMode === 'list' ? 'primary' : 'default'}
            >
              <ViewListIcon />
            </IconButton>
            <IconButton 
              onClick={() => setViewMode('grid')}
              color={viewMode === 'grid' ? 'primary' : 'default'}
            >
              <ViewModuleIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Box>
          {playlistItems.length === 0 ? (
            <Typography color="text.secondary" align="center">
              No hay videos en esta playlist. Haz clic en "Añadir nuevo video" para comenzar.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {playlistItems.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <PlaylistItemCard
                    item={item}
                    playlistId={playlistId}
                    isFirst={index === 0}
                    isLast={index === playlistItems.length - 1}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      <AddVideoDialog
        open={isAddVideoDialogOpen}
        onClose={() => setIsAddVideoDialogOpen(false)}
        onAddVideo={handleAddVideo}
        isLoading={isCreatingItem}
      />
    </Container>
  );
}; 