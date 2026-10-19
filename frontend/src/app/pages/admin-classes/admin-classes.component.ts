import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ClassRoomService } from '../../services/class-room.service';
import { UserManagementService } from '../../services/user-management.service';
import { LessonService } from '../../services/lesson.service';
import { ExamService } from '../../services/exam.service';
import { ClassRoom, Exam, Lesson, User } from '../../models/models';

type AssignTab = 'students' | 'teachers' | 'lessons' | 'exams';

/** Mot dong trong danh sach chon de gan vao lop. */
interface Candidate {
  id: number;
  label: string;
  sub: string;
  note?: string;
}

/**
 * Quan tri vien tao lop va gan hoc sinh, giao vien, bai hoc, bai kiem tra vao lop.
 * Hoc sinh chi thay bai hoc / bai kiem tra cua lop minh; chi giao vien duoc gan
 * moi xem duoc diem va tien do cua lop.
 */
@Component({
  selector: 'app-admin-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule, TranslateModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-icon"><mat-icon>groups</mat-icon></div>
        <div>
          <h1>{{ 'ADMIN_CLASSES.TITLE' | translate }}</h1>
          <p>{{ 'ADMIN_CLASSES.SUBTITLE' | translate }}</p>
        </div>
        <button class="btn-primary header-btn" (click)="openCreate()">
          <mat-icon>add</mat-icon> {{ 'ADMIN_CLASSES.CREATE_CLASS' | translate }}
        </button>
      </div>

      @if (loadError) {
        <div class="error-box"><mat-icon>error_outline</mat-icon> {{ loadError }}</div>
      }

      @if (loading) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <div class="layout">
          <!-- Danh sach lop -->
          <aside class="class-list">
            @for (c of classes; track c.id) {
              <button class="class-card" [class.active]="selected?.id === c.id" (click)="selectClass(c.id)">
                <div class="class-card-top">
                  <span class="class-name">{{ c.name }}</span>
                  @if (c.gradeLevel) {
                    <span class="grade-badge">{{ 'ADMIN_CLASSES.GRADE' | translate:{ grade: c.gradeLevel } }}</span>
                  }
                </div>
                @if (c.schoolYear) { <div class="class-year">{{ c.schoolYear }}</div> }
                <div class="class-stats">
                  <span><mat-icon>person</mat-icon>{{ c.studentCount }}</span>
                  <span><mat-icon>menu_book</mat-icon>{{ c.lessonCount }}</span>
                  <span><mat-icon>assignment</mat-icon>{{ c.examCount }}</span>
                </div>
                <div class="class-teachers">
                  <mat-icon>school</mat-icon>
                  {{ c.teacherNames.length ? c.teacherNames.join(', ') : ('ADMIN_CLASSES.NO_TEACHER' | translate) }}
                </div>
              </button>
            }
            @if (classes.length === 0) {
              <div class="empty-state">{{ 'ADMIN_CLASSES.EMPTY' | translate }}</div>
            }
          </aside>

          <!-- Chi tiet lop + gan thanh vien / noi dung -->
          <section class="detail">
            @if (!selected) {
              <div class="placeholder">
                <mat-icon>touch_app</mat-icon>
                <p>{{ 'ADMIN_CLASSES.SELECT_HINT' | translate }}</p>
              </div>
            } @else {
              <div class="detail-header">
                <div>
                  <h2>{{ selected.name }}</h2>
                  <p class="detail-meta">
                    @if (selected.gradeLevel) { {{ 'ADMIN_CLASSES.GRADE' | translate:{ grade: selected.gradeLevel } }} · }
                    @if (selected.schoolYear) { {{ selected.schoolYear }} · }
                    {{ 'ADMIN_CLASSES.STUDENTS_COUNT' | translate:{ count: selected.studentCount } }} ·
                    {{ 'ADMIN_CLASSES.LESSONS_COUNT' | translate:{ count: selected.lessonCount } }} ·
                    {{ 'ADMIN_CLASSES.EXAMS_COUNT' | translate:{ count: selected.examCount } }}
                  </p>
                  @if (selected.description) { <p class="detail-desc">{{ selected.description }}</p> }
                </div>
                <div class="detail-actions">
                  <button class="btn-icon edit" (click)="openEdit()" [title]="'ADMIN_CLASSES.EDIT_CLASS' | translate"><mat-icon>edit</mat-icon></button>
                  <button class="btn-icon del" (click)="confirmingDelete = true" [title]="'ADMIN_CLASSES.DELETE_CLASS' | translate"><mat-icon>delete</mat-icon></button>
                </div>
              </div>

              <div class="tabs">
                @for (t of tabs; track t.key) {
                  <button class="tab" [class.active]="tab === t.key" (click)="switchTab(t.key)">
                    <mat-icon>{{ t.icon }}</mat-icon> {{ t.label | translate }}
                  </button>
                }
              </div>

              <p class="tab-hint"><mat-icon>info</mat-icon> {{ tabHint | translate }}</p>

              <div class="assign-toolbar">
                <input class="search-input" [placeholder]="'ADMIN_CLASSES.SEARCH' | translate" [(ngModel)]="search" />
                <span class="selected-count">{{ 'ADMIN_CLASSES.SELECTED' | translate:{ count: checked.size } }}</span>
                <button class="btn-primary" (click)="saveAssignment()" [disabled]="saving">
                  <mat-icon>save</mat-icon> {{ (saving ? 'COMMON.SAVING' : 'ADMIN_CLASSES.SAVE_ASSIGN') | translate }}
                </button>
              </div>

              @if (assignMsg) { <div class="ok-msg"><mat-icon>check_circle</mat-icon> {{ assignMsg }}</div> }
              @if (assignError) { <div class="error-msg">{{ assignError }}</div> }

              <div class="candidate-list">
                @for (c of filteredCandidates; track c.id) {
                  <label class="candidate" [class.checked]="checked.has(c.id)">
                    <input type="checkbox" [checked]="checked.has(c.id)" (change)="toggle(c.id)" />
                    <div class="candidate-text">
                      <span class="candidate-label">{{ c.label }}</span>
                      <span class="candidate-sub">{{ c.sub }}</span>
                    </div>
                    @if (c.note) { <span class="candidate-note">{{ c.note }}</span> }
                  </label>
                }
                @if (filteredCandidates.length === 0) {
                  <div class="empty-state">{{ 'ADMIN_CLASSES.NOTHING' | translate }}</div>
                }
              </div>
            }
          </section>
        </div>
      }

      <!-- Tao / sua lop -->
      @if (showModal) {
        <div class="modal-overlay" (click)="showModal = false">
          <div class="modal" (click)="$event.stopPropagation()">
            <h2>{{ (editing ? 'ADMIN_CLASSES.EDIT_CLASS' : 'ADMIN_CLASSES.CREATE_CLASS') | translate }}</h2>
            <div class="form-group">
              <label>{{ 'ADMIN_CLASSES.LABEL_NAME' | translate }}</label>
              <input [(ngModel)]="form.name" [placeholder]="'ADMIN_CLASSES.PH_NAME' | translate" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ 'ADMIN_CLASSES.LABEL_GRADE' | translate }}</label>
                <select [(ngModel)]="form.gradeLevel">
                  <option [ngValue]="null">—</option>
                  @for (g of grades; track g) { <option [ngValue]="g">{{ g }}</option> }
                </select>
              </div>
              <div class="form-group">
                <label>{{ 'ADMIN_CLASSES.LABEL_YEAR' | translate }}</label>
                <input [(ngModel)]="form.schoolYear" [placeholder]="'ADMIN_CLASSES.PH_YEAR' | translate" />
              </div>
            </div>
            <div class="form-group">
              <label>{{ 'ADMIN_CLASSES.LABEL_DESC' | translate }}</label>
              <textarea rows="3" [(ngModel)]="form.description"></textarea>
            </div>
            @if (formError) { <div class="error-msg">{{ formError }}</div> }
            <div class="modal-actions">
              <button class="btn-outline" (click)="showModal = false">{{ 'COMMON.CANCEL' | translate }}</button>
              <button class="btn-primary" (click)="saveClass()" [disabled]="saving">
                {{ (saving ? 'COMMON.SAVING' : (editing ? 'COMMON.UPDATE' : 'COMMON.CREATE')) | translate }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Xac nhan xoa lop -->
      @if (confirmingDelete && selected) {
        <div class="modal-overlay" (click)="confirmingDelete = false">
          <div class="modal modal-sm" (click)="$event.stopPropagation()">
            <h2>{{ 'ADMIN_CLASSES.DELETE_CLASS' | translate }}</h2>
            <p>{{ 'ADMIN_CLASSES.DELETE_CONFIRM' | translate:{ name: selected.name } }}</p>
            <div class="modal-actions">
              <button class="btn-outline" (click)="confirmingDelete = false">{{ 'COMMON.CANCEL' | translate }}</button>
              <button class="btn-danger" (click)="deleteClass()" [disabled]="saving">
                {{ (saving ? 'COMMON.DELETING' : 'COMMON.DELETE') | translate }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-wrapper { width: 100%; max-width: var(--page-max); margin: 0 auto; padding: 40px var(--page-gutter) 60px; }
    .page-header { display: flex; align-items: center; gap: 18px; margin-bottom: 28px; }
    .header-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: #1E3932; color: white; flex-shrink: 0; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: #006241; margin: 0 0 4px; letter-spacing: -0.01em; }
    .page-header p { font-size: 0.9rem; color: rgba(0,0,0,0.58); margin: 0; }
    .header-btn { margin-left: auto; }
    .loading { display: flex; justify-content: center; padding: 60px 0; }
    .layout { display: grid; grid-template-columns: 300px 1fr; gap: 24px; align-items: start; }
    .class-list { display: flex; flex-direction: column; gap: 10px; }
    .class-card { text-align: left; background: white; border: 1px solid transparent; border-radius: 12px; padding: 14px 16px; cursor: pointer; font-family: inherit; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); transition: all 0.2s; }
    .class-card:hover { border-color: #00754A; }
    .class-card.active { border-color: #00754A; background: #f2f8f5; box-shadow: 0 0 0 3px rgba(0,117,74,0.12); }
    .class-card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .class-name { font-size: 1.05rem; font-weight: 700; color: #006241; }
    .grade-badge { padding: 2px 10px; border-radius: 50px; background: #faf6ee; color: #a07c3e; font-size: 11px; font-weight: 700; }
    .class-year { font-size: 12px; color: rgba(0,0,0,0.45); margin-top: 2px; }
    .class-stats { display: flex; gap: 14px; margin-top: 10px; font-size: 13px; color: rgba(0,0,0,0.70); }
    .class-stats span, .class-teachers { display: inline-flex; align-items: center; gap: 4px; }
    .class-stats mat-icon, .class-teachers mat-icon { font-size: 16px; width: 16px; height: 16px; color: #00754A; }
    .class-teachers { margin-top: 8px; font-size: 12px; color: rgba(0,0,0,0.58); }
    .detail { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); min-height: 320px; }
    .placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 80px 20px; color: rgba(0,0,0,0.45); text-align: center; }
    .placeholder mat-icon { font-size: 40px; width: 40px; height: 40px; color: #00754A; }
    .detail-header { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
    .detail-header h2 { margin: 0 0 4px; font-size: 1.35rem; color: #006241; }
    .detail-meta { margin: 0; font-size: 13px; color: rgba(0,0,0,0.58); }
    .detail-desc { margin: 8px 0 0; font-size: 14px; color: rgba(0,0,0,0.70); }
    .detail-actions { display: flex; gap: 8px; }
    .tabs { display: flex; gap: 6px; border-bottom: 1px solid #edebe9; margin-bottom: 14px; flex-wrap: wrap; }
    .tab { display: inline-flex; align-items: center; gap: 6px; padding: 10px 14px; border: none; background: transparent; font-family: inherit; font-size: 14px; font-weight: 600; color: rgba(0,0,0,0.58); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; }
    .tab mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .tab.active { color: #006241; border-bottom-color: #00754A; }
    .tab-hint { display: flex; align-items: center; gap: 6px; font-size: 13px; color: rgba(0,0,0,0.58); margin: 0 0 14px; }
    .tab-hint mat-icon { font-size: 16px; width: 16px; height: 16px; color: #00754A; flex-shrink: 0; }
    .assign-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
    .search-input { padding: 9px 13px; border: 1px solid #d6dbde; border-radius: 50px; font-size: 14px; font-family: inherit; outline: none; background: white; min-width: 220px; }
    .search-input:focus { border-color: #00754A; box-shadow: 0 0 0 3px rgba(0,117,74,0.10); }
    .selected-count { font-size: 13px; color: rgba(0,0,0,0.58); margin-right: auto; }
    .candidate-list { display: flex; flex-direction: column; border: 1px solid #edebe9; border-radius: 10px; max-height: 440px; overflow-y: auto; }
    .candidate { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-bottom: 1px solid #f2f0eb; cursor: pointer; }
    .candidate:last-child { border-bottom: none; }
    .candidate:hover { background: #fafafa; }
    .candidate.checked { background: #f2f8f5; }
    .candidate input { width: 16px; height: 16px; accent-color: #00754A; cursor: pointer; }
    .candidate-text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .candidate-label { font-size: 14px; font-weight: 600; color: rgba(0,0,0,0.87); }
    .candidate-sub { font-size: 12px; color: rgba(0,0,0,0.45); }
    .candidate-note { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 50px; background: #faf6ee; color: #a07c3e; white-space: nowrap; }
    .empty-state { text-align: center; padding: 32px; color: rgba(0,0,0,0.40); font-size: 14px; }
    .btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: #00754A; color: white; border: 1px solid #00754A; border-radius: 50px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; }
    .btn-primary:hover:not(:disabled) { background: #006241; border-color: #006241; }
    .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
    .btn-primary mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .btn-icon { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border: none; border-radius: 50%; cursor: pointer; transition: all 0.2s; }
    .btn-icon.edit { background: #d4e9e2; color: #006241; }
    .btn-icon.edit:hover { background: #00754A; color: white; }
    .btn-icon.del { background: rgba(200,32,20,0.08); color: #c82014; }
    .btn-icon.del:hover { background: rgba(200,32,20,0.16); }
    .btn-icon mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .ok-msg { display: flex; align-items: center; gap: 6px; color: #006241; font-size: 13px; margin-bottom: 10px; }
    .ok-msg mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .error-msg { color: #c82014; font-size: 13px; margin-bottom: 10px; }
    .error-box { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 12px 16px; border-radius: 9px; background: rgba(200,32,20,0.06); color: #c82014; font-size: 14px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; padding: 32px; width: 460px; max-width: 95vw; box-shadow: 0 8px 40px rgba(0,0,0,0.18); }
    .modal-sm { width: 380px; }
    .modal h2 { font-size: 1.2rem; font-weight: 700; color: #006241; margin: 0 0 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; }
    .form-group label { font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.70); }
    .form-group input, .form-group select, .form-group textarea { padding: 9px 13px; border: 1px solid #d6dbde; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; background: #f9f9f9; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #00754A; box-shadow: 0 0 0 3px rgba(0,117,74,0.10); background: white; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .btn-outline { padding: 9px 18px; background: white; border: 1px solid #d6dbde; border-radius: 50px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; color: rgba(0,0,0,0.87); }
    .btn-outline:hover { background: #f2f0eb; }
    .btn-danger { padding: 9px 18px; background: #c82014; color: white; border: 1px solid #c82014; border-radius: 50px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; }
    .btn-danger:hover:not(:disabled) { background: #a5180e; border-color: #a5180e; }
    .btn-danger:disabled { opacity: 0.55; cursor: not-allowed; }
    @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } .page-header { flex-wrap: wrap; } .header-btn { margin-left: 0; } }
  `]
})
export class AdminClassesComponent implements OnInit {
  classes: ClassRoom[] = [];
  selected: ClassRoom | null = null;
  loading = false;
  loadError = '';
  saving = false;

  tab: AssignTab = 'students';
  tabs: { key: AssignTab; icon: string; label: string }[] = [
    { key: 'students', icon: 'person', label: 'ADMIN_CLASSES.TAB_STUDENTS' },
    { key: 'teachers', icon: 'school', label: 'ADMIN_CLASSES.TAB_TEACHERS' },
    { key: 'lessons', icon: 'menu_book', label: 'ADMIN_CLASSES.TAB_LESSONS' },
    { key: 'exams', icon: 'assignment', label: 'ADMIN_CLASSES.TAB_EXAMS' },
  ];
  search = '';
  checked = new Set<number>();
  assignMsg = '';
  assignError = '';

  students: User[] = [];
  teachers: User[] = [];
  lessons: Lesson[] = [];
  exams: Exam[] = [];

  showModal = false;
  editing = false;
  confirmingDelete = false;
  formError = '';
  form: { name: string; gradeLevel: number | null; schoolYear: string; description: string } = this.emptyForm();
  grades = [6, 7, 8, 9, 10, 11, 12];

  constructor(
    private classService: ClassRoomService,
    private userMgmt: UserManagementService,
    private lessonService: LessonService,
    private examService: ExamService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    forkJoin({
      classes: this.classService.getAll(),
      students: this.userMgmt.getUsers({ role: 'STUDENT' }),
      teachers: this.userMgmt.getUsers({ role: 'TEACHER' }),
      lessons: this.lessonService.getAll(),
      exams: this.examService.getAllExams(),
    }).subscribe({
      next: r => {
        this.classes = r.classes;
        this.students = r.students;
        this.teachers = r.teachers;
        this.lessons = r.lessons;
        this.exams = r.exams;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = this.translate.instant('ADMIN_CLASSES.ERR_LOAD');
      }
    });
  }

  get tabHint(): string {
    return {
      students: 'ADMIN_CLASSES.HINT_STUDENTS',
      teachers: 'ADMIN_CLASSES.HINT_TEACHERS',
      lessons: 'ADMIN_CLASSES.HINT_LESSONS',
      exams: 'ADMIN_CLASSES.HINT_EXAMS',
    }[this.tab];
  }

  get candidates(): Candidate[] {
    switch (this.tab) {
      case 'students':
        return this.students.map(s => ({
          id: s.id, label: s.name, sub: s.email,
          note: s.classId && s.classId !== this.selected?.id
            ? this.translate.instant('ADMIN_CLASSES.IN_OTHER_CLASS', { name: s.className })
            : undefined
        }));
      case 'teachers':
        return this.teachers.map(t => ({ id: t.id, label: t.name, sub: t.email }));
      case 'lessons':
        return this.lessons.map(l => ({ id: l.id, label: l.title, sub: `${l.topic} · ${l.difficulty}` }));
      case 'exams':
        return this.exams.map(e => ({
          id: e.id, label: e.title, sub: `${e.questionCount} · ${e.createdByName}`,
          note: e.active ? undefined : this.translate.instant('ADMIN_CLASSES.INACTIVE')
        }));
    }
  }

  get filteredCandidates(): Candidate[] {
    const q = this.search.trim().toLowerCase();
    return q ? this.candidates.filter(c => c.label.toLowerCase().includes(q)) : this.candidates;
  }

  selectClass(id: number): void {
    this.assignMsg = '';
    this.assignError = '';
    this.classService.getById(id).subscribe({
      next: c => { this.selected = c; this.resetChecked(); },
      error: () => this.loadError = this.translate.instant('ADMIN_CLASSES.ERR_LOAD')
    });
  }

  switchTab(tab: AssignTab): void {
    this.tab = tab;
    this.search = '';
    this.assignMsg = '';
    this.assignError = '';
    this.resetChecked();
  }

  toggle(id: number): void {
    if (this.checked.has(id)) this.checked.delete(id); else this.checked.add(id);
    this.assignMsg = '';
  }

  /** Danh dau san cac muc dang thuoc lop theo tab hien tai. */
  private resetChecked(): void {
    const c = this.selected;
    const current = !c ? [] : {
      students: c.students ?? [],
      teachers: c.teachers ?? [],
      lessons: c.lessons ?? [],
      exams: c.exams ?? [],
    }[this.tab];
    this.checked = new Set(current.map(x => x.id));
  }

  saveAssignment(): void {
    if (!this.selected) return;
    this.saving = true;
    this.assignMsg = '';
    this.assignError = '';
    this.classService.setMembers(this.selected.id, this.tab, [...this.checked]).subscribe({
      next: c => {
        this.saving = false;
        this.selected = c;
        this.resetChecked();
        this.assignMsg = this.translate.instant('ADMIN_CLASSES.SAVED');
        this.refreshClasses();
        // Hoc sinh co the vua duoc chuyen lop: tai lai de cap nhat nhan "Dang o lop ..."
        if (this.tab === 'students') {
          this.userMgmt.getUsers({ role: 'STUDENT' }).subscribe(s => this.students = s);
        }
      },
      error: e => {
        this.saving = false;
        this.assignError = this.errorText(e, 'ADMIN_CLASSES.ERR_SAVE');
      }
    });
  }

  openCreate(): void {
    this.editing = false;
    this.form = this.emptyForm();
    this.formError = '';
    this.showModal = true;
  }

  openEdit(): void {
    if (!this.selected) return;
    this.editing = true;
    this.form = {
      name: this.selected.name,
      gradeLevel: this.selected.gradeLevel ?? null,
      schoolYear: this.selected.schoolYear ?? '',
      description: this.selected.description ?? '',
    };
    this.formError = '';
    this.showModal = true;
  }

  saveClass(): void {
    if (!this.form.name.trim()) {
      this.formError = this.translate.instant('ADMIN_CLASSES.ERR_NAME_REQUIRED');
      return;
    }
    this.saving = true;
    const req = { ...this.form, name: this.form.name.trim() };
    const obs = this.editing && this.selected
      ? this.classService.update(this.selected.id, req)
      : this.classService.create(req);
    obs.subscribe({
      next: c => {
        this.saving = false;
        this.showModal = false;
        this.refreshClasses();
        this.selectClass(c.id);
      },
      error: e => {
        this.saving = false;
        this.formError = this.errorText(e, 'ADMIN_CLASSES.ERR_SAVE');
      }
    });
  }

  deleteClass(): void {
    if (!this.selected) return;
    this.saving = true;
    this.classService.delete(this.selected.id).subscribe({
      next: () => {
        this.saving = false;
        this.confirmingDelete = false;
        this.selected = null;
        this.refreshClasses();
        this.userMgmt.getUsers({ role: 'STUDENT' }).subscribe(s => this.students = s);
      },
      error: e => {
        this.saving = false;
        this.confirmingDelete = false;
        this.loadError = this.errorText(e, 'ADMIN_CLASSES.ERR_SAVE');
      }
    });
  }

  private refreshClasses(): void {
    this.classService.getAll().subscribe(list => this.classes = list);
  }

  private emptyForm() {
    return { name: '', gradeLevel: null as number | null, schoolYear: '', description: '' };
  }

  /** Backend tra loi dang { error: "..." }. */
  private errorText(e: any, fallbackKey: string): string {
    return e?.error?.error || this.translate.instant(fallbackKey);
  }
}
