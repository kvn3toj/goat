import { supabase } from './supabaseClient';
import {
  ItemQuestion,
  CreateItemQuestionDto,
  UpdateItemQuestionDto,
  QuestionCycle,
  CreateQuestionCycleDto,
  UpdateQuestionCycleDto,
  CycleAnswer,
  CreateCycleAnswerDto,
  UpdateCycleAnswerDto
} from '../types/question.types';

// Item Questions CRUD
export const fetchItemQuestions = async (itemId: string): Promise<ItemQuestion[]> => {
  const { data, error } = await supabase
    .from('item_questions')
    .select('*')
    .eq('item_id', itemId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createItemQuestion = async (dto: CreateItemQuestionDto): Promise<ItemQuestion> => {
  const { data, error } = await supabase
    .from('item_questions')
    .insert({
      ...dto,
      language: dto.language || 'es',
      show_subtitles: dto.show_subtitles || false,
      show_question: dto.show_question ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateItemQuestion = async (dto: UpdateItemQuestionDto): Promise<ItemQuestion> => {
  const { id, ...updateData } = dto;
  console.log('[updateItemQuestion] Actualizando pregunta ID:', id, 'con datos:', updateData);

  const { data, error } = await supabase
    .from('item_questions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  console.log('[updateItemQuestion] Resultado Supabase:', { data, error });

  if (error) throw error;
  return data;
};

export const deleteItemQuestion = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('item_questions')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Question Cycles CRUD
export const fetchQuestionCycles = async (questionId: string): Promise<QuestionCycle[]> => {
  const { data, error } = await supabase
    .from('question_cycles')
    .select('*')
    .eq('item_question_id', questionId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createQuestionCycle = async (dto: CreateQuestionCycleDto): Promise<QuestionCycle> => {
  console.log('[createQuestionCycle] Intentando insertar datos:', JSON.stringify(dto, null, 2));

  const { data, error } = await supabase
    .from('question_cycles')
    .insert([dto])
    .select()
    .single();

  if (error) {
    console.error('[createQuestionCycle] Error Supabase:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }
  return data;
};

export const updateQuestionCycle = async (dto: UpdateQuestionCycleDto): Promise<QuestionCycle> => {
  const { id, ...updateData } = dto;
  const { data, error } = await supabase
    .from('question_cycles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteQuestionCycle = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('question_cycles')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Cycle Answers CRUD
export const fetchCycleAnswers = async (cycleId: string): Promise<CycleAnswer[]> => {
  const { data, error } = await supabase
    .from('cycle_answers')
    .select('*')
    .eq('question_cycle_id', cycleId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createCycleAnswer = async (dto: CreateCycleAnswerDto): Promise<CycleAnswer> => {
  const { data, error } = await supabase
    .from('cycle_answers')
    .insert([dto])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCycleAnswer = async (dto: UpdateCycleAnswerDto): Promise<CycleAnswer> => {
  const { id, ...updateData } = dto;
  const { data, error } = await supabase
    .from('cycle_answers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCycleAnswer = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('cycle_answers')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Bulk Operations
export const fetchQuestionWithDetails = async (questionId: string): Promise<ItemQuestion> => {
  const { data: question, error: questionError } = await supabase
    .from('item_questions')
    .select('*')
    .eq('id', questionId)
    .single();

  if (questionError) throw questionError;

  const { data: cycles, error: cyclesError } = await supabase
    .from('question_cycles')
    .select('*')
    .eq('question_id', questionId)
    .order('cycle_order');

  if (cyclesError) throw cyclesError;

  const cyclesWithAnswers = await Promise.all(
    cycles.map(async (cycle) => {
      const { data: answers, error: answersError } = await supabase
        .from('cycle_answers')
        .select('*')
        .eq('cycle_id', cycle.id)
        .order('answer_order');

      if (answersError) throw answersError;
      return { ...cycle, answers };
    })
  );

  return { ...question, cycles: cyclesWithAnswers };
}; 