export interface LLMMessageType {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
