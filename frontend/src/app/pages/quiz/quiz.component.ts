import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { QuizService } from '../../services/quiz.service';
import { AuthService } from '../../services/auth.service';
import { Question, QuizResult, AnswerItem, CreateQuestionRequest } from '../../models/models';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatRadioModule,
    MatProgressSpinnerModule, MatDividerModule, MatSelectModule, MatFormFieldModule,
    TranslateModule
  ],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-icon"><mat-icon>quiz</mat-icon></div>
        <div>
          <h1>{{ 'QUIZ.TITLE' | translate }}</h1>
          <p>{{ 'QUIZ.SUBTITLE' | translate }}</p>
        </div>
        @if (isAdminOrTeacher) {
          <button class="btn-manage" (click)="showManage = !showManage">
            <mat-icon>{{ showManage ? 'close' : 'tune' }}</mat-icon>
            {{ (showManage ? 'COMMON.CLOSE' : 'QUIZ.MANAGE_QUESTIONS') | translate }}
          </button>
        }
      </div>

      <!-- Admin/Teacher: Manage Questions Panel -->
      @if (showManage && isAdminOrTeacher) {
        <div class="manage-panel">
          <div class="manage-header">
            <h2>{{ 'QUIZ.QUIZ_QUESTIONS' | translate }}</h2>
            <button class="btn-add" (click)="openCreateQuestion()"><mat-icon>add</mat-icon> {{ 'QUIZ.ADD_QUESTION' | translate }}</button>
          </div>
          <div class="questions-list">
            @for (q of allQuestions; track q.id) {
              <div class="q-item">
                <div class="q-text">{{ q.question }}</div>
                <div class="q-meta">
                  @if (q.topic) { <span class="q-badge topic">{{ q.topic }}</span> }
                  @if (q.difficulty) { <span class="q-badge diff">{{ q.difficulty }}</span> }
                  <span class="q-badge answer">{{ 'QUIZ.ANSWER_SHORT' | translate }} {{ q.correctAnswer }}</span>
                </div>
                <button class="btn-icon-del" (click)="confirmDeleteQuestion(q)" [title]="'COMMON.DELETE' | translate"><mat-icon>delete</mat-icon></button>
              </div>
            }
            @if (allQuestions.length === 0) {
              <div class="empty-msg">{{ 'QUIZ.NO_QUESTIONS' | translate }}</div>
            }
          </div>
        </div>
      }

      @if (!quizStarted && !result) {
        <div class="setup-card">
          <div class="setup-inner">
            <h2>{{ 'QUIZ.READY' | translate }}</h2>
            <p class="setup-desc">{{ 'QUIZ.CHOOSE_TOPIC' | translate }}</p>
            <div class="form-group">
              <label for="topic">{{ 'QUIZ.TOPIC_LABEL' | translate }}</label>
              <select id="topic" [(ngModel)]="selectedTopic" class="form-select" (change)="loadQuestionsForManage()">
                <option value="">{{ 'QUIZ.ALL_TOPICS' | translate }}</option>
                <option value="Molecular Geometry">{{ 'AI_GENERATOR.TOPICS.GEOMETRY' | translate }}</option>
                <option value="Chemical Bonds">{{ 'AI_GENERATOR.TOPICS.BONDS' | translate }}</option>
              </select>
            </div>
            <button class="btn-primary" (click)="startQuiz()">
              <mat-icon>play_arrow</mat-icon> {{ 'QUIZ.START_BTN' | translate }}
            </button>
          </div>
        </div>
      }

      @if (loading) {
        <div class="loading-state"><mat-spinner></mat-spinner></div>
      }

      @if (quizStarted && questions.length > 0) {
        <div class="quiz-progress">
          <div class="progress-info">
            <span class="progress-label">{{ 'QUIZ.PROGRESS' | translate:{current: currentIndex + 1, total: questions.length} }}</span>
            <span class="progress-pct">{{ (((currentIndex + 1) / questions.length) * 100) | number:'1.0-0' }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" [style.width.%]="((currentIndex + 1) / questions.length) * 100"></div>
          </div>
        </div>

        <div class="question-card">
          <h3 class="question-text">{{ questions[currentIndex].question }}</h3>
          <div class="options-group">
            <mat-radio-group [(ngModel)]="answers[currentIndex]">
              @for (opt of [{key:'A',text:questions[currentIndex].optionA},{key:'B',text:questions[currentIndex].optionB},{key:'C',text:questions[currentIndex].optionC},{key:'D',text:questions[currentIndex].optionD}]; track opt.key) {
                <div class="option-item" [class.selected]="answers[currentIndex] === opt.key"
                     (click)="answers[currentIndex] = opt.key">
                  <mat-radio-button [value]="opt.key" (click)="$event.stopPropagation()">
                    <span class="opt-key">{{ opt.key }}</span><span>{{ opt.text }}</span>
                  </mat-radio-button>
                </div>
              }
            </mat-radio-group>
          </div>
          <div class="question-actions">
            <button class="btn-outline" (click)="previousQuestion()" [disabled]="currentIndex === 0">
              <mat-icon>arrow_back</mat-icon> {{ 'QUIZ.PREVIOUS' | translate }}
            </button>
            @if (currentIndex < questions.length - 1) {
              <button class="btn-primary" (click)="nextQuestion()" [disabled]="!answers[currentIndex]">
                {{ 'QUIZ.NEXT' | translate }} <mat-icon>arrow_forward</mat-icon>
              </button>
            } @else {
              <button class="btn-submit" (click)="submitQuiz()" [disabled]="!allAnswered()">
                <mat-icon>check</mat-icon> {{ 'QUIZ.SUBMIT' | translate }}
              </button>
            }
          </div>
        </div>
      }

      @if (result) {
        <div class="result-card">
          <div class="score-display" [class.good]="result.percentage >= 70" [class.bad]="result.percentage < 70">
            <div class="score-icon"><mat-icon>{{ result.percentage >= 70 ? 'emoji_events' : 'trending_up' }}</mat-icon></div>
            <h2>{{ result.score }} / {{ result.totalQuestions }}</h2>
            <span class="score-pct">{{ result.percentage | number:'1.0-0' }}%</span>
          </div>
          <div class="results-divider"></div>
          <h3 class="results-title">{{ 'QUIZ.DETAILED_RESULTS' | translate }}</h3>
          @for (detail of result.details; track detail.questionId) {
            <div class="result-item" [class.correct]="detail.correct" [class.incorrect]="!detail.correct">
              <mat-icon>{{ detail.correct ? 'check_circle' : 'cancel' }}</mat-icon>
              <div>
                <p class="ri-question">{{ detail.question }}</p>
                <p class="ri-answer">{{ 'QUIZ.YOUR_ANSWER' | translate }} <strong>{{ detail.selectedAnswer }}</strong>
                  @if (!detail.correct) { | {{ 'QUIZ.CORRECT_ANSWER' | translate }} <strong>{{ detail.correctAnswer }}</strong> }
                </p>
              </div>
            </div>
          }
          <button class="btn-primary full-mt" (click)="resetQuiz()"><mat-icon>replay</mat-icon> {{ 'QUIZ.RETRY_BTN' | translate }}</button>
        </div>
      }
    </div>

    <!-- Create Question Modal -->
    @if (showQuestionModal) {
      <div class="modal-overlay" (click)="closeQuestionModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{ 'QUIZ.ADD_QUESTION_TITLE' | translate }}</h2>
          <div class="form-group"><label>{{ 'QUIZ.LABEL_QUESTION' | translate }}</label><textarea [(ngModel)]="qForm.question" rows="3" [placeholder]="'QUIZ.PH_QUESTION' | translate"></textarea></div>
          <div class="form-group"><label>{{ 'QUIZ.LABEL_OPTION_A' | translate }}</label><input [(ngModel)]="qForm.optionA" [placeholder]="'QUIZ.PH_OPTION_A' | translate" /></div>
          <div class="form-group"><label>{{ 'QUIZ.LABEL_OPTION_B' | translate }}</label><input [(ngModel)]="qForm.optionB" [placeholder]="'QUIZ.PH_OPTION_B' | translate" /></div>
          <div class="form-group"><label>{{ 'QUIZ.LABEL_OPTION_C' | translate }}</label><input [(ngModel)]="qForm.optionC" [placeholder]="'QUIZ.PH_OPTION_C' | translate" /></div>
          <div class="form-group"><label>{{ 'QUIZ.LABEL_OPTION_D' | translate }}</label><input [(ngModel)]="qForm.optionD" [placeholder]="'QUIZ.PH_OPTION_D' | translate" /></div>
          <div class="form-group">
            <label>{{ 'QUIZ.LABEL_CORRECT' | translate }}</label>
            <select [(ngModel)]="qForm.correctAnswer">
              <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
            </select>
          </div>
          <div class="form-group"><label>{{ 'QUIZ.LABEL_TOPIC_FIELD' | translate }}</label><input [(ngModel)]="qForm.topic" [placeholder]="'QUIZ.PH_TOPIC_FIELD' | translate" /></div>
          <div class="form-group">
            <label>{{ 'QUIZ.LABEL_DIFFICULTY' | translate }}</label>
            <select [(ngModel)]="qForm.difficulty">
              <option value="">--</option><option value="EASY">{{ 'COMMON.EASY' | translate }}</option><option value="MEDIUM">{{ 'COMMON.MEDIUM' | translate }}</option><option value="HARD">{{ 'COMMON.HARD' | translate }}</option>
            </select>
          </div>
          <div class="form-group"><label>{{ 'QUIZ.LABEL_EXPLANATION' | translate }}</label><textarea [(ngModel)]="qForm.explanation" rows="2" [placeholder]="'QUIZ.PH_EXPLANATION' | translate"></textarea></div>
          @if (qError) { <div class="error-msg">{{ qError }}</div> }
          <div class="modal-actions">
            <button class="btn-outline" (click)="closeQuestionModal()">{{ 'COMMON.CANCEL' | translate }}</button>
            <button class="btn-primary-modal" (click)="saveQuestion()" [disabled]="qSaving">{{ (qSaving ? 'COMMON.SAVING' : 'COMMON.CREATE') | translate }}</button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Question Confirm -->
    @if (deletingQuestion) {
      <div class="modal-overlay" (click)="deletingQuestion = null">
        <div class="modal modal-sm" (click)="$event.stopPropagation()">
          <h2>{{ 'QUIZ.DELETE_QUESTION' | translate }}</h2>
          <p>{{ 'QUIZ.DELETE_QUESTION_CONFIRM' | translate }}</p>
          <div class="modal-actions">
            <button class="btn-outline" (click)="deletingQuestion = null">{{ 'COMMON.CANCEL' | translate }}</button>
            <button class="btn-danger" (click)="doDeleteQuestion()" [disabled]="qSaving">{{ (qSaving ? 'COMMON.DELETING' : 'COMMON.DELETE') | translate }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-wrapper { width: 100%; max-width: var(--page-max-text); margin: 0 auto; padding: 40px var(--page-gutter) 60px; }
    .page-header { display: flex; align-items: center; gap: 18px; margin-bottom: 32px; }
    .header-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: #1E3932; color: white; flex-shrink: 0; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: #006241; margin: 0 0 4px; flex: 1; letter-spacing: -0.01em; }
    .page-header p { font-size: 0.9rem; color: rgba(0,0,0,0.58); margin: 0; }
    .btn-manage { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; background: #f2f0eb; color: rgba(0,0,0,0.70); border: 1px solid #d6dbde; border-radius: 50px; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; white-space: nowrap; transition: all 0.2s; letter-spacing: -0.01em; }
    .btn-manage:hover { background: #edebe9; }
    .manage-panel { background: white; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .manage-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .manage-header h2 { font-size: 1rem; font-weight: 700; color: #006241; margin: 0; letter-spacing: -0.01em; }
    .btn-add { display: inline-flex; align-items: center; gap: 5px; padding: 6px 14px; background: #00754A; color: white; border: 1px solid #00754A; border-radius: 50px; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em; }
    .btn-add:hover { background: #006241; border-color: #006241; }
    .btn-add:active { transform: scale(0.95); }
    .questions-list { display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto; }
    .q-item { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; background: #f9f9f9; border-radius: 10px; }
    .q-text { flex: 1; font-size: 13px; color: rgba(0,0,0,0.87); line-height: 1.4; }
    .q-meta { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
    .q-badge { padding: 2px 8px; border-radius: 50px; font-size: 11px; font-weight: 600; letter-spacing: -0.01em; }
    .q-badge.topic { background: #d4e9e2; color: #006241; }
    .q-badge.diff { background: #faf6ee; color: #a07c3e; }
    .q-badge.answer { background: #d4e9e2; color: #006241; }
    .btn-icon-del { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; border-radius: 50%; background: rgba(200,32,20,0.08); color: #c82014; cursor: pointer; flex-shrink: 0; }
    .btn-icon-del mat-icon { font-size: 15px; width: 15px; height: 15px; }
    .empty-msg { color: rgba(0,0,0,0.40); font-size: 14px; text-align: center; padding: 20px; }
    .setup-card { background: white; border-radius: 12px; padding: 48px 36px; text-align: center; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .setup-inner { max-width: 380px; margin: 0 auto; }
    .setup-card h2 { font-size: 1.2rem; font-weight: 700; color: #006241; margin: 0 0 6px; letter-spacing: -0.01em; }
    .setup-desc { font-size: 14px; color: rgba(0,0,0,0.58); margin: 0 0 24px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; text-align: left; margin-bottom: 24px; }
    .form-group label { font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.70); letter-spacing: -0.01em; }
    .form-select { width: 100%; padding: 9px 13px; font-size: 14px; font-family: inherit; border: 1px solid #d6dbde; border-radius: 8px; background: #f9f9f9; color: rgba(0,0,0,0.87); outline: none; box-sizing: border-box; transition: border-color 0.2s; }
    .form-select:focus { border-color: #00754A; box-shadow: 0 0 0 3px rgba(0,117,74,0.10); background: white; }
    .btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 28px; font-size: 14px; font-weight: 600; font-family: inherit; color: white; background: #00754A; border: 1px solid #00754A; border-radius: 50px; cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em; }
    .btn-primary:hover:not(:disabled) { background: #006241; border-color: #006241; }
    .btn-primary:active:not(:disabled) { transform: scale(0.95); }
    .btn-primary:disabled { opacity: 0.50; cursor: not-allowed; }
    .btn-primary mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .full-mt { margin-top: 28px; width: 100%; }
    .btn-outline { display: inline-flex; align-items: center; gap: 6px; padding: 9px 20px; font-size: 14px; font-weight: 600; font-family: inherit; color: rgba(0,0,0,0.70); background: white; border: 1px solid #d6dbde; border-radius: 50px; cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em; }
    .btn-outline:hover:not(:disabled) { border-color: #b5b5b5; }
    .btn-outline:disabled { opacity: 0.40; cursor: not-allowed; }
    .btn-outline mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .btn-submit { display: inline-flex; align-items: center; gap: 8px; padding: 10px 28px; font-size: 14px; font-weight: 600; font-family: inherit; color: white; background: #00754A; border: 1px solid #00754A; border-radius: 50px; cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em; }
    .btn-submit:hover:not(:disabled) { background: #006241; border-color: #006241; }
    .btn-submit:active { transform: scale(0.95); }
    .btn-submit:disabled { opacity: 0.50; cursor: not-allowed; }
    .btn-submit mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .quiz-progress { margin-bottom: 24px; }
    .progress-info { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .progress-label { font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.70); letter-spacing: -0.01em; }
    .progress-pct { font-size: 13px; font-weight: 700; color: #00754A; }
    .progress-track { height: 6px; background: #d6dbde; border-radius: 50px; overflow: hidden; }
    .progress-fill { height: 100%; background: #00754A; border-radius: 50px; transition: width 0.35s ease; }
    .question-card { background: white; border-radius: 12px; padding: 32px 28px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .question-text { font-size: 1.05rem; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0 0 24px; line-height: 1.5; letter-spacing: -0.01em; }
    .options-group mat-radio-group { display: flex; flex-direction: column; gap: 10px; }
    .option-item { display: block; padding: 13px 16px; border: 1px solid #d6dbde; border-radius: 10px; cursor: pointer; transition: all 0.15s; }
    .option-item:hover { background: #f2f0eb; border-color: #a8d8c5; }
    .option-item.selected { background: #d4e9e2; border-color: #00754A; }
    .opt-key { font-weight: 700; color: #006241; margin-right: 8px; }
    .question-actions { display: flex; justify-content: space-between; margin-top: 28px; }
    .result-card { background: white; border-radius: 12px; padding: 32px 28px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .score-display { text-align: center; padding: 28px; border-radius: 10px; }
    .score-display.good { background: #d4e9e2; color: #006241; }
    .score-display.bad { background: #faf6ee; color: #a07c3e; }
    .score-icon { margin-bottom: 12px; }
    .score-icon mat-icon { font-size: 40px; width: 40px; height: 40px; }
    .score-display h2 { font-size: 2.5rem; font-weight: 800; margin: 0 0 4px; letter-spacing: -0.02em; }
    .score-pct { font-size: 1rem; font-weight: 600; opacity: 0.80; }
    .results-divider { height: 1px; background: #edebe9; margin: 24px 0; }
    .results-title { font-size: 1rem; font-weight: 700; color: #006241; margin: 0 0 16px; letter-spacing: -0.01em; }
    .result-item { display: flex; gap: 12px; padding: 13px 16px; margin-bottom: 8px; border-radius: 10px; }
    .result-item.correct { background: #d4e9e2; }
    .result-item.correct mat-icon { color: #006241; }
    .result-item.incorrect { background: rgba(200,32,20,0.06); }
    .result-item.incorrect mat-icon { color: #c82014; }
    .result-item mat-icon { flex-shrink: 0; margin-top: 2px; }
    .ri-question { font-weight: 600; font-size: 13px; color: rgba(0,0,0,0.87); margin: 0 0 4px; letter-spacing: -0.01em; }
    .ri-answer { font-size: 12px; color: rgba(0,0,0,0.58); margin: 0; }
    .loading-state { display: flex; justify-content: center; padding: 60px 0; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.40); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; padding: 32px; width: 480px; max-width: 95vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 8px 40px rgba(0,0,0,0.18); }
    .modal-sm { width: 360px; }
    .modal h2 { font-size: 1.1rem; font-weight: 700; color: #006241; margin: 0 0 20px; letter-spacing: -0.01em; }
    .modal p { color: rgba(0,0,0,0.70); margin: 0 0 4px; }
    .modal .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; text-align: left; }
    .modal .form-group label { font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.70); letter-spacing: -0.01em; }
    .modal .form-group input, .modal .form-group select, .modal .form-group textarea { padding: 9px 13px; border: 1px solid #d6dbde; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; resize: vertical; background: #f9f9f9; color: rgba(0,0,0,0.87); transition: border-color 0.2s; }
    .modal .form-group input:focus, .modal .form-group select:focus, .modal .form-group textarea:focus { border-color: #00754A; box-shadow: 0 0 0 3px rgba(0,117,74,0.10); background: white; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .btn-primary-modal { padding: 8px 20px; background: #00754A; color: white; border: 1px solid #00754A; border-radius: 50px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em; }
    .btn-primary-modal:hover { background: #006241; border-color: #006241; }
    .btn-primary-modal:active { transform: scale(0.95); }
    .btn-primary-modal:disabled { opacity: 0.50; cursor: not-allowed; }
    .btn-danger { padding: 8px 20px; background: #c82014; color: white; border: 1px solid #c82014; border-radius: 50px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em; }
    .btn-danger:active { transform: scale(0.95); }
    .btn-danger:disabled { opacity: 0.50; cursor: not-allowed; }
    .error-msg { color: #c82014; font-size: 13px; margin-bottom: 8px; }
    @media (max-width: 640px) { .page-wrapper { padding: 24px 16px 40px; } .setup-card { padding: 32px 20px; } .question-card { padding: 24px 18px; } .question-actions { flex-direction: column; gap: 12px; } }
  `]
})
export class QuizComponent implements OnInit {
  questions: Question[] = [];
  allQuestions: Question[] = [];
  answers: string[] = [];
  currentIndex = 0;
  quizStarted = false;
  loading = false;
  result: QuizResult | null = null;
  selectedTopic = '';
  showManage = false;
  showQuestionModal = false;
  deletingQuestion: Question | null = null;
  qSaving = false;
  qError = '';
  qForm: any = { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', topic: '', difficulty: '', explanation: '' };

  get isAdminOrTeacher(): boolean {
    const role = this.authService.getCurrentUser()?.role;
    return role === 'ADMIN' || role === 'TEACHER';
  }

  constructor(private quizService: QuizService, private authService: AuthService) {}

  ngOnInit(): void {}

  loadQuestionsForManage(): void {
    if (!this.showManage) return;
    this.quizService.getQuestions(this.selectedTopic || undefined).subscribe(qs => this.allQuestions = qs);
  }

  startQuiz(): void {
    this.loading = true;
    const topic = this.selectedTopic || undefined;
    this.quizService.getQuestions(topic).subscribe({
      next: (questions) => {
        this.questions = questions;
        this.allQuestions = questions;
        this.answers = new Array(questions.length).fill('');
        this.currentIndex = 0;
        this.quizStarted = true;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  nextQuestion(): void { if (this.currentIndex < this.questions.length - 1) this.currentIndex++; }
  previousQuestion(): void { if (this.currentIndex > 0) this.currentIndex--; }
  allAnswered(): boolean { return this.answers.every(a => a !== ''); }

  submitQuiz(): void {
    this.loading = true;
    const submission = {
      topic: this.selectedTopic,
      answers: this.questions.map((q, i): AnswerItem => ({ questionId: q.id, selectedAnswer: this.answers[i] }))
    };
    this.quizService.submitQuiz(submission).subscribe({
      next: (result) => { this.result = result; this.quizStarted = false; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  resetQuiz(): void {
    this.result = null; this.quizStarted = false; this.questions = []; this.answers = []; this.currentIndex = 0;
  }

  openCreateQuestion(): void {
    this.qForm = { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', topic: this.selectedTopic, difficulty: '', explanation: '' };
    this.qError = '';
    this.showQuestionModal = true;
  }

  closeQuestionModal(): void { this.showQuestionModal = false; }

  saveQuestion(): void {
    if (!this.qForm.question || !this.qForm.optionA || !this.qForm.optionB || !this.qForm.optionC || !this.qForm.optionD) {
      this.qError = 'Question and all options are required'; return;
    }
    this.qSaving = true;
    this.qError = '';
    const req: CreateQuestionRequest = {
      question: this.qForm.question, optionA: this.qForm.optionA, optionB: this.qForm.optionB,
      optionC: this.qForm.optionC, optionD: this.qForm.optionD, correctAnswer: this.qForm.correctAnswer,
      topic: this.qForm.topic || undefined, difficulty: this.qForm.difficulty || undefined, explanation: this.qForm.explanation || undefined
    };
    this.quizService.createQuestion(req).subscribe({
      next: () => { this.qSaving = false; this.closeQuestionModal(); this.loadQuestionsForManage(); },
      error: (e) => { this.qSaving = false; this.qError = e?.error?.message || 'Failed to create'; }
    });
  }

  confirmDeleteQuestion(q: Question): void { this.deletingQuestion = q; }

  doDeleteQuestion(): void {
    if (!this.deletingQuestion) return;
    this.qSaving = true;
    this.quizService.deleteQuestion(this.deletingQuestion.id).subscribe({
      next: () => { this.qSaving = false; this.deletingQuestion = null; this.loadQuestionsForManage(); },
      error: () => { this.qSaving = false; this.deletingQuestion = null; }
    });
  }
}
