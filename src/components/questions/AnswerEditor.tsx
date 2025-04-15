import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { CycleAnswer, UpdateCycleAnswerDto } from '../../types/question.types';

interface AnswerEditorProps {
  answer: Partial<CycleAnswer>;
  answerIndex: number;
  onUpdate: (id: string | undefined, data: Partial<UpdateCycleAnswerDto>) => Promise<void>;
  onDelete: (id: string | undefined) => void;
  isSaving?: boolean;
}

export const AnswerEditor = ({
  answer,
  answerIndex,
  onUpdate,
  onDelete,
  isSaving = false,
}: AnswerEditorProps) => {
  // Estado local de edición
  const [isEditing, setIsEditing] = useState(false);
  const [localAnswerText, setLocalAnswerText] = useState(answer.answer_text || '');
  const [localIsCorrect, setLocalIsCorrect] = useState(answer.is_correct || false);
  const [localOndasReward, setLocalOndasReward] = useState(answer.ondas_reward || 0);

  // Sincronizar estado local cuando cambia la respuesta
  useEffect(() => {
    if (!isEditing) {
      setLocalAnswerText(answer.answer_text || '');
      setLocalIsCorrect(answer.is_correct || false);
      setLocalOndasReward(answer.ondas_reward || 0);
    }
  }, [answer, isEditing]);

  // Handlers
  const handleStartEdit = () => setIsEditing(true);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setLocalAnswerText(answer.answer_text || '');
    setLocalIsCorrect(answer.is_correct || false);
    setLocalOndasReward(answer.ondas_reward || 0);
  };

  const handleSaveEdit = async () => {
    await onUpdate(answer.id, {
      answer_text: localAnswerText.trim(),
      is_correct: localIsCorrect,
      ondas_reward: localOndasReward,
    });
    setIsEditing(false);
  };

  const isValid = localAnswerText.trim() !== '' && localOndasReward >= 0;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        bgcolor: answer.is_correct ? 'success.lighter' : 'transparent',
        borderRadius: 1,
        mb: 1,
        p: 2,
      }}
    >
      <Typography variant="body2" sx={{ minWidth: 30 }}>
        {answerIndex + 1}.
      </Typography>

      {isEditing ? (
        // Modo edición
        <>
          <TextField
            fullWidth
            size="small"
            label="Texto de la respuesta"
            value={localAnswerText}
            onChange={(e) => setLocalAnswerText(e.target.value)}
            error={!localAnswerText.trim()}
            helperText={!localAnswerText.trim() ? 'El texto es requerido' : ''}
          />
          <TextField
            type="number"
            size="small"
            label="Öndas"
            value={localOndasReward}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              setLocalOndasReward(Math.max(0, value));
            }}
            sx={{ width: 100 }}
            inputProps={{ min: 0 }}
            error={localOndasReward < 0}
            helperText={localOndasReward < 0 ? 'Debe ser ≥ 0' : ''}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={localIsCorrect}
                onChange={(e) => setLocalIsCorrect(e.target.checked)}
                size="small"
              />
            }
            label="Correcta"
          />
          <Tooltip title="Guardar cambios">
            <span>
              <IconButton
                size="small"
                onClick={handleSaveEdit}
                color="primary"
                disabled={isSaving || !isValid}
              >
                <SaveIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Cancelar edición">
            <IconButton
              size="small"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        // Modo visualización
        <>
          <Typography sx={{ flex: 1 }}>{answer.answer_text || '(Sin texto)'}</Typography>
          <Typography variant="body2" sx={{ minWidth: 80 }}>
            {answer.ondas_reward ?? 0} öndas
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={answer.is_correct ?? false}
                disabled
                size="small"
              />
            }
            label="Correcta"
          />
          <Tooltip title="Editar respuesta">
            <IconButton
              size="small"
              onClick={handleStartEdit}
              disabled={isSaving}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar respuesta">
            <IconButton
              size="small"
              onClick={() => onDelete(answer.id)}
              color="error"
              disabled={isSaving}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Box>
  );
}; 