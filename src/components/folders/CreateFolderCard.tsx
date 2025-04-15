import {
  Card,
  CardActionArea,
  Typography,
  Box,
  Avatar,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface CreateFolderCardProps {
  onClick: () => void;
}

export const CreateFolderCard = ({ onClick }: CreateFolderCardProps) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea
        onClick={onClick}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
            }}
          >
            <AddIcon />
          </Avatar>
          <Typography variant="subtitle1" component="div" color="primary" fontWeight="bold">
            Nueva carpeta
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
}; 