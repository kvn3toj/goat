import { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Switch,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  PlayCircleOutline as PlayIcon,
} from '@mui/icons-material';
import { Playlist } from '../../types/playlist.types';

interface PlaylistCardProps {
  playlist: Playlist;
  onEdit: (playlist: Playlist) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export const PlaylistCard = ({ playlist, onEdit, onDelete, onToggleActive }: PlaylistCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    onEdit(playlist);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    onDelete(playlist.id);
    handleMenuClose();
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PlayIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {playlist.name}
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Switch
          checked={playlist.is_active}
          onChange={(event) => onToggleActive(playlist.id, event.target.checked)}
          color="primary"
        />
        <IconButton onClick={handleMenuClick}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditClick}>
            <EditIcon sx={{ mr: 1 }} />
            Editar
          </MenuItem>
          <MenuItem onClick={handleDeleteClick}>
            <DeleteIcon sx={{ mr: 1 }} />
            Eliminar
          </MenuItem>
          <MenuItem disabled>
            Duplicar
          </MenuItem>
          <MenuItem disabled>
            Mover
          </MenuItem>
          <MenuItem disabled>
            Fijar
          </MenuItem>
          <MenuItem disabled>
            Propiedades
          </MenuItem>
        </Menu>
      </CardActions>
    </Card>
  );
}; 