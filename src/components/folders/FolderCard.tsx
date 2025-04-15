import { useState } from 'react';
import {
  Card,
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
    event.stopPropagation();
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
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: 80,
      position: 'relative',
    }}>
      <Box sx={{ 
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FolderIcon color="primary" />
          <Typography 
            variant="subtitle1" 
            component="div" 
            noWrap 
            title={folder.name}
            sx={{ 
              fontWeight: 500,
              color: 'text.primary'
            }}
          >
            {folder.name}
          </Typography>
        </Box>
        <IconButton 
          onClick={handleMenuClick}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
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
      </Box>
    </Card>
  );
}; 