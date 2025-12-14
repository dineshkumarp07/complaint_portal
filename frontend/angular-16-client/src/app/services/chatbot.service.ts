import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import { ChatMessage, ChatSession, BotResponse, QuickReply } from '../models/chatbot.model';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private currentSession = new BehaviorSubject<ChatSession | null>(null);
  private sessions: ChatSession[] = [];

  // Knowledge base for bot responses
  private knowledgeBase = {
    greetings: [
      "Hello! I'm here to help you with your complaints and queries. How can I assist you today?",
      "Hi there! Welcome to the student support system. What can I help you with?",
      "Greetings! I'm your virtual assistant. How may I help you today?"
    ],
    complaints: {
      academic: "I can help you with academic issues. Common problems include course registration, grade disputes, and faculty concerns. Would you like to file a complaint or get guidance?",
      hostel: "For hostel-related issues like room allocation, maintenance, or facilities, I can guide you through the complaint process. What specific issue are you facing?",
      cafeteria: "Cafeteria complaints often involve food quality, hygiene, or service issues. I can help you report these concerns to the right department.",
      transport: "Transportation issues include bus schedules, route problems, or vehicle conditions. Let me help you address this concern.",
      general: "I'm here to help with any general concerns. Could you provide more details about your issue?"
    },
    quickReplies: {
      main: [
        { id: '1', text: 'File a Complaint', payload: 'file_complaint' },
        { id: '2', text: 'Track Complaint', payload: 'track_complaint' },
        { id: '3', text: 'FAQ', payload: 'faq' },
        { id: '4', text: 'Contact Support', payload: 'contact_support' }
      ],
      categories: [
        { id: '1', text: 'Academic Issues', payload: 'academic' },
        { id: '2', text: 'Hostel Problems', payload: 'hostel' },
        { id: '3', text: 'Cafeteria Issues', payload: 'cafeteria' },
        { id: '4', text: 'Transport Problems', payload: 'transport' },
        { id: '5', text: 'Other Issues', payload: 'general' }
      ]
    },
    faq: {
      "How to file a complaint?": "You can file a complaint by clicking 'Create Account' on the homepage, registering, and then submitting your complaint with all necessary details.",
      "How long does resolution take?": "Most complaints are resolved within 3-5 business days. Complex issues may take longer, and you'll be notified of any delays.",
      "Can I track my complaint?": "Yes! You can track your complaint status anytime by logging into your account and checking the complaints section.",
      "What if my complaint is not resolved?": "If your complaint isn't resolved within the expected timeframe, it will be automatically escalated to higher authorities.",
      "Is my complaint confidential?": "Yes, all complaints are treated confidentially and only shared with relevant personnel for resolution."
    }
  };

  constructor() {}

  startNewSession(userId?: string): Observable<ChatSession> {
    const session: ChatSession = {
      id: Date.now().toString(),
      userId,
      messages: [],
      isActive: true,
      startTime: new Date(),
      context: {
        previousQueries: [],
        escalationNeeded: false
      }
    };

    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      content: this.getRandomResponse(this.knowledgeBase.greetings),
      isBot: true,
      timestamp: new Date(),
      messageType: 'text'
    };

    session.messages.push(welcomeMessage);
    this.sessions.push(session);
    this.currentSession.next(session);

    return of(session);
  }

  sendMessage(message: string, sessionId: string): Observable<BotResponse> {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      return of({ message: "Session not found. Please start a new chat." });
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      isBot: false,
      timestamp: new Date(),
      messageType: 'text'
    };

    session.messages.push(userMessage);
    session.context.previousQueries.push(message.toLowerCase());

    // Generate bot response
    const botResponse = this.generateBotResponse(message, session);
    
    // Add bot message
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: botResponse.message,
      isBot: true,
      timestamp: new Date(),
      messageType: botResponse.quickReplies ? 'quick_reply' : 'text'
    };

    session.messages.push(botMessage);
    this.currentSession.next(session);

    return of(botResponse).pipe(delay(1000)); // Simulate thinking time
  }

  private generateBotResponse(message: string, session: ChatSession): BotResponse {
    const lowerMessage = message.toLowerCase();

    // Greeting detection
    if (this.containsWords(lowerMessage, ['hello', 'hi', 'hey', 'greetings'])) {
      return {
        message: this.getRandomResponse(this.knowledgeBase.greetings),
        quickReplies: this.knowledgeBase.quickReplies.main
      };
    }

    // Complaint filing
    if (this.containsWords(lowerMessage, ['file', 'complaint', 'submit', 'report'])) {
      session.context.currentTopic = 'filing_complaint';
      return {
        message: "I'll help you file a complaint. First, let me know what category your issue falls under:",
        quickReplies: this.knowledgeBase.quickReplies.categories
      };
    }

    // Category-specific responses
    if (lowerMessage.includes('academic')) {
      return { message: this.knowledgeBase.complaints.academic };
    }
    if (lowerMessage.includes('hostel')) {
      return { message: this.knowledgeBase.complaints.hostel };
    }
    if (lowerMessage.includes('cafeteria') || lowerMessage.includes('food')) {
      return { message: this.knowledgeBase.complaints.cafeteria };
    }
    if (lowerMessage.includes('transport') || lowerMessage.includes('bus')) {
      return { message: this.knowledgeBase.complaints.transport };
    }

    // FAQ handling
    if (this.containsWords(lowerMessage, ['faq', 'help', 'how', 'what', 'when'])) {
      const faqMatch = this.findFAQMatch(lowerMessage);
      if (faqMatch) {
        return { message: faqMatch };
      }
    }

    // Track complaint
    if (this.containsWords(lowerMessage, ['track', 'status', 'check', 'progress'])) {
      return {
        message: "To track your complaint, please log into your account and visit the 'View Complaints' section. You can see real-time updates on your complaint status there."
      };
    }

    // Escalation keywords
    if (this.containsWords(lowerMessage, ['urgent', 'escalate', 'manager', 'supervisor', 'not resolved'])) {
      session.context.escalationNeeded = true;
      return {
        message: "I understand this is urgent. I'm escalating your concern to our support team. You can also contact our support directly or file a formal complaint for faster resolution.",
        escalate: true
      };
    }

    // Default response with suggestions
    return {
      message: "I'm here to help! I can assist you with filing complaints, tracking existing complaints, answering frequently asked questions, or connecting you with support. What would you like to do?",
      quickReplies: this.knowledgeBase.quickReplies.main,
      suggestions: [
        "How to file a complaint?",
        "Track my complaint status",
        "Contact support team",
        "View FAQ"
      ]
    };
  }

  private containsWords(text: string, words: string[]): boolean {
    return words.some(word => text.includes(word));
  }

  private findFAQMatch(message: string): string | null {
    for (const [question, answer] of Object.entries(this.knowledgeBase.faq)) {
      if (this.containsWords(message, question.toLowerCase().split(' '))) {
        return answer;
      }
    }
    return null;
  }

  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getCurrentSession(): Observable<ChatSession | null> {
    return this.currentSession.asObservable();
  }

  endSession(sessionId: string): void {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.isActive = false;
      session.endTime = new Date();
      this.currentSession.next(null);
    }
  }

  getAllSessions(): ChatSession[] {
    return this.sessions;
  }
}
