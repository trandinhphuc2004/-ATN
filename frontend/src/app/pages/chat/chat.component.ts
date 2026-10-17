import { Component, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../models/models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule,
    TranslateModule
  ],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-icon">
          <mat-icon>smart_toy</mat-icon>
        </div>
        <div>
          <h1>{{ 'CHAT.TITLE' | translate }}</h1>
          <p>{{ 'CHAT.SUBTITLE' | translate }}</p>
        </div>
      </div>

      <div class="suggestions">
        <span class="suggest-label">{{ 'CHAT.SUGGEST_LABEL' | translate }}</span>
        <div class="suggest-chips">
          @for (suggestion of suggestions; track suggestion) {
            <button class="suggest-chip" (click)="askSuggestion(suggestion)">{{ suggestion }}</button>
          }
        </div>
      </div>

      <div class="chat-card">
        <div class="chat-container" #chatContainer>
          @if (messages.length === 0) {
            <div class="empty-state">
              <div class="empty-icon">
                <mat-icon>science</mat-icon>
              </div>
              <p [innerHTML]="'CHAT.EMPTY_STATE' | translate"></p>
            </div>
          }

          @for (msg of messages; track $index) {
            <div class="chat-message" [class.user]="msg.sender === 'user'" [class.bot]="msg.sender === 'bot'">
              <div class="msg-avatar" [class.user-avatar]="msg.sender === 'user'">
                <mat-icon>{{ msg.sender === 'user' ? 'person' : 'smart_toy' }}</mat-icon>
              </div>
              <div class="msg-bubble">
                <span class="msg-sender">{{ msg.sender === 'user' ? ('CHAT.YOU' | translate) : ('CHAT.AI_TUTOR' | translate) }}</span>
                <div class="msg-text" [innerHTML]="formatMessage(msg.text)"></div>
              </div>
            </div>
          }

          @if (loading) {
            <div class="chat-message bot">
              <div class="msg-avatar">
                <mat-icon>smart_toy</mat-icon>
              </div>
              <div class="msg-bubble typing-bubble">
                <div class="typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          }
        </div>

        <div class="chat-input">
          <input type="text" [(ngModel)]="question"
                 (keyup.enter)="sendMessage()"
                 [disabled]="loading"
                 [placeholder]="'CHAT.INPUT_PLACEHOLDER' | translate"
                 class="chat-text-input">
          <button class="send-btn" (click)="sendMessage()"
                  [disabled]="!question.trim() || loading">
            <mat-icon>send</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper { width: 100%; max-width: var(--page-max-text); margin: 0 auto; padding: 40px var(--page-gutter) 60px; }
    .page-header { display: flex; align-items: center; gap: 18px; margin-bottom: 24px; }
    .header-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: #1E3932; color: white; flex-shrink: 0; }
    .header-icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: #006241; margin: 0 0 4px; letter-spacing: -0.01em; }
    .page-header p { font-size: 0.9rem; color: rgba(0,0,0,0.58); margin: 0; }
    .suggestions { margin-bottom: 24px; }
    .suggest-label { font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.58); margin-bottom: 10px; display: block; }
    .suggest-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .suggest-chip { padding: 6px 14px; font-size: 13px; font-weight: 500; font-family: inherit; color: #006241; background: #d4e9e2; border: 1px solid #a8d8c5; border-radius: 50px; cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em; }
    .suggest-chip:hover { background: #00754A; color: white; border-color: #00754A; }
    .chat-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .chat-container { max-height: 480px; overflow-y: auto; padding: 24px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 48px 0; color: rgba(0,0,0,0.40); }
    .empty-icon { display: flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 50%; background: #d4e9e2; color: #006241; margin-bottom: 16px; }
    .empty-icon mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .empty-state p { text-align: center; line-height: 1.6; font-size: 15px; }
    .chat-message { display: flex; gap: 12px; margin-bottom: 20px; max-width: 85%; }
    .chat-message.user { margin-left: auto; flex-direction: row-reverse; }
    .msg-avatar { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: #edebe9; color: rgba(0,0,0,0.58); flex-shrink: 0; }
    .msg-avatar.user-avatar { background: #1E3932; color: white; }
    .msg-avatar mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .msg-bubble { padding: 12px 16px; border-radius: 14px; }
    .chat-message.user .msg-bubble { background: #1E3932; color: white; border-bottom-right-radius: 4px; }
    .chat-message.bot .msg-bubble { background: #f2f0eb; color: rgba(0,0,0,0.87); border-bottom-left-radius: 4px; }
    .msg-sender { display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; opacity: 0.7; }
    .msg-bubble p { margin: 0; font-size: 14px; line-height: 1.55; }
    .typing-bubble { padding: 16px 20px; }
    .typing-dots { display: flex; gap: 4px; }
    .typing-dots span { width: 8px; height: 8px; border-radius: 50%; background: rgba(0,0,0,0.30); animation: dot-bounce 1.4s infinite; }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dot-bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
    .chat-input { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-top: 1px solid #edebe9; background: #f9f9f9; }
    .chat-text-input { flex: 1; padding: 12px 16px; font-size: 15px; font-family: inherit; border: 1px solid #d6dbde; border-radius: 50px; background: white; color: rgba(0,0,0,0.87); outline: none; transition: all 0.2s; }
    .chat-text-input::placeholder { color: rgba(0,0,0,0.40); }
    .chat-text-input:focus { border-color: #00754A; box-shadow: 0 0 0 3px rgba(0,117,74,0.10); }
    .send-btn { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border: none; border-radius: 50%; background: #00754A; color: white; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
    .send-btn:hover:not(:disabled) { background: #006241; }
    .send-btn:active:not(:disabled) { transform: scale(0.95); }
    .send-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .send-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }
    @media (max-width: 640px) { .page-wrapper { padding: 24px 16px 40px; } .chat-message { max-width: 92%; } }
  `]
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('chatContainer') private chatScrollContainer!: ElementRef;
  messages: ChatMessage[] = [];
  question = '';
  loading = false;
  suggestions: string[] = [];
  private shouldScroll = false;

  constructor(
    private chatService: ChatService,
    private translate: TranslateService
  ) {
    this.translate.onLangChange.subscribe(() => {
      this.initSuggestions();
    });
    this.initSuggestions();
  }

  ngAfterViewChecked() {
    // Chi cuon xuong khi that su co noi dung moi. Neu cuon moi lan change detection
    // chay thi nguoi dung khong the cuon nguoc len xem lai tin nhan cu.
    if (this.shouldScroll) {
      this.shouldScroll = false;
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    try {
      this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  private initSuggestions() {
    this.suggestions = [
      this.translate.instant('CHAT.SUGGESTIONS.NH3'),
      this.translate.instant('CHAT.SUGGESTIONS.WATER'),
      this.translate.instant('CHAT.SUGGESTIONS.COVALENT'),
      this.translate.instant('CHAT.SUGGESTIONS.CO2'),
      this.translate.instant('CHAT.SUGGESTIONS.IONIC_COVALENT')
    ];
  }

  askSuggestion(suggestion: string): void {
    this.question = suggestion;
    this.sendMessage();
  }

  sendMessage(): void {
    const text = this.question.trim();
    if (!text) return;

    this.messages.push({ text, sender: 'user', timestamp: new Date() });
    this.question = '';
    this.loading = true;
    this.shouldScroll = true;

    this.chatService.sendMessage(text).subscribe({
      next: (response) => {
        this.messages.push({ text: response.answer, sender: 'bot', timestamp: new Date() });
        this.loading = false;
        this.shouldScroll = true;
      },
      error: () => {
        this.messages.push({
          text: this.translate.instant('CHAT.ERROR'),
          sender: 'bot',
          timestamp: new Date()
        });
        this.loading = false;
        this.shouldScroll = true;
      }
    });
  }

  formatMessage(text: string): string {
    if (!text) return '';
    // Replace **text** with <b>text</b>
    return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  }
}
