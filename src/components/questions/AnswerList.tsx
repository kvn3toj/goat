import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  List,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useCycleAnswersQuery } from '../../hooks/question/useCycleAnswersQuery';
import {
  useCreateCycleAnswerMutation,
  useUpdateCycleAnswerMutation,
  useDeleteCycleAnswerMutation,
} from '../../hooks/question/useCycleAnswerMutations';
import { AnswerEditor } from './AnswerEditor';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { toast } from 'react-hot-toast';
import { CycleAnswer } from '../../types/question.types';

interface AnswerListProps {
  cycleId: string;
}

export const AnswerList = ({ cycleId }: AnswerListProps) => {
  // Estado para diálogo de eliminación
  const [deletingAnswerId, setDeletingAnswerId] = useState<string | null>(null);

  // Queries y Mutations
  const {
    data: answers = [],
    isLoading,
    error,
  } = useCycleAnswersQuery(cycleId);

  const createAnswerMutation = useCreateCycleAnswerMutation();
  const updateAnswerMutation = useUpdateCycleAnswerMutation();
  const deleteAnswerMutation = useDeleteCycleAnswerMutation();

  const isSaving =
    createAnswerMutation.isPending ||
    updateAnswerMutation.isPending ||
    deleteAnswerMutation.isPending;

  // Handlers
  const handleCreateAnswer = useCallback(async () => {
    try {
      await createAnswerMutation.mutateAsync({
        question_cycle_id: cycleId,
        answer_text: '',
        is_correct: false,
        ondas_reward: 0,
        order_index: answers.length,
      });
    } catch (error) {
      console.error('[AnswerList] Error creating answer:', error);
      toast.error('Error al crear la respuesta: ' + (error as Error).message);
    }
  }, [cycleId, answers.length, createAnswerMutation]);

  const handleUpdateAnswer = useCallback(async (
    answerId: string | undefined,
    updates: Partial<CycleAnswer>
  ) => {
    if (!answerId) return;
    try {
      await updateAnswerMutation.mutateAsync({
        id: answerId,
        ...updates,
      });
    } catch (error) {
      console.error('[AnswerList] Error updating answer:', error);
      toast.error('Error al actualizar la respuesta: ' + (error as Error).message);
    }
  }, [updateAnswerMutation]);

  const handleDeleteAnswerClick = useCallback((answerId: string | undefined) => {
    if (!answerId) return;
    setDeletingAnswerId(answerId);
  }, []);

  const handleDeleteAnswerConfirm = useCallback(async () => {
    if (!deletingAnswerId) return;
    try {
      await deleteAnswerMutation.mutateAsync({
        id: deletingAnswerId,
        cycleId,
      });
      setDeletingAnswerId(null);
    } catch (error) {
      console.error('[AnswerList] Error deleting answer:', error);
      toast.error('Error al eliminar la respuesta: ' + (error as Error).message);
    }
  }, [deletingAnswerId, cycleId, deleteAnswerMutation]);

  // Renderizado condicional para estados de carga y error
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error al cargar las respuestas: {error.message}
      </Alert>
    );
  }

  const filteredAnswers = answers.filter(answer => !answer.isDeleted);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2">
          Respuestas ({filteredAnswers.length})
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleCreateAnswer}
          disabled={isSaving}
        >
          Agregar respuesta
        </Button>
      </Box>

      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {filteredAnswers.map((answer, index) => (
          <AnswerEditor
            key={answer.id || index}
            answer={answer}
            answerIndex={index}
            onUpdate={handleUpdateAnswer}
            onDelete={handleDeleteAnswerClick}
            isSaving={isSaving}
          />
        ))}

        {filteredAnswers.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No hay respuestas en este ciclo. Haz clic en "Agregar respuesta" para comenzar.
          </Typography>
        )}
      </List>

      <ConfirmDialog
        open={!!deletingAnswerId}
        title="Eliminar respuesta"
        message="¿Estás seguro de que deseas eliminar esta respuesta? Esta acción no se puede deshacer."
        onConfirm={handleDeleteAnswerConfirm}
        onCancel={() => setDeletingAnswerId(null)}
      />
    </Box>
  );
}; 