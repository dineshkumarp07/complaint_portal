import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatbotService } from '../../services/chatbot.service';
import { ChatMessage, ChatSession, BotResponse, QuickReply } from '../../models/chatbot.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  currentSession: ChatSession | null = null;
  messages: ChatMessage[] = [];
  userInput: string = '';
  isTyping: boolean = false;
  isChatMinimized: boolean = false;
  isChatOpen: boolean = false;
  
  private subscription: Subscription = new Subscription();

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.chatbotService.getCurrentSession().subscribe(session => {
        this.currentSession = session;
        this.messages = session?.messages || [];
      })
    );
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.currentSession) {
      this.chatbotService.endSession(this.currentSession.id);
    }
  }

  openChat(): void {
    this.isChatOpen = true;
    this.isChatMinimized = false;
    
    if (!this.currentSession) {
      this.startNewChat();
    }
  }

  closeChat(): void {
    this.isChatOpen = false;
    if (this.currentSession) {
      this.chatbotService.endSession(this.currentSession.id);
    }
  }

  minimizeChat(): void {
    this.isChatMinimized = true;
  }

  maximizeChat(): void {
    this.isChatMinimized = false;
  }

  startNewChat(): void {
    this.chatbotService.startNewSession().subscribe(session => {
      this.currentSession = session;
      this.messages = session.messages;
    });
  }

  sendMessage(): void {
    if (!this.userInput.trim() || !this.currentSession) {
      return;
    }

    const message = this.userInput.trim();
    this.userInput = '';
    this.isTyping = true;

    this.chatbotService.sendMessage(message, this.currentSession.id).subscribe(
      (response: BotResponse) => {
        this.isTyping = false;
        // Messages are automatically updated through the service subscription
      },
      (error) => {
        this.isTyping = false;
        console.error('Error sending message:', error);
      }
    );
  }

  sendQuickReply(quickReply: QuickReply): void {
    if (!this.currentSession) {
      return;
    }

    this.isTyping = true;
    this.chatbotService.sendMessage(quickReply.text, this.currentSession.id).subscribe(
      (response: BotResponse) => {
        this.isTyping = false;
      },
      (error) => {
        this.isTyping = false;
        console.error('Error sending quick reply:', error);
      }
    );
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getQuickRepliesFromLastBotMessage(): QuickReply[] {
    const lastBotMessage = [...this.messages]
      .reverse()
      .find(msg => msg.isBot && msg.messageType === 'quick_reply');
    
    // For demo purposes, return some quick replies based on message content
    if (lastBotMessage?.content.includes('category')) {
      return [
        { id: '1', text: 'Academic Issues', payload: 'academic' },
        { id: '2', text: 'Hostel Problems', payload: 'hostel' },
        { id: '3', text: 'Cafeteria Issues', payload: 'cafeteria' },
        { id: '4', text: 'Transport Problems', payload: 'transport' }
      ];
    }
    
    if (lastBotMessage?.content.includes('help')) {
      return [
        { id: '1', text: 'File a Complaint', payload: 'file_complaint' },
        { id: '2', text: 'Track Complaint', payload: 'track_complaint' },
        { id: '3', text: 'FAQ', payload: 'faq' },
        { id: '4', text: 'Contact Support', payload: 'contact_support' }
      ];
    }

    return [];
  }
}
