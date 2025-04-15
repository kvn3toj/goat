import { useState, useCallback } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { QuestionCycle } from '../../types/question.types';
import { AnswerList } from './AnswerList';

interface CycleEditorProps {
  cycle: Partial<QuestionCycle>;
  index: number;
  isExpanded: boolean;
  onExpandChange: (isExpanded: boolean) => void;
  onDeleteCycle: (cycleId: string | undefined) => void;
  onUpdateCycle: (cycleId: string | undefined, updates: Partial<QuestionCycle>) => void;
  isSaving?: boolean;
}

export const CycleEditor = ({
  cycle,
  index,
  isExpanded,
  onExpandChange,
  onDeleteCycle,
  onUpdateCycle,
  isSaving = false,
}: CycleEditorProps) => {
  // Handlers para eventos del ciclo
  const handleDelayChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = parseInt(e.target.value) || 0;
    onUpdateCycle(cycle.id, { delay_seconds: Math.max(0, value) });
  }, [cycle.id, onUpdateCycle]);

  const handleDurationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = parseInt(e.target.value) || 0;
    onUpdateCycle(cycle.id, { duration_seconds: Math.max(0, value) });
  }, [cycle.id, onUpdateCycle]);

  const handleActiveChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onUpdateCycle(cycle.id, { is_active: e.target.checked });
  }, [cycle.id, onUpdateCycle]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteCycle(cycle.id);
  }, [cycle.id, onDeleteCycle]);

  return (
    <Accordion
      expanded={isExpanded}
      onChange={(_, expanded) => onExpandChange(expanded)}
      sx={{ mb: 2 }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography sx={{ flex: 1 }}>Ciclo {index + 1}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small"
              type="number"
              label="Delay (s)"
              value={cycle.delay_seconds ?? 0}
              onChange={handleDelayChange}
              onClick={(e) => e.stopPropagation()}
              sx={{ width: 100 }}
              inputProps={{ min: 0 }}
              disabled={isSaving}
            />
            <TextField
              size="small"
              type="number"
              label="Duración (s)"
              value={cycle.duration_seconds ?? 0}
              onChange={handleDurationChange}
              onClick={(e) => e.stopPropagation()}
              sx={{ width: 100 }}
              inputProps={{ min: 0 }}
              disabled={isSaving}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={cycle.is_active ?? false}
                  onChange={handleActiveChange}
                  onClick={(e) => e.stopPropagation()}
                  disabled={isSaving}
                />
              }
              label="Activo"
            />
          </Box>
        </Box>
      </AccordionSummary>
      <Box sx={{ position: 'absolute', right: 48, top: 12 }}>
        <Tooltip title="Eliminar ciclo">
          <IconButton
            size="small"
            onClick={handleDelete}
            disabled={isSaving}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <AccordionDetails>
        {cycle.id && <AnswerList cycleId={cycle.id} />}
        {!cycle.id && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            Guarda los cambios del ciclo para poder agregar respuestas.
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
}; 