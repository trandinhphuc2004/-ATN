import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { ExamService } from '../../services/exam.service';
import { Exam, ExamQuestion, ExamQuestionResult, ExamResult, ExamSubmissionRequest } from '../../models/models';

@Component({
  selector: 'app-exam-take',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatProgressSpinnerModule, TranslateModule],
  template: `
    <div class="page-wrapper">
      @if (loading) {
        <div class="loading-state"><mat-spinner></mat-spinner></div>
      } @else if (result) {
        <!-- Result View -->
        <div class="result-container">
          <div class="result-header" [class.pass]="result.percentage >= 50" [class.fail]="result.percentage < 50">
            <mat-icon>{{ result.percentage >= 50 ? 'emoji_events' : 'sentiment_dissatisfied' }}</mat-icon>
            <h1>{{ (result.percentage >= 50 ? 'EXAM_TAKE.CONGRATS' : 'EXAM_TAKE.KEEP_TRYING') | translate }}</h1>
            <div class="score-circle">
              <span class="score-num">{{ result.percentage | number:'1.0-0' }}%</span>
            </div>
            <p>{{ 'EXAM_TAKE.SCORE_INFO' | translate:{score: result.score, total: result.totalQuestions} }}</p>
          </div>

          <div class="result-details">
            @for (d of result.details; track d.questionId; let i = $index) {
              <div class="result-item" [class.correct]="d.correct" [class.wrong]="!d.correct">
                <div class="ri-num">{{ i + 1 }}</div>
                <div class="ri-body">
                  <p class="ri-q">{{ d.question }}</p>

                  <!-- Chua de: liet ke ca 4 dap an, danh dau dap an dung va dap an da chon -->
                  @if (getResultOptions(d).length) {
                    <div class="ri-options">
                      @for (opt of getResultOptions(d); track opt.key) {
                        <div class="ri-opt"
                             [class.is-correct]="opt.key === d.correctAnswer"
                             [class.is-chosen]="opt.key === d.selectedAnswer && opt.key !== d.correctAnswer">
                          <span class="ri-opt-key">{{ opt.key }}</span>
                          <span class="ri-opt-text">{{ opt.value }}</span>
                          @if (opt.key === d.correctAnswer) {
                            <span class="ri-tag correct-tag">{{ 'EXAM_TAKE.CORRECT_ANSWER' | translate }}</span>
                          } @else if (opt.key === d.selectedAnswer) {
                            <span class="ri-tag chosen-tag">{{ 'EXAM_TAKE.YOUR_ANSWER' | translate }}</span>
                          }
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="ri-answers">
                      <span class="ri-your">{{ 'EXAM_TAKE.YOUR_ANSWER' | translate }} <strong>{{ d.selectedAnswer || ('EXAM_TAKE.NO_ANSWER' | translate) }}</strong></span>
                      @if (!d.correct) {
                        <span class="ri-correct">{{ 'EXAM_TAKE.CORRECT_ANSWER' | translate }} <strong>{{ d.correctAnswer }}</strong></span>
                      }
                    </div>
                  }

                  @if (!d.selectedAnswer) {
                    <p class="ri-noanswer">{{ 'EXAM_TAKE.NO_ANSWER' | translate }}</p>
                  }

                  @if (d.explanation) {
                    <div class="ri-explain">
                      <mat-icon>lightbulb</mat-icon>
                      <span>{{ d.explanation }}</span>
                    </div>
                  }
                </div>
                <mat-icon class="ri-icon">{{ d.correct ? 'check_circle' : 'cancel' }}</mat-icon>
              </div>
            }
          </div>

          <a routerLink="/exams" class="back-btn">
            <mat-icon>arrow_back</mat-icon> {{ 'EXAM_TAKE.BACK_BTN' | translate }}
          </a>
        </div>
      } @else if (exam) {
        <!-- Exam View -->
        <div class="exam-header">
          <div>
            <h1>{{ exam.title }}</h1>
            <p class="exam-info">{{ 'EXAM_TAKE.QUESTION_INFO' | translate:{count: exam.questionCount, time: exam.timeLimitMinutes} }}</p>
          </div>
          <div class="timer" [class.warning]="remainingSeconds <= 60" [class.danger]="remainingSeconds <= 30">
            <mat-icon>timer</mat-icon>
            <span>{{ formatTime(remainingSeconds) }}</span>
          </div>
        </div>

        <!-- Question Navigator -->
        <div class="question-nav">
          @for (q of questions; track q.id; let i = $index) {
            <button class="qn-dot" [class.active]="currentIndex === i"
                    [class.answered]="answers[q.id]" (click)="goToQuestion(i)">
              {{ i + 1 }}
            </button>
          }
        </div>

        <!-- Current Question -->
        @if (questions[currentIndex]; as q) {
          <div class="question-card">
            <div class="q-header">
              <span class="q-num">{{ 'EXAM_TAKE.QUESTION_NAVI' | translate:{current: currentIndex + 1, total: questions.length} }}</span>
            </div>
            <p class="q-text">{{ q.question }}</p>

            <div class="options">
              @for (opt of getOptions(q); track opt.key) {
                <button class="option-btn" [class.selected]="answers[q.id] === opt.key"
                        (click)="selectAnswer(q.id, opt.key)">
                  <span class="opt-letter">{{ opt.key }}</span>
                  <span class="opt-text">{{ opt.value }}</span>
                  @if (answers[q.id] === opt.key) {
                    <mat-icon class="opt-check">check_circle</mat-icon>
                  }
                </button>
              }
            </div>
          </div>

          <div class="nav-buttons">
            <button class="nav-btn" (click)="prevQuestion()" [disabled]="currentIndex === 0">
              <mat-icon>arrow_back</mat-icon> {{ 'EXAM_TAKE.PREV' | translate }}
            </button>
            @if (currentIndex < questions.length - 1) {
              <button class="nav-btn primary" (click)="nextQuestion()">
                {{ 'EXAM_TAKE.NEXT' | translate }} <mat-icon>arrow_forward</mat-icon>
              </button>
            } @else {
              <button class="nav-btn submit" (click)="submitExam()" [disabled]="submitting">
                @if (submitting) {
                  <mat-spinner diameter="18"></mat-spinner>
                } @else {
                  <mat-icon>send</mat-icon>
                }
                {{ 'EXAM_TAKE.SUBMIT' | translate }}
              </button>
            }
          </div>
        }
      } @else if (loadError) {
        <!-- De khong ton tai hoac chua duoc giao cho lop cua hoc sinh (403) -->
        <div class="load-error"><mat-icon>block</mat-icon> {{ loadError | translate }}</div>
      }
    </div>
  `,
  styles: [`
    .page-wrapper { width: 100%; max-width: var(--page-max-text); margin: 0 auto; padding: 32px var(--page-gutter) 60px; }
    .exam-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .exam-header h1 { font-size: 1.4rem; font-weight: 700; color: #006241; margin: 0 0 4px; letter-spacing: -0.01em; }
    .exam-info { font-size: 13px; color: rgba(0,0,0,0.58); margin: 0; }
    .timer { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 50px; background: #d4e9e2; color: #006241; font-size: 1.1rem; font-weight: 700; font-variant-numeric: tabular-nums; flex-shrink: 0; }
    .timer mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .timer.warning { background: #faf6ee; color: #a07c3e; }
    .timer.danger { background: rgba(200,32,20,0.08); color: #c82014; animation: pulse 1s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
    .question-nav { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; padding: 14px 16px; background: white; border-radius: 12px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .qn-dot { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; border: 1px solid #edebe9; background: white; font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.58); cursor: pointer; font-family: inherit; transition: all 0.15s; }
    .qn-dot:hover { border-color: #a8d8c5; background: #f2f0eb; }
    .qn-dot.active { background: #00754A; color: white; border-color: #00754A; }
    .qn-dot.answered:not(.active) { background: #d4e9e2; color: #006241; border-color: #a8d8c5; }
    .question-card { background: white; border-radius: 12px; padding: 28px; margin-bottom: 20px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .q-header { margin-bottom: 16px; }
    .q-num { font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.40); }
    .q-text { font-size: 1.05rem; font-weight: 600; color: rgba(0,0,0,0.87); line-height: 1.6; margin: 0 0 20px; letter-spacing: -0.01em; }
    .options { display: flex; flex-direction: column; gap: 10px; }
    .option-btn { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 1px solid #edebe9; border-radius: 10px; background: white; cursor: pointer; font-family: inherit; font-size: 14px; color: rgba(0,0,0,0.87); text-align: left; transition: all 0.15s; }
    .option-btn:hover { border-color: #a8d8c5; background: #f2f0eb; }
    .option-btn.selected { border-color: #00754A; background: #d4e9e2; }
    .opt-letter { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: #edebe9; color: rgba(0,0,0,0.58); font-size: 13px; font-weight: 700; flex-shrink: 0; }
    .option-btn.selected .opt-letter { background: #00754A; color: white; }
    .opt-text { flex: 1; }
    .opt-check { margin-left: auto; font-size: 20px; width: 20px; height: 20px; color: #00754A; }
    .nav-buttons { display: flex; justify-content: space-between; gap: 12px; }
    .nav-btn { display: flex; align-items: center; gap: 6px; padding: 10px 20px; border: 1px solid #edebe9; border-radius: 50px; background: white; color: rgba(0,0,0,0.87); font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.2s; letter-spacing: -0.01em; }
    .nav-btn:hover:not(:disabled) { background: #f2f0eb; border-color: #d6dbde; }
    .nav-btn:active:not(:disabled) { transform: scale(0.95); }
    .nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .nav-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .nav-btn.primary { background: #00754A; color: white; border-color: #00754A; }
    .nav-btn.primary:hover { background: #006241; border-color: #006241; }
    .nav-btn.submit { background: #006241; color: white; border-color: #006241; }
    .nav-btn.submit:hover:not(:disabled) { background: #1E3932; border-color: #1E3932; }
    .result-container { text-align: center; }
    .result-header { padding: 40px 24px; border-radius: 12px; margin-bottom: 28px; }
    .result-header.pass { background: #d4e9e2; }
    .result-header.fail { background: rgba(200,32,20,0.06); }
    .result-header mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }
    .result-header.pass mat-icon { color: #006241; }
    .result-header.fail mat-icon { color: #c82014; }
    .result-header h1 { font-size: 1.5rem; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0 0 16px; letter-spacing: -0.01em; }
    .score-circle { display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; border-radius: 50%; background: white; box-shadow: 0 2px 12px rgba(0,0,0,0.1); margin-bottom: 12px; }
    .score-num { font-size: 1.3rem; font-weight: 800; color: rgba(0,0,0,0.87); }
    .result-header p { font-size: 15px; color: rgba(0,0,0,0.58); margin: 0; }
    .result-details { text-align: left; margin-bottom: 24px; }
    .result-item { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border-radius: 12px; margin-bottom: 8px; background: white; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .result-item.correct { border-left: 3px solid #00754A; }
    .result-item.wrong { border-left: 3px solid #c82014; }
    .ri-num { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: #edebe9; color: rgba(0,0,0,0.58); font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .ri-body { flex: 1; }
    .ri-q { font-size: 14px; font-weight: 600; color: rgba(0,0,0,0.87); margin: 0 0 6px; letter-spacing: -0.01em; }
    .ri-answers { display: flex; flex-wrap: wrap; gap: 12px; }
    .ri-your { font-size: 13px; color: rgba(0,0,0,0.58); }
    .ri-correct { font-size: 13px; color: #006241; font-weight: 600; }
    .ri-options { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
    .ri-opt { display: flex; align-items: flex-start; gap: 8px; padding: 8px 12px; border: 1px solid #edebe9; border-radius: 8px; background: #f9f9f9; }
    .ri-opt.is-correct { background: #d4e9e2; border-color: #00754A; }
    .ri-opt.is-chosen { background: rgba(200,32,20,0.06); border-color: #c82014; }
    .ri-opt-key { font-size: 13px; font-weight: 700; color: rgba(0,0,0,0.58); flex-shrink: 0; min-width: 14px; }
    .ri-opt.is-correct .ri-opt-key { color: #006241; }
    .ri-opt.is-chosen .ri-opt-key { color: #c82014; }
    .ri-opt-text { flex: 1; font-size: 13px; color: rgba(0,0,0,0.87); line-height: 1.45; }
    .ri-tag { flex-shrink: 0; padding: 1px 8px; border-radius: 50px; font-size: 11px; font-weight: 600; white-space: nowrap; letter-spacing: -0.01em; }
    .ri-tag.correct-tag { background: #00754A; color: white; }
    .ri-tag.chosen-tag { background: #c82014; color: white; }
    .ri-noanswer { font-size: 12px; color: #c82014; margin: 8px 0 0; font-weight: 600; }
    .ri-explain { display: flex; align-items: flex-start; gap: 8px; margin-top: 10px; padding: 10px 12px; border-radius: 8px; background: #faf6ee; color: #6b5729; font-size: 13px; line-height: 1.5; }
    .ri-explain mat-icon { flex-shrink: 0; font-size: 17px; width: 17px; height: 17px; color: #a07c3e; }
    .ri-icon { flex-shrink: 0; font-size: 22px; width: 22px; height: 22px; }
    .result-item.correct .ri-icon { color: #00754A; }
    .result-item.wrong .ri-icon { color: #c82014; }
    .back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 24px; border-radius: 50px; background: #00754A; color: white; font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.2s; letter-spacing: -0.01em; }
    .back-btn:hover { background: #006241; }
    .back-btn:active { transform: scale(0.95); }
    .back-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .loading-state { display: flex; justify-content: center; padding: 80px 0; }
    .load-error { display: flex; align-items: center; gap: 8px; padding: 14px 16px; border-radius: 9px; background: rgba(200,32,20,0.06); color: #c82014; font-size: 14px; }
    @media (max-width: 640px) { .exam-header { flex-direction: column; gap: 12px; } }
  `],
})
export class ExamTakeComponent implements OnInit, OnDestroy {
  exam: Exam | null = null;
  questions: ExamQuestion[] = [];
  currentIndex = 0;
  answers: Record<number, string> = {};
  loading = true;
  loadError = '';
  submitting = false;
  result: ExamResult | null = null;
  reviewMode = false;

