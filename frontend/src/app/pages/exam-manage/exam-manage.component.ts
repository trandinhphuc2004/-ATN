import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { Exam, CreateExamRequest, Question } from '../../models/models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-exam-manage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, MatProgressSpinnerModule, TranslateModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-icon">
          <mat-icon>assignment</mat-icon>
        </div>
        <div>
          <h1>{{ 'EXAM_MANAGE.TITLE' | translate }}</h1>
          <p class="subtitle">{{ 'EXAM_MANAGE.SUBTITLE' | translate }}</p>
        </div>
      </div>

      <!-- Create Exam Form -->
      <div class="create-section" [class.expanded]="showCreate">
        <button class="toggle-create" (click)="showCreate = !showCreate">
          <mat-icon>{{ showCreate ? 'remove' : 'add' }}</mat-icon>
          {{ (showCreate ? 'EXAM_MANAGE.CANCEL' : 'EXAM_MANAGE.CREATE_NEW') | translate }}
        </button>

        @if (showCreate) {
          <div class="create-form">
            <div class="form-row">
              <div class="form-group flex-2">
                <label>{{ 'EXAM_MANAGE.EXAM_TITLE_LABEL' | translate }}</label>
                <input type="text" [(ngModel)]="newExam.title" [placeholder]="'EXAM_MANAGE.TITLE_PLACEHOLDER' | translate" />
              </div>
              <div class="form-group flex-1">
                <label>{{ 'EXAM_MANAGE.TIME_LIMIT' | translate }}</label>
                <input type="number" [(ngModel)]="newExam.timeLimitMinutes" min="1" max="180" />
              </div>
            </div>

            <div class="form-group">
              <label>{{ 'EXAM_MANAGE.DESCRIPTION_LABEL' | translate }}</label>
              <textarea [(ngModel)]="newExam.description" rows="2" [placeholder]="'EXAM_MANAGE.DESC_PLACEHOLDER' | translate"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>{{ 'EXAM_MANAGE.TOPIC_LABEL' | translate }}</label>
                <select [(ngModel)]="newExam.topic" (ngModelChange)="onTopicChange()">
                  <option value="">{{ 'EXAM_MANAGE.ALL_TOPICS' | translate }}</option>
                  <option value="Chemical Bonds">{{ 'AI_GENERATOR.TOPICS.BONDS' | translate }}</option>
                  <option value="Molecular Geometry">{{ 'AI_GENERATOR.TOPICS.GEOMETRY' | translate }}</option>
                  <option value="Redox Reactions">{{ 'AI_GENERATOR.TOPICS.REDOX' | translate }}</option>
                  <option value="Acid-Base Chemistry">{{ 'AI_GENERATOR.TOPICS.ACID_BASE' | translate }}</option>
                  <option value="Thermochemistry">{{ 'AI_GENERATOR.TOPICS.THERMO' | translate }}</option>
                  <option value="Organic Chemistry">{{ 'AI_GENERATOR.TOPICS.ORGANIC' | translate }}</option>
                </select>
              </div>
              <div class="form-group flex-1">
                <label>{{ 'EXAM_MANAGE.DIFFICULTY_LABEL' | translate }}</label>
                <select [(ngModel)]="newExam.difficulty">
                  <option value="">{{ 'EXAM_MANAGE.ANY_DIFF' | translate }}</option>
                  <option value="EASY">{{ 'AI_GENERATOR.DIFFICULTIES.EASY' | translate }}</option>
                  <option value="MEDIUM">{{ 'AI_GENERATOR.DIFFICULTIES.MEDIUM' | translate }}</option>
                  <option value="HARD">{{ 'AI_GENERATOR.DIFFICULTIES.HARD' | translate }}</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="newExam.randomOrder" />
                {{ 'EXAM_MANAGE.RANDOM_ORDER' | translate }}
              </label>
            </div>

            <div class="question-mode">
              <h4>{{ 'EXAM_MANAGE.QUESTION_SELECTION' | translate }}</h4>
              <div class="mode-tabs">
                <button [class.active]="questionMode === 'random'" (click)="questionMode = 'random'">
                  <mat-icon>shuffle</mat-icon> {{ 'EXAM_MANAGE.MODE_RANDOM' | translate }}
                </button>
                <button [class.active]="questionMode === 'manual'" (click)="questionMode = 'manual'; loadQuestions()">
                  <mat-icon>checklist</mat-icon> {{ 'EXAM_MANAGE.MODE_MANUAL' | translate }}
                </button>
                <button [class.active]="questionMode === 'ai'" (click)="questionMode = 'ai'">
                  <mat-icon>auto_awesome</mat-icon> {{ 'EXAM_MANAGE.MODE_AI' | translate }}
                </button>
              </div>

              @if (questionMode === 'random' || questionMode === 'ai') {
                <div class="form-group" style="margin-top:16px">
                  <label>{{ 'EXAM_MANAGE.QUESTION_COUNT' | translate }}</label>
                  <input type="number" [(ngModel)]="randomCount" min="1" max="50" />
                </div>
              }

              @if (questionMode === 'manual') {
                <div class="question-picker">
                  @if (loadingQuestions) {
                    <mat-spinner diameter="24"></mat-spinner>
                  } @else {
                    <p class="pick-info">{{ 'EXAM_MANAGE.PICK_INFO' | translate:{current: selectedIds.size, total: availableQuestions.length} }}</p>
                    @for (q of availableQuestions; track q.id) {
                      <div class="pick-item" [class.selected]="selectedIds.has(q.id)" (click)="toggleQuestion(q.id)">
                        <div class="pick-check">
                          <mat-icon>{{ selectedIds.has(q.id) ? 'check_box' : 'check_box_outline_blank' }}</mat-icon>
                        </div>
                        <div class="pick-text">
                          <span class="pick-q">{{ q.question }}</span>
                          <span class="pick-meta">{{ q.topic }} · {{ q.difficulty }}</span>
                        </div>
                      </div>
                    }
                  }
                </div>
              }
            </div>

            @if (createError) {
              <div class="create-error">{{ createError }}</div>
            }

            <button class="submit-btn" (click)="createExam()" [disabled]="creating">
              @if (creating) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <mat-icon>add_circle</mat-icon>
              }
              {{ 'EXAM_MANAGE.SUBMIT_CREATE' | translate }}
            </button>
          </div>
        }
      </div>

      <!-- Exams List -->
      <div class="exams-section">
        <h2>{{ 'EXAM_MANAGE.YOUR_EXAMS' | translate }}</h2>
        @if (loading) {
          <div class="loading-state"><mat-spinner></mat-spinner></div>
        } @else if (!exams.length) {
          <div class="empty-state">
            <mat-icon>assignment</mat-icon>
            <p>{{ 'EXAM_MANAGE.EMPTY_EXAMS' | translate }}</p>
          </div>
        } @else {
          @for (exam of exams; track exam.id) {
            <div class="exam-card">
              <div class="exam-main">
                <div class="exam-title-row">
                  <h3>{{ exam.title }}</h3>
                  <span class="status-badge" [class.active]="exam.active" [class.inactive]="!exam.active">
                    {{ (exam.active ? 'EXAM_MANAGE.STATUS_ACTIVE' : 'EXAM_MANAGE.STATUS_INACTIVE') | translate }}
                  </span>
                </div>
                @if (exam.description) {
                  <p class="exam-desc">{{ exam.description }}</p>
                }
                <div class="exam-meta">
                  <span><mat-icon>timer</mat-icon> {{ exam.timeLimitMinutes }} {{ 'EXAM_MANAGE.MINUTES_SHORT' | translate }}</span>
                  <span><mat-icon>help_outline</mat-icon> {{ exam.questionCount }} {{ 'EXAM_MANAGE.QUESTIONS_SHORT' | translate }}</span>
                  @if (exam.topic) {
                    <span><mat-icon>label</mat-icon> {{ exam.topic }}</span>
                  }
                  @if (exam.randomOrder) {
                    <span><mat-icon>shuffle</mat-icon> {{ 'EXAM_MANAGE.RANDOM_ORDER_META' | translate }}</span>
                  }
                </div>
              </div>
              <div class="exam-actions">
                <button class="action-btn" (click)="toggleExam(exam)" [title]="(exam.active ? 'EXAM_MANAGE.DEACTIVATE' : 'EXAM_MANAGE.ACTIVATE') | translate">
                  <mat-icon>{{ exam.active ? 'pause_circle' : 'play_circle' }}</mat-icon>
                </button>
                <button class="action-btn danger" (click)="deleteExam(exam)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper { width: 100%; max-width: var(--page-max-mid); margin: 0 auto; padding: 32px var(--page-gutter) 60px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
    .header-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: #1E3932; color: white; flex-shrink: 0; }
    .header-icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: #006241; margin: 0 0 4px; letter-spacing: -0.01em; }
    .subtitle { font-size: 13px; color: rgba(0,0,0,0.58); margin: 0; }
    .create-section { background: white; border-radius: 12px; padding: 20px 24px; margin-bottom: 28px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .toggle-create { display: flex; align-items: center; gap: 8px; background: none; border: none; font-size: 15px; font-weight: 600; color: #00754A; cursor: pointer; font-family: inherit; padding: 0; letter-spacing: -0.01em; }
    .toggle-create mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .create-form { margin-top: 20px; }
    .form-row { display: flex; gap: 16px; margin-bottom: 16px; align-items: flex-start; }
    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.70); margin-bottom: 6px; letter-spacing: -0.01em; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 9px 13px; border: 1px solid #d6dbde; border-radius: 8px; background: #f9f9f9; font-size: 14px; font-family: inherit; color: rgba(0,0,0,0.87); box-sizing: border-box; transition: border-color 0.2s; outline: none; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #00754A; box-shadow: 0 0 0 3px rgba(0,117,74,0.10); background: white; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: rgba(0,0,0,0.87); cursor: pointer; }
    .question-mode { margin-top: 20px; }
    .question-mode h4 { font-size: 14px; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0 0 12px; letter-spacing: -0.01em; }
    .mode-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
    .mode-tabs button { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid #edebe9; border-radius: 50px; background: white; font-size: 13px; font-weight: 500; color: rgba(0,0,0,0.70); cursor: pointer; font-family: inherit; transition: all 0.2s; }
    .mode-tabs button mat-icon { font-size: 17px; width: 17px; height: 17px; }
    .mode-tabs button.active { background: #00754A; color: white; border-color: #00754A; }
    .mode-tabs button:last-child.active { background: #1E3932; border-color: #1E3932; }
    .question-picker { margin-top: 16px; max-height: 300px; overflow-y: auto; }
    .pick-info { font-size: 13px; color: rgba(0,0,0,0.58); margin: 0 0 10px; }
    .pick-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border: 1px solid #edebe9; border-radius: 10px; margin-bottom: 6px; cursor: pointer; transition: all 0.15s; }
    .pick-item:hover { border-color: #a8d8c5; background: #f2f0eb; }
    .pick-item.selected { border-color: #00754A; background: #d4e9e2; }
    .pick-check mat-icon { font-size: 20px; width: 20px; height: 20px; color: rgba(0,0,0,0.30); }
    .pick-item.selected .pick-check mat-icon { color: #00754A; }
    .pick-text { flex: 1; }
    .pick-q { display: block; font-size: 13px; color: rgba(0,0,0,0.87); font-weight: 500; }
    .pick-meta { display: block; font-size: 12px; color: rgba(0,0,0,0.40); margin-top: 2px; }
    .create-error { margin-top: 16px; padding: 10px 14px; border-radius: 8px; background: rgba(200,32,20,0.08); color: #c82014; font-size: 13px; line-height: 1.45; }
    .submit-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 12px; margin-top: 20px; border: 1px solid #00754A; border-radius: 50px; background: #00754A; color: white; font-size: 15px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em; }
    .submit-btn:hover:not(:disabled) { background: #006241; border-color: #006241; }
    .submit-btn:active:not(:disabled) { transform: scale(0.95); }
    .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .submit-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .exams-section h2 { font-size: 1rem; font-weight: 700; color: #006241; margin: 0 0 16px; letter-spacing: -0.01em; }
    .exam-card { display: flex; align-items: flex-start; gap: 16px; background: white; border-radius: 12px; padding: 20px; margin-bottom: 12px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); transition: all 0.2s; }
    .exam-card:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06); }
    .exam-main { flex: 1; }
    .exam-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .exam-title-row h3 { font-size: 1rem; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0; letter-spacing: -0.01em; }
    .status-badge { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 50px; letter-spacing: 0.02em; }
    .status-badge.active { background: #d4e9e2; color: #006241; }
    .status-badge.inactive { background: rgba(200,32,20,0.08); color: #c82014; }
    .exam-desc { font-size: 13px; color: rgba(0,0,0,0.58); margin: 0 0 10px; }
    .exam-meta { display: flex; flex-wrap: wrap; gap: 14px; }
    .exam-meta span { display: flex; align-items: center; gap: 4px; font-size: 12px; color: rgba(0,0,0,0.40); }
    .exam-meta mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .exam-actions { display: flex; gap: 6px; flex-shrink: 0; }
    .action-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: 1px solid #edebe9; border-radius: 50%; background: white; color: rgba(0,0,0,0.58); cursor: pointer; transition: all 0.2s; }
    .action-btn:hover { background: #d4e9e2; color: #006241; border-color: #a8d8c5; }
    .action-btn.danger:hover { background: rgba(200,32,20,0.08); color: #c82014; border-color: rgba(200,32,20,0.25); }
    .action-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .loading-state { display: flex; justify-content: center; padding: 60px 0; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 24px; background: white; border-radius: 12px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); text-align: center; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: rgba(0,0,0,0.20); margin-bottom: 12px; }
    .empty-state p { font-size: 14px; color: rgba(0,0,0,0.40); margin: 0; }
    @media (max-width: 640px) { .form-row { flex-direction: column; gap: 0; } .exam-card { flex-direction: column; } }
  `],
})
export class ExamManageComponent implements OnInit {
  exams: Exam[] = [];
  loading = true;
  creating = false;
  showCreate = false;
  questionMode: 'random' | 'manual' | 'ai' = 'random';
  randomCount = 10;
  availableQuestions: Question[] = [];
  selectedIds = new Set<number>();
  loadingQuestions = false;
  createError = '';

  newExam: CreateExamRequest = {
    title: '',
    description: '',
    timeLimitMinutes: 30,
    randomOrder: true,
    topic: '',
    difficulty: '',
  };

  constructor(
    private examService: ExamService,
    public authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.loading = true;
    this.examService.getMyExams().subscribe({
      next: (exams) => {
        this.exams = exams;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  loadQuestions(): void {
    this.loadingQuestions = true;
    const url = this.newExam.topic
      ? `${environment.apiUrl}/quiz/questions?topic=${encodeURIComponent(this.newExam.topic)}`
      : `${environment.apiUrl}/quiz/questions`;
    this.http.get<Question[]>(url).subscribe({
      next: (qs) => {
        this.availableQuestions = qs;
        this.loadingQuestions = false;
      },
      error: () => (this.loadingQuestions = false),
    });
  }

  onTopicChange(): void {
    if (this.questionMode === 'manual') {
      this.loadQuestions();
      this.selectedIds.clear();
    }
  }

  toggleQuestion(id: number): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  createExam(): void {
    if (!this.newExam.title.trim()) return;

    const request: CreateExamRequest = { ...this.newExam };
    if (this.questionMode === 'random') {
      request.randomQuestionCount = this.randomCount;
    } else if (this.questionMode === 'ai') {
      request.randomQuestionCount = this.randomCount;
      request.aiGenerated = true;
    } else {
      request.questionIds = Array.from(this.selectedIds);
    }

    this.creating = true;
    this.createError = '';
    this.examService.createExam(request).subscribe({
      next: () => {
        this.creating = false;
        this.showCreate = false;
        this.newExam = { title: '', description: '', timeLimitMinutes: 30, randomOrder: true, topic: '', difficulty: '' };
        this.selectedIds.clear();
        this.loadExams();
      },
      // Truoc day loi bi nuot mat nen giao vien tuong de thi da tao xong du de rong.
      error: (e) => {
        this.creating = false;
        this.createError = e?.error?.error || e?.error?.message || 'Khong tao duoc de thi. Vui long thu lai.';
      },
    });
  }

  toggleExam(exam: Exam): void {
    this.examService.toggleExam(exam.id).subscribe(() => {
      exam.active = !exam.active;
    });
  }

  deleteExam(exam: Exam): void {
    this.examService.deleteExam(exam.id).subscribe(() => {
      this.exams = this.exams.filter((e) => e.id !== exam.id);
    });
  }
}
