import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface CreatePlaylistCardProps {
  onClick: () => void;
}

export const CreatePlaylistCard: React.FC<CreatePlaylistCardProps> = ({ onClick }) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center' }}>
        <AddIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" component="h2">
          Nueva playlist
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Crea una nueva playlist
        </Typography>
      </CardContent>
    </Card>
  );
}; 