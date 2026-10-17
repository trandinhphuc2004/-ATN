import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LessonService } from '../../services/lesson.service';
import { MoleculeService } from '../../services/molecule.service';
import { AuthService } from '../../services/auth.service';
import { Lesson, Molecule, CreateLessonRequest } from '../../models/models';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-icon"><mat-icon>school</mat-icon></div>
        <div>
          <h1>{{ 'LESSONS.TITLE' | translate }}</h1>
          <p>{{ 'LESSONS.SUBTITLE' | translate }}</p>
        </div>
        @if (isAdminOrTeacher) {
          <button class="btn-add" (click)="openCreate()"><mat-icon>add</mat-icon> {{ 'LESSONS.ADD_LESSON' | translate }}</button>
        }
      </div>

      @if (isStudent) {
        @if (currentUser?.className) {
          <p class="class-scope"><mat-icon>groups</mat-icon> {{ 'LESSONS.CLASS_SCOPE' | translate:{ name: currentUser?.className } }}</p>
        } @else {
          <div class="no-class"><mat-icon>info</mat-icon> {{ 'LESSONS.NO_CLASS' | translate }}</div>
        }
      }

      <div class="search-bar">
        <mat-icon class="search-icon">search</mat-icon>
        <input class="search-input" [placeholder]="'LESSONS.SEARCH_PLACEHOLDER' | translate" [(ngModel)]="searchTitle" (input)="onSearch()" />
      </div>

      <!-- Difficulty filter -->
      <div class="filter-row">
        @for (diff of ['', 'EASY', 'MEDIUM', 'HARD']; track diff) {
          <button class="filter-btn" [class.active]="selectedDiff === diff" (click)="filterByDiff(diff)">
            {{ diff ? (('COMMON.' + diff) | translate) : ('COMMON.ALL' | translate) }}
          </button>
        }
      </div>

      <div class="lesson-grid">
        @for (lesson of lessons; track lesson.id) {
          <div class="lesson-card">
            <div class="card-body" [routerLink]="['/lessons', lesson.id]">
              <div class="card-top">
                <div class="card-icon-wrap"><mat-icon>menu_book</mat-icon></div>
                <span class="difficulty-badge" [class]="'diff-' + lesson.difficulty.toLowerCase()">{{ lesson.difficulty }}</span>
              </div>
              <h3>{{ lesson.title }}</h3>
              <span class="topic-badge">{{ lesson.topic }}</span>
              @if (lesson.molecule) {
                <p class="molecule-ref"><mat-icon>view_in_ar</mat-icon> {{ lesson.molecule.name }} ({{ lesson.molecule.formula }})</p>
              }
              <div class="card-action"><span>{{ 'LESSONS.OPEN_LESSON' | translate }}</span><mat-icon>arrow_forward</mat-icon></div>
            </div>
            @if (isAdminOrTeacher) {
              <div class="card-actions">
                <button class="btn-icon edit" (click)="openEdit(lesson)"><mat-icon>edit</mat-icon></button>
                <button class="btn-icon del" (click)="confirmDelete(lesson)"><mat-icon>delete</mat-icon></button>
              </div>
            }
          </div>
        }
      </div>
      @if (lessons.length === 0 && !(isStudent && !currentUser?.className)) {
        <div class="empty-state">{{ 'LESSONS.EMPTY' | translate }}</div>
      }

      <!-- Create / Edit Modal -->
      @if (showModal) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <h2>{{ (editingId ? 'LESSONS.EDIT_LESSON' : 'LESSONS.ADD_LESSON') | translate }}</h2>
            <div class="form-group"><label>{{ 'LESSONS.LABEL_TITLE' | translate }}</label><input [(ngModel)]="form.title" [placeholder]="'LESSONS.PH_TITLE' | translate" /></div>
            <div class="form-group">
              <label>{{ 'LESSONS.LABEL_TOPIC' | translate }}</label>
              <input [(ngModel)]="form.topic" [placeholder]="'LESSONS.PH_TOPIC' | translate" />
            </div>
            <div class="form-group">
              <label>{{ 'LESSONS.LABEL_DIFFICULTY' | translate }}</label>
              <select [(ngModel)]="form.difficulty">
                <option value="EASY">{{ 'COMMON.EASY' | translate }}</option>
                <option value="MEDIUM">{{ 'COMMON.MEDIUM' | translate }}</option>
                <option value="HARD">{{ 'COMMON.HARD' | translate }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ 'LESSONS.LABEL_MOLECULE' | translate }}</label>
              <select [(ngModel)]="form.moleculeId">
                <option [value]="null">{{ 'COMMON.NONE' | translate }}</option>
                @for (m of allMolecules; track m.id) {
                  <option [value]="m.id">{{ m.name }} ({{ m.formula }})</option>
                }
              </select>
            </div>
            <div class="form-group"><label>{{ 'LESSONS.LABEL_CONTENT' | translate }}</label><textarea [(ngModel)]="form.content" rows="5" [placeholder]="'LESSONS.PH_CONTENT' | translate"></textarea></div>
            @if (errorMsg) { <div class="error-msg">{{ errorMsg }}</div> }
            <div class="modal-actions">
              <button class="btn-outline" (click)="closeModal()">{{ 'COMMON.CANCEL' | translate }}</button>
              <button class="btn-primary" (click)="save()" [disabled]="saving">{{ (saving ? 'COMMON.SAVING' : (editingId ? 'COMMON.UPDATE' : 'COMMON.CREATE')) | translate }}</button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirm -->
      @if (deletingLesson) {
        <div class="modal-overlay" (click)="deletingLesson = null">
          <div class="modal modal-sm" (click)="$event.stopPropagation()">
            <h2>{{ 'LESSONS.DELETE_LESSON' | translate }}</h2>
            <p>{{ 'COMMON.DELETE' | translate }} <strong>{{ deletingLesson.title }}</strong>?</p>
            @if (deleteError) { <div class="error-msg">{{ deleteError }}</div> }
            <div class="modal-actions">
              <button class="btn-outline" (click)="deletingLesson = null">{{ 'COMMON.CANCEL' | translate }}</button>
              <button class="btn-danger" (click)="doDelete()" [disabled]="saving">{{ (saving ? 'COMMON.DELETING' : 'COMMON.DELETE') | translate }}</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-wrapper { width: 100%; max-width: var(--page-max); margin: 0 auto; padding: 40px var(--page-gutter) 60px; }
    .page-header { display: flex; align-items: center; gap: 18px; margin-bottom: 20px; }
    .header-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: #1E3932; color: white; flex-shrink: 0; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: #006241; margin: 0 0 4px; flex: 1; letter-spacing: -0.01em; }
    .page-header p { font-size: 0.9rem; color: rgba(0,0,0,0.58); margin: 0; }
    .btn-add { display: inline-flex; align-items: center; gap: 6px; padding: 8px 20px; background: #00754A; color: white; border: 1px solid #00754A; border-radius: 50px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; white-space: nowrap; transition: all 0.2s; letter-spacing: -0.01em; }
    .btn-add:hover { background: #006241; border-color: #006241; }
    .btn-add:active { transform: scale(0.95); }
    .search-bar { display: flex; align-items: center; gap: 10px; background: white; border: 1px solid #d6dbde; border-radius: 50px; padding: 8px 18px; margin-bottom: 20px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .search-icon { color: rgba(0,0,0,0.40); font-size: 20px; width: 20px; height: 20px; }
    .search-input { border: none; outline: none; font-size: 14px; font-family: inherit; flex: 1; background: transparent; color: rgba(0,0,0,0.87); letter-spacing: -0.01em; }
    .filter-row { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
    .filter-btn { padding: 5px 16px; border: 1px solid #d6dbde; border-radius: 50px; background: white; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; color: rgba(0,0,0,0.70); transition: all 0.2s; letter-spacing: -0.01em; }
    .filter-btn.active { background: #00754A; color: white; border-color: #00754A; }
    .filter-btn:hover:not(.active) { border-color: #00754A; color: #00754A; }
    .lesson-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .lesson-card { background: white; border-radius: 12px; overflow: hidden; transition: all 0.2s; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .lesson-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06); }
    .card-body { padding: 24px; cursor: pointer; }
    .card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .card-icon-wrap { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: #d4e9e2; color: #006241; }
    .card-icon-wrap mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .difficulty-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.02em; }
    .diff-easy { background: #d4e9e2; color: #006241; }
    .diff-medium { background: #faf6ee; color: #a07c3e; }
    .diff-hard { background: rgba(200,32,20,0.08); color: #c82014; }
    .lesson-card h3 { font-size: 1rem; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0 0 8px; letter-spacing: -0.01em; }
    .topic-badge { display: inline-block; padding: 3px 10px; font-size: 12px; font-weight: 600; color: #00754A; background: #d4e9e2; border-radius: 50px; margin-bottom: 12px; }
    .molecule-ref { display: flex; align-items: center; gap: 6px; font-size: 13px; color: rgba(0,0,0,0.58); margin: 0 0 14px; }
    .molecule-ref mat-icon { font-size: 15px; width: 15px; height: 15px; color: #00754A; }
    .card-action { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #00754A; letter-spacing: -0.01em; }
    .card-action mat-icon { font-size: 16px; width: 16px; height: 16px; transition: transform 0.2s; }
    .lesson-card:hover .card-action mat-icon { transform: translateX(3px); }
    .card-actions { display: flex; gap: 8px; padding: 8px 16px 12px; border-top: 1px solid #edebe9; }
    .btn-icon { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border: none; border-radius: 50%; cursor: pointer; transition: all 0.15s; }
    .btn-icon.edit { background: #d4e9e2; color: #006241; }
    .btn-icon.del { background: rgba(200,32,20,0.08); color: #c82014; }
    .btn-icon mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .empty-state { text-align: center; padding: 60px; color: rgba(0,0,0,0.45); font-size: 15px; }
    .class-scope { display: flex; align-items: center; gap: 6px; margin: -8px 0 16px; font-size: 14px; font-weight: 600; color: #006241; }
    .class-scope mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .no-class { display: flex; align-items: center; gap: 8px; margin: -8px 0 20px; padding: 12px 16px; border-radius: 9px; background: #f2f0eb; color: rgba(0,0,0,0.70); font-size: 14px; }
    .no-class mat-icon { color: #00754A; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.40); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; padding: 32px; width: 480px; max-width: 95vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 8px 40px rgba(0,0,0,0.18); }
    .modal-sm { width: 360px; }
    .modal h2 { font-size: 1.15rem; font-weight: 700; color: #006241; margin: 0 0 20px; letter-spacing: -0.01em; }
    .modal p { color: rgba(0,0,0,0.70); margin: 0 0 4px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
    .form-group label { font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.70); letter-spacing: -0.01em; }
    .form-group input, .form-group select, .form-group textarea { padding: 9px 13px; border: 1px solid #d6dbde; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; resize: vertical; background: #f9f9f9; color: rgba(0,0,0,0.87); transition: border-color 0.2s; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #00754A; box-shadow: 0 0 0 3px rgba(0,117,74,0.10); background: white; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .btn-outline { padding: 8px 20px; background: white; border: 1px solid #d6dbde; border-radius: 50px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; color: rgba(0,0,0,0.70); transition: all 0.2s; letter-spacing: -0.01em; }
    .btn-outline:hover { border-color: #b5b5b5; }
    .btn-primary { padding: 8px 20px; background: #00754A; color: white; border: 1px solid #00754A; border-radius: 50px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em; }
    .btn-primary:hover { background: #006241; border-color: #006241; }
    .btn-primary:active { transform: scale(0.95); }
    .btn-primary:disabled { opacity: 0.50; cursor: not-allowed; }
    .btn-danger { padding: 8px 20px; background: #c82014; color: white; border: 1px solid #c82014; border-radius: 50px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em; }
    .btn-danger:active { transform: scale(0.95); }
    .btn-danger:disabled { opacity: 0.50; cursor: not-allowed; }
    .error-msg { color: #c82014; font-size: 13px; margin-bottom: 8px; }
    @media (max-width: 640px) { .lesson-grid { grid-template-columns: 1fr; } .page-wrapper { padding: 24px 16px 40px; } }
  `]
})
export class LessonsComponent implements OnInit {
  lessons: Lesson[] = [];
  allLessons: Lesson[] = [];
  allMolecules: Molecule[] = [];
  loading = false;
  saving = false;
  showModal = false;
  editingId: number | null = null;
  deletingLesson: Lesson | null = null;
  errorMsg = '';
  deleteError = '';
  selectedDiff = '';
  searchTitle = '';
  form: any = { title: '', topic: '', difficulty: 'EASY', content: '', moleculeId: null };

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get isStudent(): boolean {
    return this.currentUser?.role === 'STUDENT';
  }

  get isAdminOrTeacher(): boolean {
    const role = this.authService.getCurrentUser()?.role;
    return role === 'ADMIN' || role === 'TEACHER';
  }

  constructor(
    private lessonService: LessonService,
    private moleculeService: MoleculeService,
    private authService: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.load();
    if (this.isAdminOrTeacher) {
      this.moleculeService.getAll().subscribe(m => this.allMolecules = m);
    }
  }

  load(): void {
    this.loading = true;
    this.lessonService.getAll(this.searchTitle || undefined).subscribe({
      next: data => {
        this.allLessons = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    if (this.selectedDiff) {
      this.lessons = this.allLessons.filter(l => l.difficulty === this.selectedDiff);
    } else {
      this.lessons = this.allLessons;
    }
  }

  onSearch(): void {
    this.load();
  }

  filterByDiff(diff: string): void {
    this.selectedDiff = diff;
    this.applyFilters();
  }

  openCreate(): void {
    this.editingId = null;
    this.form = { title: '', topic: '', difficulty: 'EASY', content: '', moleculeId: null };
    this.errorMsg = '';
    this.showModal = true;
  }

  openEdit(l: Lesson): void {
    this.editingId = l.id;
    this.form = { title: l.title, topic: l.topic, difficulty: l.difficulty, content: l.content || '', moleculeId: l.molecule?.id || null };
    this.errorMsg = '';
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  save(): void {
    if (!this.form.title || !this.form.topic || !this.form.difficulty) { this.errorMsg = this.translate.instant('LESSONS.ERR_REQUIRED'); return; }
    this.saving = true;
    this.errorMsg = '';
    const req: CreateLessonRequest = { title: this.form.title, topic: this.form.topic, difficulty: this.form.difficulty, content: this.form.content, moleculeId: this.form.moleculeId || undefined };
    const obs = this.editingId ? this.lessonService.update(this.editingId, req) : this.lessonService.create(req);
    obs.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.load(); },
      error: (e) => { this.saving = false; this.errorMsg = e?.error?.message || 'Failed to save'; }
    });
  }

  confirmDelete(l: Lesson): void { this.deletingLesson = l; this.deleteError = ''; }

  doDelete(): void {
    if (!this.deletingLesson) return;
    this.saving = true;
    this.deleteError = '';
    this.lessonService.delete(this.deletingLesson.id).subscribe({
      next: () => { this.saving = false; this.deletingLesson = null; this.load(); },
      // Giu lai hop thoai va hien loi, truoc day loi bi nuot nen nguoi dung
      // thay nhu khong co gi xay ra khi bam xoa.
      error: (e) => {
        this.saving = false;
        this.deleteError = e?.error?.error || e?.error?.message || 'Khong xoa duoc bai hoc.';
      }
    });
  }
}
