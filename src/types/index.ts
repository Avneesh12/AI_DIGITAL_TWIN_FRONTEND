// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Re-export ChatHistoryItem as ChatMessage for use in chat components
export interface ChatHistoryItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

// ─── Personality ─────────────────────────────────────────────────────────────

export interface PersonalityProfile {
  id: string;
  user_id: string;
  tone: string | null;
  communication_style: string | null;
  values: string[];
  interests: string[];
  decision_style: string | null;
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  persona_summary: string | null;
  trait_confidence: number;
}

export interface PersonalityUpdate {
  tone?: string;
  communication_style?: string;
  values?: string[];
  interests?: string[];
  decision_style?: string;
  openness?: number;
  conscientiousness?: number;
  extraversion?: number;
  agreeableness?: number;
  neuroticism?: number;
  persona_summary?: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  // Client-side only fields
  isStreaming?: boolean;
  isPending?: boolean;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  chat_id: string;
  memories_used: number;
  tokens_used: number;
}

export interface ChatSession {
  session_id: string;
  preview: string;
  message_count: number;
  last_message_at: string;
}

// ─── Memory ──────────────────────────────────────────────────────────────────

export interface MemoryEntry {
  point_id: string;
  user_message: string;
  assistant_response: string;
  topic_tags: string[];
  emotional_tone: string | null;
  importance_score: number;
  created_at: string;
}

export interface MemorySearchResult extends MemoryEntry {
  score: number;
}

// ─── Decisions ───────────────────────────────────────────────────────────────

export interface Decision {
  id: string;
  user_id: string;
  context: string;
  chosen_option: string;
  reasoning: string | null;
  outcome: string | null;
  tags: string[];
  created_at: string;
}

// ─── API Error ───────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  message: string;
  detail: string | null;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface PageState<T> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}