  remainingSeconds = 0;
  private timerInterval: any = null;
  private startedAt = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Che do chua bai: tai lai ket qua da nop, khong bat dau lam bai moi.
    this.reviewMode = this.route.snapshot.url.some(seg => seg.path === 'review');
    if (this.reviewMode) {
      this.examService.reviewSubmission(id).subscribe({
        next: (result) => {
          this.result = result;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
      return;
    }

    this.examService.getExamForTaking(id).subscribe({
      next: (exam) => {
        this.exam = exam;
        this.questions = exam.questions || [];
        this.remainingSeconds = exam.timeLimitMinutes * 60;
        this.startedAt = new Date().toISOString().slice(0, 19);
        this.loading = false;
        this.startTimer();
      },
      error: (err) => {
        this.loading = false;
        this.loadError = err?.status === 403 ? 'EXAM_TAKE.NOT_IN_CLASS' : 'EXAM_TAKE.NOT_FOUND';
      },
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds <= 0) {
        this.remainingSeconds = 0;
        this.submitExam(); // auto-submit
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  /**
   * Bon dap an cua mot cau trong man hinh chua de. Tra ve mang rong voi cac bai nop cu
   * chua luu noi dung dap an, khi do giao dien quay ve cach hien chi mot chu cai.
   */
  getResultOptions(d: ExamQuestionResult): { key: string; value: string }[] {
    return [
      { key: 'A', value: d.optionA },
      { key: 'B', value: d.optionB },
      { key: 'C', value: d.optionC },
      { key: 'D', value: d.optionD },
    ].filter((o): o is { key: string; value: string } => !!o.value);
  }

  getOptions(q: ExamQuestion): { key: string; value: string }[] {
    return [
      { key: 'A', value: q.optionA },
      { key: 'B', value: q.optionB },
      { key: 'C', value: q.optionC },
      { key: 'D', value: q.optionD },
    ];
  }

  selectAnswer(questionId: number, answer: string): void {
    this.answers[questionId] = answer;
  }

  goToQuestion(index: number): void {
    this.currentIndex = index;
  }

  prevQuestion(): void {
    if (this.currentIndex > 0) this.currentIndex--;
  }

  nextQuestion(): void {
    if (this.currentIndex < this.questions.length - 1) this.currentIndex++;
  }

  submitExam(): void {
    if (this.submitting || !this.exam) return;
    this.submitting = true;
    if (this.timerInterval) clearInterval(this.timerInterval);

    const request: ExamSubmissionRequest = {
      examId: this.exam.id,
      startedAt: this.startedAt,
      answers: this.questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: this.answers[q.id] || '',
      })),
    };

    this.examService.submitExam(request).subscribe({
      next: (result) => {
        this.result = result;
        this.submitting = false;
      },
      error: () => (this.submitting = false),
    });
  }
}
