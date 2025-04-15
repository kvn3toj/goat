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
  Box,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Playlist } from '@/types/playlist';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event?: React.MouseEvent<HTMLElement>) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  const handleDelete = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    handleMenuClose();
    onDelete(playlist.id);
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onToggleActive(playlist.id, event.target.checked);
  };

  const handleCardClick = () => {
    navigate(`/playlists/${playlist.id}`);
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
      onClick={handleCardClick}
    >
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
          onChange={handleSwitchChange}
          onClick={(e) => e.stopPropagation()}
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
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem onClick={handleDelete}>Eliminar</MenuItem>
        </Menu>
      </CardActions>
    </Card>
  );
}; 