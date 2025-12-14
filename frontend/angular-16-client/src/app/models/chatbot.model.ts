export interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  userId?: string;
  messageType: 'text' | 'quick_reply' | 'suggestion';
}

export interface QuickReply {
  id: string;
  text: string;
  payload: string;
}

export interface ChatSession {
  id: string;
  userId?: string;
  messages: ChatMessage[];
  isActive: boolean;
  startTime: Date;
  endTime?: Date;
  context: ChatContext;
}

export interface ChatContext {
  currentTopic?: string;
  userIntent?: string;
  previousQueries: string[];
  escalationNeeded: boolean;
}

export interface BotResponse {
  message: string;
  quickReplies?: QuickReply[];
  suggestions?: string[];
  escalate?: boolean;
}
