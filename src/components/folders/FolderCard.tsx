import { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  Folder as FolderIcon,
  PushPin as PinIcon,
  PushPinOutlined as UnpinIcon,
} from '@mui/icons-material';
import { PlaylistFolder } from '../../types/folder.types';

interface FolderCardProps {
  folder: PlaylistFolder;
  onEdit?: (folder: PlaylistFolder) => void;
  onDelete: (id: string) => void;
  onPinToggle: (id: string, isPinned: boolean) => void;
}

export const FolderCard = ({ 
  folder, 
  onEdit, 
  onDelete, 
  onPinToggle 
}: FolderCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(folder);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    onDelete(folder.id);
    handleMenuClose();
  };

  const handlePinToggle = () => {
    onPinToggle(folder.id, !folder.is_pinned);
    handleMenuClose();
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FolderIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {folder.name}
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
        <IconButton onClick={handleMenuClick}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {onEdit && (
            <MenuItem onClick={handleEditClick}>
              <EditIcon sx={{ mr: 1 }} />
              Editar
            </MenuItem>
          )}
          <MenuItem onClick={handlePinToggle}>
            {folder.is_pinned ? (
              <>
                <UnpinIcon sx={{ mr: 1 }} />
                Desfijar
              </>
            ) : (
              <>
                <PinIcon sx={{ mr: 1 }} />
                Fijar
              </>
            )}
          </MenuItem>
          <MenuItem onClick={handleDeleteClick}>
            <DeleteIcon sx={{ mr: 1 }} />
            Eliminar
          </MenuItem>
        </Menu>
      </CardActions>
    </Card>
  );
}; 