import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AiQuestionService } from '../../services/ai-question.service';
import { AiQuestionRequest } from '../../models/models';

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

@Component({
  selector: 'app-ai-question-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, MatProgressSpinnerModule, TranslateModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-icon">
          <mat-icon>auto_awesome</mat-icon>
        </div>
        <div>
          <h1>{{ 'AI_GENERATOR.TITLE' | translate }}</h1>
          <p class="subtitle">{{ 'AI_GENERATOR.SUBTITLE' | translate }}</p>
        </div>
      </div>

      <div class="content-grid">
        <!-- Config Panel -->
        <div class="config-panel">
          <h3>{{ 'AI_GENERATOR.CONFIG_TITLE' | translate }}</h3>

          <div class="form-group">
            <label>{{ 'AI_GENERATOR.TOPIC' | translate }}</label>
            <select [(ngModel)]="topicChoice" (ngModelChange)="onTopicChoiceChange()">
              <option value="Chemical Bonds">{{ 'AI_GENERATOR.TOPICS.BONDS' | translate }}</option>
              <option value="Molecular Geometry">{{ 'AI_GENERATOR.TOPICS.GEOMETRY' | translate }}</option>
              <option value="Redox Reactions">{{ 'AI_GENERATOR.TOPICS.REDOX' | translate }}</option>
              <option value="Acid-Base Chemistry">{{ 'AI_GENERATOR.TOPICS.ACID_BASE' | translate }}</option>
              <option value="Thermochemistry">{{ 'AI_GENERATOR.TOPICS.THERMO' | translate }}</option>
              <option value="Organic Chemistry">{{ 'AI_GENERATOR.TOPICS.ORGANIC' | translate }}</option>
              <option value="Electrochemistry">{{ 'AI_GENERATOR.TOPICS.ELECTRO' | translate }}</option>
              <option [value]="CUSTOM_TOPIC">{{ 'AI_GENERATOR.TOPICS.CUSTOM' | translate }}</option>
            </select>
          </div>

          @if (topicChoice === CUSTOM_TOPIC) {
            <div class="form-group">
              <label>{{ 'AI_GENERATOR.CUSTOM_TOPIC_LABEL' | translate }}</label>
              <input type="text" [(ngModel)]="customTopic" maxlength="120"
                     [placeholder]="'AI_GENERATOR.CUSTOM_TOPIC_PH' | translate" />
              <span class="field-hint">{{ 'AI_GENERATOR.CUSTOM_TOPIC_HINT' | translate }}</span>
            </div>
          }

          <div class="form-group">
            <label>{{ 'AI_GENERATOR.DIFFICULTY' | translate }}</label>
            <div class="difficulty-chips">
              @for (level of difficulties; track level) {
                <button class="chip" [class.active]="request.difficulty === level"
                        (click)="request.difficulty = level">
                  {{ 'AI_GENERATOR.DIFFICULTIES.' + level | translate }}
                </button>
              }
            </div>
          </div>

          <div class="form-group">
            <label>{{ 'AI_GENERATOR.COUNT' | translate }}</label>
            <input type="number" [(ngModel)]="request.count" min="1" max="20" />
          </div>

          <button class="generate-btn" (click)="generate()" [disabled]="loading || !resolvedTopic()">
            @if (loading) {
              <mat-spinner diameter="20"></mat-spinner>
              {{ 'AI_GENERATOR.GENERATING' | translate }}
            } @else {
              <mat-icon>auto_awesome</mat-icon>
              {{ 'AI_GENERATOR.GENERATE_BTN' | translate }}
            }
          </button>
        </div>

        <!-- Results Panel -->
        <div class="results-panel">
          @if (!questions.length && !loading) {
            <div class="empty-state">
              <mat-icon>quiz</mat-icon>
              <h3>{{ 'AI_GENERATOR.EMPTY_TITLE' | translate }}</h3>
              <p>{{ 'AI_GENERATOR.EMPTY_DESC' | translate }}</p>
            </div>
          }

          @if (loading) {
            <div class="empty-state">
              <mat-spinner diameter="40"></mat-spinner>
              <h3>{{ 'AI_GENERATOR.GENERATING_STATE' | translate }}</h3>
              <p>{{ 'AI_GENERATOR.GENERATING_FOR' | translate:{topic: request.topic} }}</p>
            </div>
          }

          @if (questions.length && !loading) {
            <div class="results-header">
              <h3>{{ 'AI_GENERATOR.GENERATED_HEADER' | translate:{count: questions.length} }}</h3>
              <span class="topic-tag">{{ request.topic }} &middot; {{ 'AI_GENERATOR.DIFFICULTIES.' + request.difficulty | translate }}</span>
            </div>

            @for (q of questions; track q.question; let i = $index) {
              <div class="question-card">
                <div class="q-number">Q{{ i + 1 }}</div>
                <div class="q-body">
                  <p class="q-text">{{ q.question }}</p>

                  <div class="options-list">
                    @for (opt of q.options; track opt; let j = $index) {
                      <button type="button" class="option-item"
                           [class.correct]="isRevealed(i) && j === q.correctAnswer"
                           [class.wrong]="selectedMap[i] === j && j !== q.correctAnswer"
                           [class.selected]="selectedMap[i] === j"
                           [class.revealed]="isRevealed(i)"
                           (click)="selectOption(i, j)">
                        <span class="opt-letter">{{ optionLetters[j] }}</span>
                        <span class="opt-text">{{ opt }}</span>
                        @if (isRevealed(i) && j === q.correctAnswer) {
                          <mat-icon class="check-icon">check_circle</mat-icon>
                        } @else if (selectedMap[i] === j) {
                          <mat-icon class="check-icon wrong-icon">cancel</mat-icon>
                        }
                      </button>
                    }
                  </div>

                  @if (isRevealed(i)) {
                    <div class="explanation">
                      <mat-icon>lightbulb</mat-icon>
                      <span>{{ q.explanation }}</span>
                    </div>
                  }

                  <button class="reveal-btn" (click)="revealedMap[i] = !revealedMap[i]">
                    {{ (revealedMap[i] ? 'AI_GENERATOR.HIDE_ANSWER' : 'AI_GENERATOR.SHOW_ANSWER') | translate }}
                  </button>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper { width: 100%; max-width: var(--page-max-mid); margin: 0 auto; padding: 32px var(--page-gutter) 60px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .header-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: #1E3932; color: white; flex-shrink: 0; }
    .header-icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: #006241; margin: 0 0 4px; letter-spacing: -0.01em; }
    .subtitle { font-size: 13px; color: rgba(0,0,0,0.58); margin: 0; }
    .content-grid { display: grid; grid-template-columns: 300px 1fr; gap: 24px; align-items: start; }
    .config-panel { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); position: sticky; top: 100px; }
    .config-panel h3 { font-size: 1rem; font-weight: 700; color: #006241; margin: 0 0 20px; letter-spacing: -0.01em; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.70); margin-bottom: 6px; letter-spacing: -0.01em; }
    .form-group select, .form-group input[type="number"] { width: 100%; padding: 9px 13px; border: 1px solid #d6dbde; border-radius: 8px; background: #f9f9f9; font-size: 14px; font-family: inherit; color: rgba(0,0,0,0.87); transition: border-color 0.2s; box-sizing: border-box; outline: none; }
    .form-group select:focus, .form-group input:focus { border-color: #00754A; box-shadow: 0 0 0 3px rgba(0,117,74,0.10); background: white; }
    .field-hint { font-size: 12px; color: rgba(0,0,0,0.40); margin-top: 2px; }
    .difficulty-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .chip { padding: 6px 14px; border: 1px solid #edebe9; border-radius: 50px; background: white; font-size: 13px; font-weight: 500; font-family: inherit; color: rgba(0,0,0,0.70); cursor: pointer; transition: all 0.2s; }
    .chip:hover { border-color: #a8d8c5; background: #f2f0eb; }
    .chip.active { background: #00754A; color: white; border-color: #00754A; }
    .generate-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border: 1px solid #00754A; border-radius: 50px; background: #00754A; color: white; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em; }
    .generate-btn:hover:not(:disabled) { background: #006241; border-color: #006241; }
    .generate-btn:active:not(:disabled) { transform: scale(0.95); }
    .generate-btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .generate-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .results-panel { min-height: 400px; }
    .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .results-header h3 { font-size: 1rem; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0; letter-spacing: -0.01em; }
    .topic-tag { font-size: 13px; color: rgba(0,0,0,0.58); background: #edebe9; padding: 4px 12px; border-radius: 50px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px 24px; background: white; border-radius: 12px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: rgba(0,0,0,0.20); margin-bottom: 16px; }
    .empty-state h3 { font-size: 1rem; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0 0 6px; letter-spacing: -0.01em; }
    .empty-state p { font-size: 14px; color: rgba(0,0,0,0.40); margin: 0; }
    .question-card { display: flex; gap: 16px; background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .q-number { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: #d4e9e2; color: #006241; font-size: 13px; font-weight: 700; flex-shrink: 0; }
    .q-body { flex: 1; }
    .q-text { font-size: 0.95rem; font-weight: 600; color: rgba(0,0,0,0.87); margin: 0 0 14px; line-height: 1.5; letter-spacing: -0.01em; }
    .options-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
    .option-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 14px; background: #f9f9f9; border: 1px solid #edebe9; border-radius: 10px; font-size: 14px; font-family: inherit; color: rgba(0,0,0,0.87); text-align: left; cursor: pointer; transition: all 0.2s; }
    .option-item:hover { border-color: #a8d8c5; background: #f2f0eb; }
    .option-item:active { transform: scale(0.99); }
    .opt-text { flex: 1; }
    .option-item.selected { border-color: #00754A; }
    .option-item.revealed.correct { background: #d4e9e2; border-color: #00754A; color: #006241; }
    .option-item.wrong { background: rgba(200,32,20,0.06); border-color: #c82014; color: #c82014; }
    .option-item.wrong .opt-letter { background: #c82014; color: white; }
    .wrong-icon { color: #c82014; }
    .opt-letter { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: #edebe9; color: rgba(0,0,0,0.58); font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .option-item.revealed.correct .opt-letter { background: #00754A; color: white; }
    .check-icon { margin-left: auto; font-size: 18px; width: 18px; height: 18px; color: #00754A; }
    .explanation { display: flex; gap: 8px; padding: 12px 14px; background: #faf6ee; border: 1px solid #dfc49d; border-radius: 10px; font-size: 13px; color: #a07c3e; margin-bottom: 12px; }
    .explanation mat-icon { font-size: 18px; width: 18px; height: 18px; color: #cba258; flex-shrink: 0; margin-top: 1px; }
    .reveal-btn { padding: 6px 16px; border: 1px solid #a8d8c5; border-radius: 50px; background: #d4e9e2; font-size: 13px; font-weight: 600; font-family: inherit; color: #006241; cursor: pointer; transition: all 0.2s; }
    .reveal-btn:hover { background: #00754A; color: white; border-color: #00754A; }
    @media (max-width: 768px) { .content-grid { grid-template-columns: 1fr; } .config-panel { position: static; } }
  `]
})
export class AiQuestionGeneratorComponent implements OnInit {
  /** Gia tri dac biet cho muc "chu de khac" trong dropdown. */
  readonly CUSTOM_TOPIC = '__CUSTOM__';

  request: AiQuestionRequest = { topic: 'Chemical Bonds', difficulty: 'MEDIUM', count: 5 };
  /** Lua chon trong dropdown (co the la CUSTOM_TOPIC). */
  topicChoice = 'Chemical Bonds';
  /** Chu de do nguoi dung tu nhap khi chon "chu de khac". */
  customTopic = '';
  difficulties = ['EASY', 'MEDIUM', 'HARD'];
  optionLetters = ['A', 'B', 'C', 'D'];
  questions: GeneratedQuestion[] = [];
  loading = false;
  revealedMap: Record<number, boolean> = {};
  selectedMap: Record<number, number> = {};

  constructor(
    private aiService: AiQuestionService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {}

  onTopicChoiceChange(): void {
    if (this.topicChoice !== this.CUSTOM_TOPIC) {
      this.customTopic = '';
    }
  }

  /** Chu de thuc su gui len API: chu de tu nhap hoac muc chon san. */
  resolvedTopic(): string {
    return this.topicChoice === this.CUSTOM_TOPIC
      ? this.customTopic.trim()
      : this.topicChoice;
  }

  // An option is shown as answered once the user picks one, or asks to reveal it.
  isRevealed(index: number): boolean {
    return this.revealedMap[index] || this.selectedMap[index] !== undefined;
  }

  selectOption(index: number, optionIndex: number): void {
    this.selectedMap[index] = optionIndex;
  }

  generate(): void {
    const topic = this.resolvedTopic();
    if (!topic) return;

    this.request.topic = topic;
    this.loading = true;
    this.questions = [];
    this.revealedMap = {};
    this.selectedMap = {};
    this.aiService.generateQuestions(this.request).subscribe({
      next: (data: any[]) => {
        this.questions = data.map(q => ({
          question: q.question,
          options: [q.optionA, q.optionB, q.optionC, q.optionD],
          correctAnswer: this.optionLetters.indexOf(q.correctAnswer),
          explanation: q.explanation || `${this.translate.instant('QUIZ.CORRECT_ANSWER')} ${q.correctAnswer}`
        }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
