import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import { AddCircleOutline as AddIcon } from '@mui/icons-material';

interface CreatePlaylistCardProps {
  onClick: () => void;
}

export const CreatePlaylistCard = ({ onClick }: CreatePlaylistCardProps) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea
        onClick={onClick}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AddIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" component="div" color="primary">
              Nueva playlist
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}; 