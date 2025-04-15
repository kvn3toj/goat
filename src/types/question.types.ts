export type QuestionType = 'multiple_choice' | 'true_false' | 'a_b' | 'quiz';

export interface CycleAnswer {
  id: string;
  question_cycle_id: string;
  answer_text: string;
  is_correct: boolean;
  ondas_reward: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionCycle {
  id: string;
  item_question_id: string;
  delay_seconds: number;
  duration_seconds: number;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemQuestion {
  id: string;
  item_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'open_ended';
  display_timestamp: number;
  order_index: number;
  language: string;
  show_subtitles: boolean;
  show_question: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCycleAnswerDto {
  question_cycle_id: string;
  answer_text: string;
  is_correct: boolean;
  ondas_reward: number;
  order_index: number;
}

export interface CreateQuestionCycleDto {
  item_question_id: string;
  delay_seconds: number;
  duration_seconds: number;
  order_index: number;
  is_active: boolean;
}

export interface CreateItemQuestionDto {
  item_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'open_ended';
  display_timestamp: number;
  order_index: number;
  language?: string;
  show_subtitles?: boolean;
  show_question?: boolean;
}

export interface UpdateCycleAnswerDto extends Partial<CreateCycleAnswerDto> {
  id: string;
}

export interface UpdateQuestionCycleDto extends Partial<CreateQuestionCycleDto> {
  id: string;
}

export interface UpdateItemQuestionDto {
  id: string;
  question_text?: string;
  question_type?: 'multiple_choice' | 'true_false' | 'open_ended';
  display_timestamp?: number;
  order_index?: number;
  language?: string;
  show_subtitles?: boolean;
  show_question?: boolean;
} 