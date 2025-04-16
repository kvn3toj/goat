import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  TextField,
  Paper,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { usePlaylistItemQuery } from '../hooks/usePlaylistItemQuery';
import { useCategoriesQuery } from '../hooks/useCategoriesQuery';
import { useItemCategoriesQuery } from '../hooks/useItemCategoriesQuery';
import { useCreateCategoryMutation } from '../hooks/useCreateCategoryMutation';
import { useSetItemCategoriesMutation } from '../hooks/useSetItemCategoriesMutation';
import { useUpdatePlaylistItemDetailsMutation } from '../hooks/useUpdatePlaylistItemDetailsMutation';
import { useItemQuestionsQuery } from '../hooks/question/useItemQuestionsQuery';
import { useCreateItemQuestionMutation } from '../hooks/question/useCreateItemQuestionMutation';
import { useUpdateItemQuestionMutation } from '../hooks/question/useUpdateItemQuestionMutation';
import { useDeleteItemQuestionMutation } from '../hooks/question/useDeleteItemQuestionMutation';
import { Category } from '../types/category.types';
import { ItemQuestion } from '../types/question.types';
import { QuestionEditor } from '../components/questions/QuestionEditor';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`video-config-tabpanel-${index}`}
      aria-labelledby={`video-config-tab-${index}`}
      {...other}
      style={{ padding: '24px 0' }}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `video-config-tab-${index}`,
    'aria-controls': `video-config-tabpanel-${index}`,
  };
}

interface CreateCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isLoading: boolean;
}

