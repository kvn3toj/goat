import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Switch,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Playlist } from '../../types/playlist';

interface PlaylistCardProps {
  playlist: Playlist;
  onToggleActive: (playlistId: string, isActive: boolean) => void;
  onDelete: (playlistId: string) => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  onToggleActive,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete(playlist.id);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {playlist.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {playlist.is_active ? 'Activa' : 'Inactiva'}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Switch
          checked={playlist.is_active}
          onChange={(e) => onToggleActive(playlist.id, e.target.checked)}
          inputProps={{ 'aria-label': 'Activar/Desactivar playlist' }}
        />
        <IconButton
          aria-label="más opciones"
          onClick={handleMenuClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleDelete}>Eliminar</MenuItem>
        </Menu>
      </CardActions>
    </Card>
  );
}; 