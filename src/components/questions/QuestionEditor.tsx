import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Radio,
  RadioGroup,
  FormLabel,
} from '@mui/material';
import { 
  Close as CloseIcon, 
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { 
  ItemQuestion, 
  CreateItemQuestionDto, 
  UpdateItemQuestionDto,
  QuestionCycle,
  CreateQuestionCycleDto,
  CycleAnswer,
  CreateCycleAnswerDto,
} from '../../types/question.types';
import { useQuestionCyclesQuery } from '../../hooks/question/useQuestionCyclesQuery';
import {
  useCreateQuestionCycleMutation,
  useUpdateQuestionCycleMutation,
  useDeleteQuestionCycleMutation,
} from '../../hooks/question/useQuestionCycleMutations';
import { useCreateCycleAnswerMutation } from '../../hooks/question/useCreateCycleAnswerMutation';
import { useCreateItemQuestionMutation } from '../../hooks/question/useCreateItemQuestionMutation';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { CycleEditor } from './CycleEditor';
import { useCycleAnswersQuery } from '../../hooks/question/useCycleAnswersQuery';
import { supabase } from '../../services/supabaseClient';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

// Tipos para el estado editable
interface EditableCycle extends Partial<QuestionCycle> {
  id?: string;
  isNew?: boolean;
  isDeleted?: boolean;
  item_question_id?: string;
}

interface EditableQuestion extends Partial<ItemQuestion> {
  id?: string;
  item_id: string;
  cycles: EditableCycle[];
}

interface QuestionEditorProps {
  open: boolean;
  onClose: () => void;
  itemId: string;
  questionToEdit?: ItemQuestion;
  defaultData?: Partial<ItemQuestion>;
  onSave: (data: CreateItemQuestionDto | UpdateItemQuestionDto) => Promise<void>;
  isSaving?: boolean;
}

export const QuestionEditor = ({
  open,
  onClose,
  itemId,
  questionToEdit,
  defaultData,
  onSave,
  isSaving = false,
}: QuestionEditorProps) => {
  const { user } = useAuth();
  // Queries
  const { data: cycles = [] } = useQuestionCyclesQuery(
    questionToEdit?.id || '',
    { enabled: !!questionToEdit?.id }
  );

  // Estado principal editable
  const [editableQuestionData, setEditableQuestionData] = useState<EditableQuestion>({
    item_id: itemId,
    question_text: '',
    question_type: defaultData?.question_type || 'multiple_choice',
    display_timestamp: 0,
    order_index: 0,
    language: 'es',
    show_subtitles: false,
    show_question: true,
    cycles: defaultData?.question_type === 'a_b' ? [{
      isNew: true,
      delay_seconds: 0,
      duration_seconds: 30,
      order_index: 0,
      is_active: true,
      answers: [
        { answer_text: '', is_correct: true, order_index: 0 },
        { answer_text: '', is_correct: false, order_index: 1 }
      ],
    }] : [],
  });

  // Estado UI
  const [expandedCycle, setExpandedCycle] = useState<string | false>(false);
  const [cycleToDelete, setCycleToDelete] = useState<string | null>(null);

  // Refs para evitar actualizaciones infinitas
  const previousQuestionId = useRef<string | undefined>(questionToEdit?.id);
  const previousCyclesLength = useRef<number>(0);

  // Memoizar los IDs de ciclos para evitar recreación en cada render
  const cycleIds = useMemo(() => 
    editableQuestionData.cycles
      .filter(cycle => cycle.id && !cycle.isDeleted)
      .map(cycle => cycle.id)
      .join(','),
    [editableQuestionData.cycles]
  );

  // Memoizar los ciclos actuales para comparación
  const currentCycles = useMemo(() => cycles, [cycles]);

  // Mutations
  const createQuestionMutation = useCreateItemQuestionMutation();
  const createCycleMutation = useCreateQuestionCycleMutation();
  const updateCycleMutation = useUpdateQuestionCycleMutation();
  const deleteCycleMutation = useDeleteQuestionCycleMutation();
  const createAnswerMutation = useCreateCycleAnswerMutation();

  // Cargar datos iniciales
  useEffect(() => {
    const hasQuestionChanged = questionToEdit?.id !== previousQuestionId.current;
    const hasCyclesChanged = currentCycles.length !== previousCyclesLength.current;

    if (hasQuestionChanged || hasCyclesChanged) {
      if (questionToEdit) {
        // Preservar las respuestas existentes al actualizar
        const updatedCycles = currentCycles.map(cycle => ({
          ...cycle,
          answers: editableQuestionData.cycles.find(c => c.id === cycle.id)?.answers || [], 
        }));

        setEditableQuestionData(prev => {
          // Solo actualizar si hay cambios reales
          const hasChanges = 
            hasQuestionChanged || 
            JSON.stringify(updatedCycles) !== JSON.stringify(prev.cycles);

          if (!hasChanges) return prev;

          return {
            ...questionToEdit,
            cycles: updatedCycles,
          };
        });
      } else if (defaultData) {
        setEditableQuestionData({
          ...defaultData,
          item_id: itemId,
          cycles: [],
        });
      } else {
        setEditableQuestionData({
          item_id: itemId,
          question_text: '',
          question_type: 'multiple_choice',
          display_timestamp: 0,
          order_index: 0,
          language: 'es',
          show_subtitles: false,
          show_question: true,
          cycles: [],
        });
      }

      previousQuestionId.current = questionToEdit?.id;
      previousCyclesLength.current = currentCycles.length;
    }
  }, [questionToEdit?.id, itemId, currentCycles, defaultData]);

  // Cargar respuestas para cada ciclo
  useEffect(() => {
    let isMounted = true;

    const loadAnswersForCycles = async () => {
      const validCycles = editableQuestionData.cycles.filter(cycle => cycle.id && !cycle.isDeleted);
      if (validCycles.length === 0) return;

      try {
        const cyclesWithAnswers = await Promise.all(
          validCycles.map(async cycle => {
            if (!cycle.id) return cycle;
            
            // Usar supabase directamente en lugar del hook
            const { data: answers = [], error } = await supabase
              .from('cycle_answers')
              .select('*')
              .eq('question_cycle_id', cycle.id)
              .order('order_index', { ascending: true });

            if (error) throw error;

            return {
              ...cycle,
              answers: answers.map(answer => ({
                ...answer,
                question_cycle_id: cycle.id,
              })),
            };
          })
        );

        if (!isMounted) return;

        const hasChanges = cyclesWithAnswers.some((cycleWithAnswers) => {
          const currentCycle = editableQuestionData.cycles.find(c => c.id === cycleWithAnswers.id);
          return !currentCycle || 
            JSON.stringify(currentCycle.answers) !== JSON.stringify(cycleWithAnswers.answers);
        });

        if (hasChanges) {
          setEditableQuestionData(prev => ({
            ...prev,
            cycles: prev.cycles.map(cycle => {
              const cycleWithAnswers = cyclesWithAnswers.find(c => c.id === cycle.id);
              return cycleWithAnswers || cycle;
            }),
          }));
        }
      } catch (error) {
        if (isMounted) {
          console.error('[QuestionEditor] Error loading answers:', error);
        }
      }
    };

    loadAnswersForCycles();

    return () => {
      isMounted = false;
    };
  }, [cycleIds]);

  // Limpiar estado al cerrar
  useEffect(() => {
    if (!open) {
      setEditableQuestionData({
        item_id: itemId,
        question_text: '',
        question_type: 'multiple_choice',
        display_timestamp: 0,
        order_index: 0,
        language: 'es',
        show_subtitles: false,
        show_question: true,
        cycles: [],
      });
      setExpandedCycle(false);
      setCycleToDelete(null);
    }
  }, [open, itemId]);

  const handleInputChange = (field: keyof typeof editableQuestionData, value: any) => {
    setEditableQuestionData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Manejadores de ciclos
  const handleCreateCycle = async () => {
    try {
      const cycleDto: CreateQuestionCycleDto = {
        item_question_id: editableQuestionData.id,
        delay_seconds: 0,
        duration_seconds: 30,
        order_index: editableQuestionData.cycles.length,
        is_active: true,
      };

      const cycle = await createCycleMutation.mutateAsync(cycleDto);

      setEditableQuestionData(prev => ({
        ...prev,
        cycles: [
          ...prev.cycles,
          cycle,
        ],
      }));
    } catch (error) {
      console.error('Error creating cycle:', error);
    }
  };

  const handleUpdateCycle = (cycleId: string | undefined, updates: Partial<EditableCycle>) => {
    setEditableQuestionData(prev => ({
      ...prev,
      cycles: prev.cycles.map(cycle => 
        cycle.id === cycleId || (!cycle.id && cycle === prev.cycles.find(c => c.id === cycleId))
          ? { ...cycle, ...updates }
          : cycle
      ),
    }));
  };

  const handleDeleteCycle = (cycleId: string | undefined) => {
    if (!cycleId) return;
    setCycleToDelete(cycleId);
  };

  const handleConfirmDeleteCycle = () => {
    if (!cycleToDelete) return;
    
    setEditableQuestionData(prev => ({
      ...prev,
      cycles: prev.cycles.map(cycle =>
        cycle.id === cycleToDelete
          ? { ...cycle, isDeleted: true }
          : cycle
      ).filter(cycle => cycle.id !== cycleToDelete || !cycle.isNew), // Eliminar inmediatamente si es nuevo
    }));
    setCycleToDelete(null);
  };

  // Manejadores específicos para respuestas A/B
  const handleAnswerTextChange = (index: number, text: string) => {
    setEditableQuestionData(prev => ({
      ...prev,
      cycles: prev.cycles.map((cycle, cycleIndex) => 
        cycleIndex === 0 ? {
          ...cycle,
          answers: cycle.answers?.map((answer, answerIndex) => 
            answerIndex === index ? {
              ...answer,
              answer_text: text,
            } : answer
          ) || [],
        } : cycle
      ),
    }));
  };

  const getCorrectAnswerIndexAB = (): string => {
    const answers = editableQuestionData.cycles[0]?.answers || [];
    return answers.findIndex(answer => answer.is_correct)?.toString() || '0';
  };

  const handleCorrectAnswerChangeAB = (event: React.ChangeEvent<HTMLInputElement>) => {
    const correctIndex = parseInt(event.target.value);
    setEditableQuestionData(prev => ({
      ...prev,
      cycles: prev.cycles.map((cycle, cycleIndex) => 
        cycleIndex === 0 ? {
          ...cycle,
          answers: cycle.answers?.map((answer, answerIndex) => ({
            ...answer,
            is_correct: answerIndex === correctIndex,
          })) || [],
        } : cycle
      ),
    }));
  };

  const handleSave = async () => {
    try {
      // 1. Guardar/Actualizar pregunta
      let questionId = editableQuestionData.id;
      
      const questionDto: CreateItemQuestionDto | UpdateItemQuestionDto = {
        ...(questionId ? { id: questionId } : {}),
        item_id: editableQuestionData.item_id,
        question_text: editableQuestionData.question_text || '',
        question_type: editableQuestionData.question_type || 'multiple_choice',
        display_timestamp: editableQuestionData.display_timestamp || 0,
        order_index: editableQuestionData.order_index || 0,
        language: editableQuestionData.language || 'es',
        show_subtitles: editableQuestionData.show_subtitles || false,
        show_question: editableQuestionData.show_question || true,
      };

      if (!questionId) {
        // Es una pregunta nueva
        const newQuestion = await createQuestionMutation.mutateAsync({
          data: questionDto as CreateItemQuestionDto,
          userId: user?.id
        });
        questionId = newQuestion.id;
      } else {
        // Es una actualización
        await onSave(questionDto as UpdateItemQuestionDto);
      }

      // 2. Procesar ciclos según el tipo de pregunta
      if (editableQuestionData.question_type === 'a_b') {
        // Para A/B, siempre tenemos un ciclo con dos respuestas
        const cycle = editableQuestionData.cycles[0];
        const cycleDto = {
          item_question_id: questionId,
          delay_seconds: cycle.delay_seconds || 0,
          duration_seconds: cycle.duration_seconds || 30,
          order_index: 0,
          is_active: true,
        };

        let cycleId: string;
        if (cycle.id) {
          await updateCycleMutation.mutateAsync({
            id: cycle.id,
            delay_seconds: cycle.delay_seconds,
            duration_seconds: cycle.duration_seconds,
            is_active: cycle.is_active
          });
          cycleId = cycle.id;
        } else {
          const newCycle = await createCycleMutation.mutateAsync(cycleDto);
          cycleId = newCycle.id;
        }

        // Crear/Actualizar las dos respuestas A/B
        const answers = cycle.answers || [];
        for (let i = 0; i < 2; i++) {
          const answer = answers[i];
          if (!answer) continue;

          const answerDto = {
            question_cycle_id: cycleId,
            answer_text: answer.answer_text || '',
            is_correct: answer.is_correct || false,
            ondas_reward: answer.ondas_reward || 0,
            order_index: i
          };

          if (user?.id) {
            await createAnswerMutation.mutateAsync({
              data: answerDto,
              userId: user.id
            });
          }
        }
      } else {
        // Lógica para multiple_choice
        for (const cycle of editableQuestionData.cycles) {
          if (cycle.isDeleted && cycle.id) {
            await deleteCycleMutation.mutateAsync(cycle.id);
            continue;
          }

          let cycleId = cycle.id;
          if (cycle.isNew) {
            const newCycle = await createCycleMutation.mutateAsync({
              item_question_id: questionId,
              delay_seconds: cycle.delay_seconds || 0,
              duration_seconds: cycle.duration_seconds || 30,
              order_index: cycle.order_index || 0,
              is_active: cycle.is_active || true
            });
            cycleId = newCycle.id;
          } else if (cycleId) {
            await updateCycleMutation.mutateAsync({
              id: cycleId,
              delay_seconds: cycle.delay_seconds,
              duration_seconds: cycle.duration_seconds,
              is_active: cycle.is_active
            });
          }
        }
      }

      toast.success('Pregunta guardada exitosamente');
      onClose();
    } catch (error) {
      console.error('[QuestionEditor] Error saving question:', error);
      toast.error('Error al guardar la pregunta: ' + (error as Error).message);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: '1200px',
          height: '100%',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={onClose} disabled={isSaving}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">
              {questionToEdit ? 'Editar Pregunta' : 'Agregar Pregunta'}
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave}
            disabled={isSaving || !editableQuestionData.question_text.trim()}
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Grid container spacing={2}>
            {/* Campos de la pregunta */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Escribe la pregunta aquí"
                value={editableQuestionData.question_text}
                onChange={(e) => handleInputChange('question_text', e.target.value)}
                sx={{ mb: 3 }}
                disabled={isSaving}
                error={!editableQuestionData.question_text?.trim()}
                helperText={!editableQuestionData.question_text?.trim() ? 'La pregunta es requerida' : ''}
              />

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Idioma</InputLabel>
                    <Select
                      value={editableQuestionData.language}
                      label="Idioma"
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      disabled={isSaving}
                    >
                      <MenuItem value="es">Español</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editableQuestionData.show_subtitles}
                        onChange={(e) => handleInputChange('show_subtitles', e.target.checked)}
                        disabled={isSaving}
                      />
                    }
                    label="Mostrar subtítulos"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editableQuestionData.show_question}
                        onChange={(e) => handleInputChange('show_question', e.target.checked)}
                        disabled={isSaving}
                      />
                    }
                    label="Mostrar pregunta"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Sección de Ciclos y Respuestas */}
            <Grid item xs={12}>
              {editableQuestionData.question_type === 'multiple_choice' && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Ciclos y Respuestas</Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={handleCreateCycle}
                      disabled={isSaving}
                    >
                      Crear nuevo ciclo
                    </Button>
                  </Box>

                  {editableQuestionData.cycles
                    .filter(cycle => !cycle.isDeleted)
                    .map((cycle, index) => (
                      <CycleEditor
                        key={cycle.id || index}
                        cycle={cycle}
                        index={index}
                        isExpanded={expandedCycle === cycle.id}
                        onExpandChange={(expanded) => setExpandedCycle(expanded ? cycle.id || false : false)}
                        onDeleteCycle={() => handleDeleteCycle(cycle.id)}
                        onUpdateCycle={(cycleId, updates) => handleUpdateCycle(cycleId, updates)}
                        isSaving={isSaving}
                      />
                    ))}

                  {editableQuestionData.cycles.filter(c => !c.isDeleted).length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                      No hay ciclos creados. Haz clic en "Crear nuevo ciclo" para comenzar.
                    </Typography>
                  )}
                </>
              )}

              {editableQuestionData.question_type === 'a_b' && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Respuestas A/B</Typography>
                  <TextField
                    label="Respuesta A"
                    fullWidth
                    margin="normal"
                    value={editableQuestionData.cycles[0]?.answers?.[0]?.answer_text ?? ''}
                    onChange={(e) => handleAnswerTextChange(0, e.target.value)}
                    disabled={isSaving}
                    error={!editableQuestionData.cycles[0]?.answers?.[0]?.answer_text}
                    helperText={!editableQuestionData.cycles[0]?.answers?.[0]?.answer_text ? 'La respuesta A es requerida' : ''}
                  />
                  <TextField
                    label="Respuesta B"
                    fullWidth
                    margin="normal"
                    value={editableQuestionData.cycles[0]?.answers?.[1]?.answer_text ?? ''}
                    onChange={(e) => handleAnswerTextChange(1, e.target.value)}
                    disabled={isSaving}
                    error={!editableQuestionData.cycles[0]?.answers?.[1]?.answer_text}
                    helperText={!editableQuestionData.cycles[0]?.answers?.[1]?.answer_text ? 'La respuesta B es requerida' : ''}
                  />
                  <FormControl component="fieldset" margin="normal">
                    <FormLabel component="legend">Respuesta Correcta</FormLabel>
                    <RadioGroup
                      row
                      value={getCorrectAnswerIndexAB()}
                      onChange={handleCorrectAnswerChangeAB}
                    >
                      <FormControlLabel value="0" control={<Radio />} label="A" disabled={isSaving} />
                      <FormControlLabel value="1" control={<Radio />} label="B" disabled={isSaving} />
                    </RadioGroup>
                  </FormControl>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>

        {/* Diálogo de confirmación para eliminar ciclo */}
        <ConfirmDialog
          open={!!cycleToDelete}
          title="Eliminar ciclo"
          message="¿Estás seguro de que deseas eliminar este ciclo y todas sus respuestas? Esta acción no se puede deshacer."
          onConfirm={handleConfirmDeleteCycle}
          onCancel={() => setCycleToDelete(null)}
        />
      </Box>
    </Drawer>
  );
}; 