const CreateCategoryDialog: React.FC<CreateCategoryDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Crear Nueva Categoría</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la categoría"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={!name.trim() || isLoading}>
            {isLoading ? 'Creando...' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export const VideoConfigPage = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false);
  const [isQuestionEditorOpen, setIsQuestionEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ItemQuestion | undefined>(undefined);
  const [anchorElAddQuestion, setAnchorElAddQuestion] = useState<null | HTMLElement>(null);
  const [newQuestionDefaults, setNewQuestionDefaults] = useState<Partial<ItemQuestion> | undefined>(undefined);
  const { user } = useAuth();

  const { data: itemData, isLoading: isLoadingItem, error: errorItem } = usePlaylistItemQuery(itemId || '');
  const { data: allCategories = [], isLoading: isLoadingCategories } = useCategoriesQuery();
  const { data: assignedCategoryIds = [], isLoading: isLoadingAssigned } = useItemCategoriesQuery(itemId || '');
  const { data: questions = [], isLoading: isLoadingQuestions } = useItemQuestionsQuery(itemId || '');

  const { mutate: updateDetailsMutate, isPending: isUpdatingDetails } = useUpdatePlaylistItemDetailsMutation();
  const { mutate: setItemCategoriesMutate, isPending: isSettingCategories } = useSetItemCategoriesMutation();
  const { mutate: createCategoryMutate, isPending: isCreatingCategory } = useCreateCategoryMutation();
  const { mutate: createQuestionMutate, isPending: isCreatingQuestion } = useCreateItemQuestionMutation();
  const { mutate: updateQuestionMutate, isPending: isUpdatingQuestion } = useUpdateItemQuestionMutation();
  const { mutate: deleteQuestionMutate, isPending: isDeletingQuestion } = useDeleteItemQuestionMutation();

  useEffect(() => {
    if (itemData) {
      console.log('[VideoConfigPage] Item data loaded:', {
        id: itemData.id,
        content: itemData.content,
        title: itemData.title,
        description: itemData.description,
        playlist_id: itemData.playlist_id
      });
      setTitle(itemData.title ?? '');
      setDescription(itemData.description ?? '');
    }
  }, [itemData]);

  useEffect(() => {
    if (allCategories.length > 0 && assignedCategoryIds.length >= 0) {
      const assignedCategories = allCategories.filter(category => 
        assignedCategoryIds.includes(category.id)
      );
      setSelectedCategories(assignedCategories);
    }
  }, [allCategories, assignedCategoryIds]);

  const handleCreateCategory = (name: string) => {
    createCategoryMutate(name, {
      onSuccess: () => {
        setIsCreateCategoryDialogOpen(false);
        toast.success('Categoría creada correctamente');
      },
      onError: (error) => {
        console.error('[VideoConfigPage] Error creating category:', error);
        toast.error('Error al crear la categoría');
      }
    });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDetailsSave = useCallback((dataToUpdate: { title?: string; description?: string }) => {
    if (!itemId || !itemData) {
      console.error('[VideoConfigPage] handleDetailsSave: Datos requeridos faltantes:', { 
        itemId, 
        itemData,
        hasPlaylistId: !!itemData?.playlist_id 
      });
      return;
    }
    
    // Solo actualiza si el valor realmente cambió
    const hasChanges = (
      (dataToUpdate.title !== undefined && dataToUpdate.title !== itemData.title) ||
      (dataToUpdate.description !== undefined && dataToUpdate.description !== itemData.description)
    );

    if (!hasChanges) {
      console.log('[VideoConfigPage] handleDetailsSave: No hay cambios, valores actuales:', {
        currentTitle: itemData.title,
        currentDescription: itemData.description,
        newTitle: dataToUpdate.title,
        newDescription: dataToUpdate.description
      });
      return;
    }

    console.log('[VideoConfigPage] handleDetailsSave: Iniciando actualización con:', {
      itemId,
      playlistId: itemData.playlist_id,
      dataToUpdate,
      currentValues: {
        title: itemData.title,
        description: itemData.description
      }
    });

    updateDetailsMutate({
      id: itemId,
      data: dataToUpdate,
      playlistId: itemData.playlist_id
    }, {
      onSuccess: (data) => {
        console.log('[VideoConfigPage] handleDetailsSave: Mutación exitosa, datos actualizados:', data);
        toast.success('Cambios guardados correctamente');
      },
      onError: (error) => {
        console.error('[VideoConfigPage] handleDetailsSave: Error en la mutación:', {
          error,
          errorMessage: error.message,
          stack: error.stack
        });
        toast.error('Error al guardar los cambios');
        // Revertir los cambios en el estado local si la mutación falla
        if (dataToUpdate.title !== undefined) {
          setTitle(itemData.title ?? '');
        }
        if (dataToUpdate.description !== undefined) {
          setDescription(itemData.description ?? '');
        }
      }
    });
  }, [itemId, itemData, updateDetailsMutate]);

  const handleCreateNewQuestion = (type: string) => {
    setAnchorElAddQuestion(null);
    const newQuestionInitialData: Partial<ItemQuestion> = {
      item_id: itemId || '',
      question_type: type,
      question_text: '',
      language: 'es',
      show_subtitles: false,
      show_question: true,
      display_timestamp: 0,
      order_index: questions.length,
    };
    setNewQuestionDefaults(newQuestionInitialData);
    setEditingQuestion(undefined);
    setIsQuestionEditorOpen(true);
  };

  const handleOpenQuestionEditor = (question?: ItemQuestion) => {
    setEditingQuestion(question);
    setNewQuestionDefaults(undefined);
    setIsQuestionEditorOpen(true);
  };

  const handleCloseQuestionEditor = () => {
    setIsQuestionEditorOpen(false);
    setEditingQuestion(undefined);
  };

  const handleCreateQuestion = async (formData: CreateItemQuestionDto) => {
    if (!user?.id) {
      toast.error('Debes estar autenticado para crear preguntas');
      return;
    }
    createQuestionMutate({ data: formData, userId: user.id });
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
      deleteQuestionMutate({ id: questionId, itemId: itemId! });
    }
  };

  if (isLoadingItem || isLoadingCategories || isLoadingAssigned) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (errorItem) {
    console.error('[VideoConfigPage] Error loading item:', errorItem);
    return (
      <Container>
        <Alert severity="error">Error al cargar el video: {errorItem.message}</Alert>
      </Container>
    );
  }

  if (!itemData) {
    console.error('[VideoConfigPage] No item data available');
    return (
      <Container>
        <Alert severity="error">No se encontró el video</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ my: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={handleBackClick} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Configurar Video</Typography>
        </Box>

        {itemData?.content && (
          <Box
            sx={{ 
              width: '100%', 
              aspectRatio: '16/9', 
              mb: 4,
              overflow: 'hidden',
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1
            }}
          >
            <iframe
              src={itemData.content}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={itemData.title || 'Video Preview'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={(e) => {
                console.error('[VideoConfigPage] Iframe error:', {
                  id: itemData.id,
                  content: itemData.content,
                  error: e
                });
              }}
            />
          </Box>
        )}

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Configuración" {...a11yProps(0)} />
            <Tab label="Preguntas" {...a11yProps(1)} />
            <Tab label="Permisos" {...a11yProps(2)} />
          </Tabs>
        </Paper>

        <TabPanel value={activeTab} index={0}>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Título del video"
              value={title}
              onChange={(e) => {
                const newValue = e.target.value;
                console.log('[VideoConfigPage] onChange title:', newValue);
                setTitle(newValue);
              }}
              onBlur={() => {
                console.log('[VideoConfigPage] onBlur title, valor actual:', title);
                if (title.trim() !== itemData?.title?.trim()) {
                  handleDetailsSave({ title: title.trim() });
                }
              }}
              disabled={isUpdatingDetails || isLoadingItem}
              fullWidth
              required
              error={!title.trim()}
              helperText={!title.trim() ? 'El título es requerido' : ''}
              inputProps={{
                maxLength: 100
              }}
            />
            <TextField
              label="Descripción del video"
              value={description}
              onChange={(e) => {
                const newValue = e.target.value;
                console.log('[VideoConfigPage] onChange description:', newValue);
                setDescription(newValue);
              }}
              onBlur={() => {
                console.log('[VideoConfigPage] onBlur description, valor actual:', description);
                if (description.trim() !== itemData?.description?.trim()) {
                  handleDetailsSave({ description: description.trim() });
                }
              }}
              disabled={isUpdatingDetails || isLoadingItem}
              fullWidth
              multiline
              rows={4}
              inputProps={{
                maxLength: 500
              }}
            />
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Categorías
              </Typography>
              <Autocomplete
                multiple
                options={allCategories}
                getOptionLabel={(option) => option.name}
                value={selectedCategories}
                onChange={(_event, newValue) => {
                  setSelectedCategories(newValue);
                  setItemCategoriesMutate({
                    itemId: itemId || '',
                    categoryIds: newValue.map(cat => cat.id)
                  }, {
                    onSuccess: () => {
                      toast.success('Categorías actualizadas correctamente');
                    },
                    onError: (error) => {
                      console.error('[VideoConfigPage] Error updating categories:', error);
                      toast.error('Error al actualizar las categorías');
                    }
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Seleccionar categorías"
                    placeholder="Buscar categorías..."
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
                disabled={isSettingCategories}
              />
              <Button
                onClick={() => setIsCreateCategoryDialogOpen(true)}
                sx={{ mt: 1 }}
                disabled={isCreatingCategory}
              >
                + Crear nueva categoría
              </Button>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={(event) => setAnchorElAddQuestion(event.currentTarget)}
              disabled={isLoadingQuestions}
            >
              Agregar pregunta
            </Button>
            <Menu
              anchorEl={anchorElAddQuestion}
              open={Boolean(anchorElAddQuestion)}
              onClose={() => setAnchorElAddQuestion(null)}
            >
              <MenuItem onClick={() => handleCreateNewQuestion('multiple_choice')}>
                Respuesta múltiple
              </MenuItem>
              <MenuItem onClick={() => handleCreateNewQuestion('a_b')}>
                Respuesta A/B
              </MenuItem>
              <MenuItem onClick={() => handleCreateNewQuestion('quiz')}>
                Quiz
              </MenuItem>
            </Menu>
          </Box>

          {isLoadingQuestions ? (
            <CircularProgress />
          ) : questions.length === 0 ? (
            <Typography color="text.secondary">No hay preguntas configuradas</Typography>
          ) : (
            <List>
              {questions.map((question) => (
                <ListItem
                  key={question.id}
                  divider
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        onClick={() => handleOpenQuestionEditor(question)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={question.question_text}
                    secondary={`Tipo: ${question.question_type} | Timestamp: ${question.display_timestamp}s`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Gestión de Permisos
            </Typography>
            <Typography color="text.secondary">
              Funcionalidad en desarrollo
            </Typography>
          </Box>
        </TabPanel>
      </Box>

      <CreateCategoryDialog
        open={isCreateCategoryDialogOpen}
        onClose={() => setIsCreateCategoryDialogOpen(false)}
        onSubmit={handleCreateCategory}
        isLoading={isCreatingCategory}
      />

      <QuestionEditor
        open={isQuestionEditorOpen}
        onClose={handleCloseQuestionEditor}
        itemId={itemId || ''}
        questionToEdit={editingQuestion}
        defaultData={newQuestionDefaults}
        onSave={handleCreateQuestion}
        isSaving={isCreatingQuestion || isUpdatingQuestion}
      />
    </Container>
  );
}; 