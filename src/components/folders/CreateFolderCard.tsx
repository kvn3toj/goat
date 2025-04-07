import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import { CreateNewFolder as CreateFolderIcon } from '@mui/icons-material';

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
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CreateFolderIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" component="div" color="primary">
              Nueva carpeta
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}; 