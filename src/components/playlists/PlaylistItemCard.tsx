import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Box, 
  CardActionArea, 
  Typography, 
  CardActions,
  IconButton,
  Menu,
  MenuItem,
  Stack
} from '@mui/material';
import { PlaylistItem } from '../../types/playlistItem.types';
import { 
  Settings as SettingsIcon, 
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  DeleteOutline,
  ArrowUpward,
  ArrowDownward,
  Edit as EditIcon
} from '@mui/icons-material';
import { useDeletePlaylistItemMutation } from '../../hooks/useDeletePlaylistItemMutation';
import { useUpdatePlaylistItemOrderMutation } from '../../hooks/playlist/useUpdatePlaylistItemOrderMutation';
import { toast } from 'sonner';

interface PlaylistItemCardProps {
  item: PlaylistItem;
  onEdit?: (item: PlaylistItem) => void;
  playlistId: string;
  isFirst: boolean;
  isLast: boolean;
}

const PlaylistItemCard = memo(({ item, onEdit, playlistId, isFirst, isLast }: PlaylistItemCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const deleteMutation = useDeletePlaylistItemMutation(playlistId);
  const reorderMutation = useUpdatePlaylistItemOrderMutation(playlistId);

  // Debug log for content URL
  console.log('[PlaylistItemCard] Rendering item:', {
    id: item.id,
    content: item.content,
    title: item.title
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event?: React.MouseEvent<HTMLElement>) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success('Elemento eliminado correctamente');
    } catch (error) {
      console.error('Error deleting playlist item:', error);
      toast.error('Error al eliminar el elemento');
    }
  };

  const handleReorder = async (direction: 'up' | 'down') => {
    try {
      await reorderMutation.mutateAsync({ itemId: item.id, direction });
    } catch (error) {
      console.error('Error reordering playlist item:', error);
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <IconButton
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
      >
        <DeleteOutline sx={{ color: 'white' }} />
      </IconButton>
      <CardActionArea>
        <Box
          sx={{
            width: '100%',
            aspectRatio: '16/9',
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <iframe
            src={item.content}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={item.title || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={(e) => {
              console.error('[PlaylistItemCard] Iframe error:', {
                id: item.id,
                content: item.content,
                error: e
              });
            }}
          />
        </Box>
        <CardContent>
          <Typography variant="subtitle1" component="div" noWrap>
            {item.title || 'Video sin título'}
          </Typography>
          {item.description && (
            <Typography variant="body2" color="text.secondary" sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {item.description}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
      
      <CardActions sx={{ mt: 'auto', justifyContent: 'flex-end' }}>
        <Stack direction="column" spacing={0}>
          {!isFirst && (
            <IconButton 
              size="small" 
              onClick={() => handleReorder('up')}
              disabled={reorderMutation.isPending}
            >
              <ArrowUpward />
            </IconButton>
          )}
          {!isLast && (
            <IconButton 
              size="small" 
              onClick={() => handleReorder('down')}
              disabled={reorderMutation.isPending}
            >
              <ArrowDownward />
            </IconButton>
          )}
        </Stack>
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
          <MenuItem onClick={(e) => {
            e.stopPropagation();
            navigate(`/items/${item.id}/config`);
            handleMenuClose();
          }}>
            <SettingsIcon sx={{ mr: 1 }} />
            Configurar
          </MenuItem>
          {onEdit && (
            <MenuItem onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
              handleMenuClose();
            }}>
              <EditIcon sx={{ mr: 1 }} />
              Editar
            </MenuItem>
          )}
          <MenuItem onClick={handleDelete}>
            <DeleteIcon sx={{ mr: 1 }} />
            Eliminar
          </MenuItem>
        </Menu>
      </CardActions>
    </Card>
  );
});

export { PlaylistItemCard }; 