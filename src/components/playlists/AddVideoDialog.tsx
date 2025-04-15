import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';

interface AddVideoDialogProps {
  open: boolean;
  onClose: () => void;
  onAddVideo: (embedUrl: string) => void;
  isLoading: boolean;
}

export const AddVideoDialog = ({ open, onClose, onAddVideo, isLoading }: AddVideoDialogProps) => {
  const [iframeInput, setIframeInput] = useState('');
  const [validEmbedUrl, setValidEmbedUrl] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [error, setError] = useState('');

  const extractAndValidateEmbedUrl = (input: string): string | null => {
    console.log('[AddVideoDialog] extractAndValidateEmbedUrl called with input:', input);

    // Caso 1: URL directa de YouTube
    if (input.includes('youtube.com/watch?v=')) {
      const videoId = input.match(/[?&]v=([^&]+)/)?.[1];
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        console.log('[AddVideoDialog] Extracted from direct URL:', embedUrl);
        return embedUrl;
      }
    }

    // Caso 2: URL corta de YouTube
    if (input.includes('youtu.be/')) {
      const videoId = input.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        console.log('[AddVideoDialog] Extracted from short URL:', embedUrl);
        return embedUrl;
      }
    }

    // Caso 3: Código iframe
    if (input.includes('<iframe')) {
      const srcMatch = input.match(/src=["']([^"']*)/);
      if (srcMatch) {
        let url = srcMatch[1];
        console.log('[AddVideoDialog] Found src in iframe:', url);
        
        // Si la URL extraída es de YouTube watch, convertirla a embed
        if (url.includes('youtube.com/watch?v=')) {
          const videoId = url.match(/[?&]v=([^&]+)/)?.[1];
          if (videoId) {
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            console.log('[AddVideoDialog] Converted watch URL to embed:', embedUrl);
            return embedUrl;
          }
        }

        // Si ya es una URL de embed, usarla directamente
        if (url.includes('/embed/') || url.includes('player.vimeo.com')) {
          console.log('[AddVideoDialog] Using existing embed URL:', url);
          return url;
        }
      }
    }

    // Caso 4: URL de embed directa
    if (input.includes('/embed/') || input.includes('player.vimeo.com')) {
      console.log('[AddVideoDialog] Using direct embed URL:', input);
      return input;
    }

    console.log('[AddVideoDialog] No valid URL found');
    return null;
  };

  const handleLoadClick = () => {
    console.log('[AddVideoDialog] handleLoadClick called with input:', iframeInput);
    const embedUrl = extractAndValidateEmbedUrl(iframeInput);
    console.log('[AddVideoDialog] Input:', iframeInput);
    console.log('[AddVideoDialog] Extracted URL:', embedUrl);
    if (!embedUrl) {
      setError(`URL no válida. Por favor, usa uno de estos formatos:
      - URL de YouTube (ej: https://www.youtube.com/watch?v=VIDEO_ID)
      - URL corta de YouTube (ej: https://youtu.be/VIDEO_ID)
      - Código iframe de "Compartir > Insertar"
      - URL de embed directa (debe contener /embed/)`);
      return;
    }

    setError('');
    setValidEmbedUrl(embedUrl);
    setIsPreviewMode(true);
  };

  const handleSaveClick = () => {
    console.log('[AddVideoDialog] handleSaveClick called with validEmbedUrl:', validEmbedUrl);
    if (validEmbedUrl) {
      console.log('[AddVideoDialog] Calling onAddVideo with URL:', validEmbedUrl);
      onAddVideo(validEmbedUrl);
    }
  };

  const handleClose = () => {
    setIframeInput('');
    setValidEmbedUrl('');
    setIsPreviewMode(false);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Añadir Video a la Playlist</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="URL del video o código iframe"
            multiline
            rows={4}
            value={iframeInput}
            onChange={(e) => setIframeInput(e.target.value)}
            disabled={isLoading || isPreviewMode}
            fullWidth
            placeholder={`Puedes pegar:
1. URL de YouTube (https://www.youtube.com/watch?v=...)
2. URL corta (https://youtu.be/...)
3. Código iframe de "Compartir > Insertar"
4. URL de embed directa (con /embed/)`}
            helperText="Acepta URLs de YouTube o código iframe de 'Compartir > Insertar'"
          />

          {error && <Alert severity="error" sx={{ whiteSpace: 'pre-line' }}>{error}</Alert>}

          {isPreviewMode && validEmbedUrl && (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>
                URL de embed extraída correctamente: {validEmbedUrl}
              </Alert>
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '16/9',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <iframe
                  src={validEmbedUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Video Preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          onClick={isPreviewMode ? handleSaveClick : handleLoadClick}
          variant="contained"
          disabled={isLoading || !iframeInput}
          startIcon={isLoading && <CircularProgress size={20} />}
        >
          {isLoading ? 'Guardando...' : isPreviewMode ? 'Guardar' : 'Cargar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 