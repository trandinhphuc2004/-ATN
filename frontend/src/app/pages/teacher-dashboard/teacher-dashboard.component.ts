import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TeacherService } from '../../services/teacher.service';
import { ExamAiService } from '../../services/exam-ai.service';
import { TeacherDashboard, ExamSummary, StudentProgress, ClassRoom } from '../../models/models';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, TranslateModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-icon">
          <mat-icon>school</mat-icon>
        </div>
        <div>
          <h1>{{ 'TEACHER_DASHBOARD.TITLE' | translate }}</h1>
          <p class="subtitle">{{ 'TEACHER_DASHBOARD.SUBTITLE' | translate }}</p>
        </div>
      </div>

      <!-- Chi hien cac lop giao vien duoc phan cong (admin: moi lop) -->
      @if (classes.length) {
        <div class="class-bar">
          <span class="class-bar-label"><mat-icon>groups</mat-icon> {{ 'TEACHER_DASHBOARD.SELECT_CLASS' | translate }}</span>
          @for (c of classes; track c.id) {
            <button class="class-chip" [class.active]="c.id === selectedClassId" (click)="selectClass(c.id)">
              {{ c.name }} <span class="chip-count">{{ c.studentCount }}</span>
            </button>
          }
        </div>
      }

      @if (noClasses) {
        <div class="info-msg"><mat-icon>info</mat-icon> {{ 'TEACHER_DASHBOARD.NO_CLASSES' | translate }}</div>
      } @else if (data) {
        <!-- Overview Metrics -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon students"><mat-icon>groups</mat-icon></div>
            <div class="metric-info">
              <span class="metric-value">{{ data.totalStudents }}</span>
              <span class="metric-label">{{ 'TEACHER_DASHBOARD.STUDENTS' | translate }}</span>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon exams"><mat-icon>assignment</mat-icon></div>
            <div class="metric-info">
              <span class="metric-value">{{ data.totalExams }}</span>
              <span class="metric-label">{{ 'TEACHER_DASHBOARD.EXAMS_ASSIGNED' | translate }}</span>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon avg"><mat-icon>trending_up</mat-icon></div>
            <div class="metric-info">
              <span class="metric-value">{{ data.classAverageScore | number:'1.0-0' }}%</span>
              <span class="metric-label">{{ 'TEACHER_DASHBOARD.CLASS_AVG' | translate }}</span>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon subs"><mat-icon>fact_check</mat-icon></div>
            <div class="metric-info">
              <span class="metric-value">{{ data.totalSubmissions }}</span>
              <span class="metric-label">{{ 'TEACHER_DASHBOARD.SUBMISSIONS' | translate }}</span>
            </div>
          </div>
        </div>

        <!-- Exam Performance -->
        @if (data.examSummaries?.length) {
          <div class="section">
            <h2><mat-icon>bar_chart</mat-icon> {{ 'TEACHER_DASHBOARD.PERFORMANCE' | translate }}</h2>
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>{{ 'TEACHER_DASHBOARD.EXAM_TH' | translate }}</th>
                    <th>{{ 'TEACHER_DASHBOARD.SUBMISSIONS_TH' | translate }}</th>
                    <th>{{ 'TEACHER_DASHBOARD.AVG_TH' | translate }}</th>
                    <th>{{ 'TEACHER_DASHBOARD.HIGH_TH' | translate }}</th>
                    <th>{{ 'TEACHER_DASHBOARD.LOW_TH' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (e of data.examSummaries; track e.examId) {
                    <tr>
                      <td class="exam-name">{{ e.examTitle }}</td>
                      <td>{{ e.submissions }}</td>
                      <td>
                        <span class="score-pill" [class.high]="e.averageScore >= 70"
                               [class.mid]="e.averageScore >= 50 && e.averageScore < 70"
                               [class.low]="e.averageScore < 50">
                          {{ e.averageScore | number:'1.0-0' }}%
                        </span>
                      </td>
                      <td>{{ e.highestScore | number:'1.0-0' }}%</td>
                      <td>{{ e.lowestScore | number:'1.0-0' }}%</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Lesson Progress: so hoc sinh cua lop da hoan thanh tung bai hoc duoc gan -->
        @if (data.lessonSummaries?.length) {
          <div class="section">
            <h2><mat-icon>menu_book</mat-icon> {{ 'TEACHER_DASHBOARD.LESSON_PROGRESS' | translate }}</h2>
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>{{ 'TEACHER_DASHBOARD.LESSON_TH' | translate }}</th>
                    <th>{{ 'TEACHER_DASHBOARD.COMPLETED_TH' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (l of data.lessonSummaries; track l.lessonId) {
                    <tr>
                      <td class="exam-name">{{ l.lessonTitle }}</td>
                      <td>{{ l.completedCount }} / {{ l.totalStudents }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Student Progress -->
        @if (data.studentProgressList?.length) {
          <div class="section">
            <h2><mat-icon>people</mat-icon> {{ 'TEACHER_DASHBOARD.STUDENT_PROGRESS' | translate }}</h2>
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>{{ 'TEACHER_DASHBOARD.STUDENT_TH' | translate }}</th>
                    <th>{{ 'TEACHER_DASHBOARD.EMAIL_TH' | translate }}</th>
                    <th>{{ 'TEACHER_DASHBOARD.EXAMS_TH' | translate }}</th>
                    <th>{{ 'TEACHER_DASHBOARD.AVG_SCORE_TH' | translate }}</th>
                    <th>{{ 'TEACHER_DASHBOARD.LESSONS_TH' | translate }}</th>
                    <th>{{ 'TEACHER_DASHBOARD.STUDY_TIME_TH' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (s of data.studentProgressList; track s.studentId) {
                    <tr>
                      <td class="student-name">{{ s.studentName }}</td>
                      <td class="student-email">{{ s.studentEmail }}</td>
                      <td>{{ s.examsCompleted }}</td>
                      <td>
                        <span class="score-pill" [class.high]="s.averageScore >= 70"
                              [class.mid]="s.averageScore >= 50 && s.averageScore < 70"
                              [class.low]="s.averageScore < 50">
                          {{ s.averageScore | number:'1.0-0' }}%
                        </span>
                      </td>
                      <td>{{ s.lessonsCompleted }}</td>
                      <td>{{ s.totalStudyMinutes }} {{ 'TEACHER_DASHBOARD.MINUTES_SHORT' | translate }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      } @else if (loadError) {
        <!-- Tai dashboard that bai: bao loi ro rang thay vi quay vong mai mai -->
        <div class="error-msg">
          <mat-icon>error_outline</mat-icon> {{ loadError }}
          <button class="submit-btn retry-btn" (click)="loadDashboard()">
            {{ 'TEACHER_DASHBOARD.RETRY' | translate }}
          </button>
        </div>
      } @else {
        <div class="loading-state"><mat-spinner></mat-spinner></div>
      }

      <!-- AI Exam Solver Section
           DAT NGOAI @if (data): truoc day khoi nay nam TRONG @if (data) nen khi
           API dashboard loi (401/403/500) thi data = null -> ca khu vuc nay bien mat,
           nguoi dung thay nut "Bat dau giai de" khong hien / khong bam duoc. -->
      <div class="section">
        <div class="section-header">
          <h2><mat-icon>smart_toy</mat-icon> {{ 'TEACHER_DASHBOARD.AI_SOLVER' | translate }}</h2>
        </div>
        <div class="ai-solver-card">
          <p class="ai-desc">{{ 'TEACHER_DASHBOARD.AI_SOLVER_DESC' | translate }}</p>

          <div class="upload-area" (click)="fileInput.click()" [class.has-file]="selectedFile">
            <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" style="display: none;">
            @if (!selectedFile) {
              <mat-icon class="upload-icon">cloud_upload</mat-icon>
              <div class="upload-text">{{ 'TEACHER_DASHBOARD.UPLOAD_TEXT' | translate }}</div>
              <div class="upload-hint">{{ 'TEACHER_DASHBOARD.UPLOAD_HINT' | translate }}</div>
            } @else {
              <mat-icon class="upload-icon success">check_circle</mat-icon>
              <div class="upload-text">{{ selectedFile.name }}</div>
              <button class="change-file-btn" (click)="$event.stopPropagation(); clearFile()">{{ 'TEACHER_DASHBOARD.REMOVE_FILE' | translate }}</button>
            }
          </div>

          <div class="ai-actions">
            <button class="submit-btn ai-btn" [disabled]="!selectedFile || isAnalyzing" (click)="analyzeExam()">
              @if (isAnalyzing) {
                <mat-spinner diameter="20" class="btn-spinner"></mat-spinner> {{ 'TEACHER_DASHBOARD.ANALYZING' | translate }}
              } @else {
                <mat-icon>auto_awesome</mat-icon> {{ 'TEACHER_DASHBOARD.START_SOLVE' | translate }}
              }
            </button>
            @if (!selectedFile && !isAnalyzing) {
              <!-- Noi ro vi sao nut dang mo: phai chon anh truoc -->
              <span class="btn-hint">{{ 'TEACHER_DASHBOARD.PICK_FILE_FIRST' | translate }}</span>
            }
          </div>

          @if (aiError) {
            <div class="error-msg">
              <mat-icon>error_outline</mat-icon> {{ aiError }}
            </div>
          }

          @if (aiResult) {
            <div class="ai-result animate-in">
              <h3>{{ 'TEACHER_DASHBOARD.RESULT_TITLE' | translate }}</h3>
              <div class="result-content" [innerHTML]="aiResult"></div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper { width: 100%; max-width: var(--page-max); margin: 0 auto; padding: 32px var(--page-gutter) 60px; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .header-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: #1E3932; color: white; flex-shrink: 0; }
    .header-icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: #006241; margin: 0 0 4px; letter-spacing: -0.01em; }
    .subtitle { font-size: 13px; color: rgba(0,0,0,0.58); margin: 0; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .metric-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .metric-icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; margin-bottom: 14px; background: #d4e9e2; color: #006241; }
    .metric-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .metric-icon.students { background: #d4e9e2; color: #006241; }
    .metric-icon.exams { background: #faf6ee; color: #a07c3e; }
    .metric-icon.avg { background: #d4e9e2; color: #006241; }
    .metric-icon.subs { background: #d4e9e2; color: #006241; }
    .metric-info { display: flex; flex-direction: column; gap: 2px; }
    .metric-value { font-size: 1.5rem; font-weight: 700; color: rgba(0,0,0,0.87); letter-spacing: -0.01em; }
    .metric-label { font-size: 13px; color: rgba(0,0,0,0.58); font-weight: 500; }
    .section { margin-bottom: 32px; }
    .section h2 { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 700; color: #006241; margin: 0 0 16px; letter-spacing: -0.01em; }
    .section h2 mat-icon { font-size: 20px; width: 20px; height: 20px; color: #00754A; }
    .table-wrapper { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 12px 16px; background: #f9f9f9; font-size: 12px; font-weight: 600; color: rgba(0,0,0,0.58); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #edebe9; }
    td { padding: 14px 16px; font-size: 14px; color: rgba(0,0,0,0.87); border-bottom: 1px solid #f2f0eb; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #fafafa; }
    .exam-name { font-weight: 700; color: rgba(0,0,0,0.87); letter-spacing: -0.01em; }
    .student-name { font-weight: 700; color: rgba(0,0,0,0.87); letter-spacing: -0.01em; }
    .student-email { font-size: 13px; color: rgba(0,0,0,0.40); }
    .score-pill { display: inline-block; padding: 2px 10px; border-radius: 50px; font-size: 12px; font-weight: 700; }
    .score-pill.high { background: #d4e9e2; color: #006241; }
    .score-pill.mid { background: #faf6ee; color: #a07c3e; }
    .score-pill.low { background: rgba(200,32,20,0.08); color: #c82014; }
    .loading-state { display: flex; justify-content: center; padding: 80px 0; }
    .class-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: -12px 0 24px; }
    .class-bar-label { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.58); margin-right: 4px; }
    .class-bar-label mat-icon { font-size: 18px; width: 18px; height: 18px; color: #00754A; }
    .class-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 50px; border: 1px solid #d6dbde; background: white; font-family: inherit; font-size: 14px; font-weight: 600; color: rgba(0,0,0,0.70); cursor: pointer; transition: all 0.2s; }
    .class-chip:hover { border-color: #00754A; color: #006241; }
    .class-chip.active { background: #00754A; border-color: #00754A; color: white; }
    .chip-count { font-size: 11px; padding: 1px 7px; border-radius: 50px; background: rgba(0,0,0,0.08); }
    .class-chip.active .chip-count { background: rgba(255,255,255,0.25); }
    .info-msg { display: flex; align-items: center; gap: 8px; padding: 14px 16px; margin-bottom: 32px; border-radius: 9px; background: #f2f0eb; color: rgba(0,0,0,0.70); font-size: 14px; }
    .info-msg mat-icon { color: #00754A; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h2 { margin-bottom: 0 !important; }
    .submit-btn { align-self: flex-start; padding: 10px 24px; border-radius: 50px; background: #00754A; color: white; border: 1px solid #00754A; font-weight: 600; font-size: 14px; font-family: inherit; cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em; }
    .submit-btn:hover:not(:disabled) { background: #006241; border-color: #006241; }
    .submit-btn:active:not(:disabled) { transform: scale(0.95); }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .ai-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .btn-hint { font-size: 13px; color: rgba(0,0,0,0.45); }
    .retry-btn { margin-left: 12px; padding: 6px 16px; font-size: 13px; }
    .empty-state mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .animate-in { animation: fadeInSlide 0.3s ease-out; }
    @keyframes fadeInSlide { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .ai-solver-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .ai-desc { color: rgba(0,0,0,0.58); font-size: 14px; margin-bottom: 20px; }
    .upload-area { border: 2px dashed #d6dbde; border-radius: 12px; padding: 40px 20px; text-align: center; cursor: pointer; transition: all 0.2s; background: #f9f9f9; margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .upload-area:hover { border-color: #00754A; background: #f2f0eb; }
    .upload-area.has-file { border-style: solid; border-color: #00754A; background: #d4e9e2; }
    .upload-icon { font-size: 40px; width: 40px; height: 40px; color: rgba(0,0,0,0.30); margin-bottom: 12px; }
    .upload-icon.success { color: #006241; }
    .upload-text { font-weight: 600; color: rgba(0,0,0,0.87); margin-bottom: 6px; }
    .upload-hint { font-size: 13px; color: rgba(0,0,0,0.40); }
    .change-file-btn { margin-top: 12px; padding: 6px 16px; border-radius: 50px; border: 1px solid #c82014; background: white; color: #c82014; font-weight: 600; cursor: pointer; font-size: 13px; }
    .change-file-btn:hover { background: rgba(200,32,20,0.06); }
    .ai-actions { display: flex; justify-content: flex-end; }
    .ai-btn { display: inline-flex; align-items: center; gap: 8px; font-size: 15px; padding: 12px 28px; background: #00754A; color: white; border: 1px solid #00754A; border-radius: 50px; cursor: pointer; font-family: inherit; font-weight: 600; transition: all 0.2s; letter-spacing: -0.01em; }
    .ai-btn:hover:not(:disabled) { background: #006241; border-color: #006241; }
    .ai-btn:active:not(:disabled) { transform: scale(0.95); }
    .ai-btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .btn-spinner { margin-right: 4px; }
    .btn-spinner ::ng-deep circle { stroke: white !important; }
    .ai-result { margin-top: 24px; padding: 20px; background: #d4e9e2; border-radius: 12px; }
    .ai-result h3 { color: #006241; margin: 0 0 16px; font-size: 16px; display: flex; align-items: center; gap: 8px; font-weight: 700; letter-spacing: -0.01em; }
    .result-content { font-size: 14px; color: rgba(0,0,0,0.87); line-height: 1.6; white-space: pre-wrap; font-family: system-ui, -apple-system, sans-serif; }
    .error-msg { margin-top: 16px; padding: 12px 16px; background: rgba(200,32,20,0.06); color: #c82014; border-radius: 9px; display: flex; align-items: center; gap: 8px; font-size: 14px; }
    @media (max-width: 768px) { .metrics-grid { grid-template-columns: repeat(2, 1fr); } .table-wrapper { overflow-x: auto; } }
    @media (max-width: 480px) { .metrics-grid { grid-template-columns: 1fr; } }
  `],
})
export class TeacherDashboardComponent implements OnInit {
  data: TeacherDashboard | null = null;
  classes: ClassRoom[] = [];
  selectedClassId: number | null = null;
  noClasses = false;

  isAnalyzing = false;
  selectedFile: File | null = null;
  aiResult: string | null = null;
  aiError: string | null = null;
  loadError: string | null = null;

  constructor(
    private teacherService: TeacherService,
    private examAiService: ExamAiService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadClasses();
  }

  /** Lop giao vien duoc phan cong; mac dinh mo lop dau tien. */
  loadClasses() {
    this.loadError = null;
    this.teacherService.getMyClasses().subscribe({
      next: (list) => {
        this.classes = list;
        this.noClasses = list.length === 0;
        if (list.length) {
          const keep = list.some(c => c.id === this.selectedClassId);
          this.selectClass(keep ? this.selectedClassId! : list[0].id);
        }
      },
      error: (err) => {
        console.error('[teacher-dashboard] khong tai duoc danh sach lop', err);
        this.loadError = this.describeError(err);
      }
    });
  }

  selectClass(classId: number) {
    this.selectedClassId = classId;
    this.data = null;
    this.loadDashboard();
  }

  loadDashboard() {
    if (this.selectedClassId === null) {
      this.loadClasses();
      return;
    }
    this.loadError = null;
    this.teacherService.getClassDashboard(this.selectedClassId).subscribe({
      next: (data) => {
        this.data = data;
      },
      // Truoc day KHONG co nhanh error -> API loi thi data cu null, giao dien
      // quay vong mai mai va khu vuc giai de khong bao gio hien ra.
      error: (err) => {
        console.error('[teacher-dashboard] khong tai duoc dashboard', err);
        this.loadError = this.describeError(err);
      }
    });
  }

  clearFile() {
    this.selectedFile = null;
    this.aiResult = null;
    this.aiError = null;
  }

  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    if (!file) return;

    // Kiem tra ngay tai trinh duyet de bao loi som, khong ton mot vong goi API.
    if (!file.type || !file.type.startsWith('image/')) {
      this.selectedFile = null;
      this.aiError = this.translate.instant('TEACHER_DASHBOARD.NOT_AN_IMAGE');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      this.selectedFile = null;
      this.aiError = this.translate.instant('TEACHER_DASHBOARD.FILE_TOO_LARGE');
      return;
    }

    this.selectedFile = file;
    this.aiResult = null;
    this.aiError = null;
    // Cho phep chon lai DUNG file vua xoa (neu khong reset, su kien change
    // se khong ban ra lan nua va nut van bi mo).
    input.value = '';
  }

  analyzeExam() {
    if (!this.selectedFile || this.isAnalyzing) return;

    this.isAnalyzing = true;
    this.aiError = null;
    this.aiResult = null;

    this.examAiService.analyzeExam(this.selectedFile).subscribe({
      next: (res) => {
        this.aiResult = this.formatAiText(res.result);
        this.isAnalyzing = false;
      },
      error: (err) => {
        console.error('[teacher-dashboard] loi khi giai de', err);
        this.aiError = this.describeError(err);
        this.isAnalyzing = false;
      }
    });
  }

  /** Doi ma loi HTTP thanh thong bao tieng Viet de hieu cho nguoi dung. */
  private describeError(err: any): string {
    const status = err && typeof err.status === 'number' ? err.status : 0;
    if (status === 0) {
      return this.translate.instant('TEACHER_DASHBOARD.ERR_NETWORK');
    }
    if (status === 401) {
      return this.translate.instant('TEACHER_DASHBOARD.ERR_SESSION');
    }
    if (status === 403) {
      return this.translate.instant('TEACHER_DASHBOARD.ERR_FORBIDDEN');
    }
    return this.translate.instant('TEACHER_DASHBOARD.AI_ERROR');
  }

  formatAiText(text: string): string {
    if (!text) return '';
    // Xử lý in đậm: **text** -> <strong>text</strong>
    let formatted = text.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
    // Xử lý in nghiêng: *text* -> <em>text</em>
    formatted = formatted.replace(/\*([\s\S]*?)\*/g, '<em>$1</em>');
    // Xử lý in đậm in nghiêng (nếu AI nhả ra ***text***) có thể được xử lý bởi chuỗi trên tự nhiên
    return formatted;
  }
}
