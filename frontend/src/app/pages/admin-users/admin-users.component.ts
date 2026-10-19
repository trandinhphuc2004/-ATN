import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserManagementService } from '../../services/user-management.service';
import { ClassRoomService } from '../../services/class-room.service';
import { User, CreateUserRequest, UpdateUserRequest, ClassRoom } from '../../models/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, TranslateModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-icon"><mat-icon>manage_accounts</mat-icon></div>
        <div>
          <h1>{{ 'ADMIN_USERS.TITLE' | translate }}</h1>
          <p>{{ 'ADMIN_USERS.SUBTITLE' | translate }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <input class="search-input" [placeholder]="'ADMIN_USERS.FILTER_NAME' | translate" [(ngModel)]="filterName" (input)="applyFilter()" />
        <input class="search-input" [placeholder]="'ADMIN_USERS.FILTER_EMAIL' | translate" [(ngModel)]="filterEmail" (input)="applyFilter()" />
        <select class="role-select" [(ngModel)]="filterRole" (change)="applyFilter()">
          <option value="">{{ 'ADMIN_USERS.ALL_ROLES' | translate }}</option>
          <option value="STUDENT">{{ 'COMMON.STUDENT' | translate }}</option>
          <option value="TEACHER">{{ 'COMMON.TEACHER' | translate }}</option>
          <option value="ADMIN">{{ 'COMMON.ADMIN' | translate }}</option>
        </select>
        <select class="role-select" [(ngModel)]="filterClassId" (change)="applyFilter()">
          <option [ngValue]="null">{{ 'ADMIN_USERS.ALL_CLASSES' | translate }}</option>
          @for (c of classes; track c.id) {
            <option [ngValue]="c.id">{{ c.name }}</option>
          }
        </select>
        <button class="btn-export" (click)="exportCsv()" [disabled]="exporting">
          <mat-icon>download</mat-icon>
          {{ (exporting ? 'ADMIN_USERS.EXPORTING' : 'ADMIN_USERS.EXPORT_CSV') | translate }}
        </button>
        <button class="btn-primary" (click)="openCreateModal()">
          <mat-icon>person_add</mat-icon> {{ 'ADMIN_USERS.CREATE_USER' | translate }}
        </button>
      </div>

      @if (exportError) {
        <div class="export-error">
          <mat-icon>error_outline</mat-icon> {{ exportError }}
        </div>
      }

      @if (loading) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      }

      @if (!loading) {
        <div class="table-wrap">
          <table class="users-table">
            <thead>
              <tr>
                <th>{{ 'ADMIN_USERS.TH_ID' | translate }}</th><th>{{ 'ADMIN_USERS.TH_NAME' | translate }}</th><th>{{ 'ADMIN_USERS.TH_EMAIL' | translate }}</th><th>{{ 'ADMIN_USERS.TH_ROLE' | translate }}</th><th>{{ 'ADMIN_USERS.TH_CLASS' | translate }}</th><th>{{ 'ADMIN_USERS.TH_XP' | translate }}</th><th>{{ 'ADMIN_USERS.TH_LEVEL' | translate }}</th><th>{{ 'ADMIN_USERS.TH_CREATED' | translate }}</th><th>{{ 'ADMIN_USERS.TH_ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users; track user.id) {
                <tr>
                  <td>{{ user.id }}</td>
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td><span class="role-badge" [class]="'role-' + user.role.toLowerCase()">{{ user.role }}</span></td>
                  <td>
                    @if (user.role === 'STUDENT') {
                      @if (user.className) { <span class="class-badge">{{ user.className }}</span> }
                      @else { <span class="no-class">{{ 'ADMIN_USERS.NO_CLASS' | translate }}</span> }
                    } @else { <span class="no-class">—</span> }
                  </td>
                  <td>{{ user.xp }}</td>
                  <td>{{ user.level }}</td>
                  <td>{{ user.createdAt | date:'yyyy-MM-dd' }}</td>
                  <td class="actions">
                    <button class="btn-icon edit" (click)="openEditModal(user)" [title]="'COMMON.EDIT' | translate">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button class="btn-icon del" (click)="confirmDelete(user)" [title]="'COMMON.DELETE' | translate">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          @if (users.length === 0) {
            <div class="empty-state">{{ 'ADMIN_USERS.EMPTY' | translate }}</div>
          }
        </div>
      }

      <!-- Create / Edit Modal -->
      @if (showModal) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <h2>{{ (editingUser ? 'ADMIN_USERS.EDIT_USER' : 'ADMIN_USERS.CREATE_USER') | translate }}</h2>
            <div class="form-group">
              <label>{{ 'ADMIN_USERS.LABEL_NAME' | translate }}</label>
              <input [(ngModel)]="form.name" [placeholder]="'ADMIN_USERS.PH_NAME' | translate" />
            </div>
            <div class="form-group">
              <label>{{ 'ADMIN_USERS.LABEL_EMAIL' | translate }}</label>
              <input [(ngModel)]="form.email" type="email" [placeholder]="'ADMIN_USERS.PH_EMAIL' | translate" [disabled]="!!editingUser" />
            </div>
            <div class="form-group">
              <label>{{ (editingUser ? 'ADMIN_USERS.LABEL_NEW_PASSWORD' : 'ADMIN_USERS.LABEL_PASSWORD') | translate }}</label>
              <input [(ngModel)]="form.password" type="password" [placeholder]="'ADMIN_USERS.PH_PASSWORD' | translate" />
            </div>
            <div class="form-group">
              <label>{{ 'ADMIN_USERS.LABEL_ROLE' | translate }}</label>
              <select [(ngModel)]="form.role">
                <option value="STUDENT">{{ 'COMMON.STUDENT' | translate }}</option>
                <option value="TEACHER">{{ 'COMMON.TEACHER' | translate }}</option>
                <option value="ADMIN">{{ 'COMMON.ADMIN' | translate }}</option>
              </select>
            </div>
            @if (form.role === 'STUDENT') {
              <div class="form-group">
                <label>{{ 'ADMIN_USERS.LABEL_CLASS' | translate }}</label>
                <select [(ngModel)]="form.classId">
                  <option [ngValue]="null">{{ 'ADMIN_USERS.NO_CLASS' | translate }}</option>
                  @for (c of classes; track c.id) {
                    <option [ngValue]="c.id">{{ c.name }}</option>
                  }
                </select>
              </div>
            } @else if (form.role === 'TEACHER') {
              <p class="form-hint">{{ 'ADMIN_USERS.TEACHER_CLASS_HINT' | translate }}</p>
            }
            @if (errorMsg) {
              <div class="error-msg">{{ errorMsg }}</div>
            }
            <div class="modal-actions">
              <button class="btn-outline" (click)="closeModal()">{{ 'COMMON.CANCEL' | translate }}</button>
              <button class="btn-primary" (click)="saveUser()" [disabled]="saving">
                {{ (saving ? 'COMMON.SAVING' : (editingUser ? 'COMMON.UPDATE' : 'COMMON.CREATE')) | translate }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirm Modal -->
      @if (deletingUser) {
        <div class="modal-overlay" (click)="deletingUser = null">
          <div class="modal modal-sm" (click)="$event.stopPropagation()">
            <h2>{{ 'ADMIN_USERS.DELETE_USER' | translate }}</h2>
            <p>{{ 'ADMIN_USERS.DELETE_CONFIRM_1' | translate }} <strong>{{ deletingUser.name }}</strong>{{ 'ADMIN_USERS.DELETE_CONFIRM_2' | translate }}</p>
            <div class="modal-actions">
              <button class="btn-outline" (click)="deletingUser = null">{{ 'COMMON.CANCEL' | translate }}</button>
              <button class="btn-danger" (click)="doDelete()" [disabled]="saving">
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
    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
    .search-input { padding: 9px 13px; border: 1px solid #d6dbde; border-radius: 50px; font-size: 14px; font-family: inherit; outline: none; background: white; min-width: 180px; transition: border-color 0.2s; }
    .search-input:focus { border-color: #00754A; box-shadow: 0 0 0 3px rgba(0,117,74,0.10); }
    .role-select { padding: 9px 13px; border: 1px solid #d6dbde; border-radius: 50px; font-size: 14px; font-family: inherit; background: white; outline: none; cursor: pointer; }
    .btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: #00754A; color: white; border: 1px solid #00754A; border-radius: 50px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em; }
    .btn-primary:hover:not(:disabled) { background: #006241; border-color: #006241; }
    .btn-primary:active:not(:disabled) { transform: scale(0.95); }
    .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
    .btn-export { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: #1E3932; color: white; border: 1px solid #1E3932; border-radius: 50px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; margin-left: auto; transition: all 0.2s; letter-spacing: -0.01em; }
    .btn-export:hover { background: #2b5148; border-color: #2b5148; }
    .loading { display: flex; justify-content: center; padding: 60px 0; }
    .table-wrap { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .users-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .users-table th { background: #f9f9f9; padding: 12px 16px; text-align: left; font-weight: 600; color: rgba(0,0,0,0.58); border-bottom: 1px solid #edebe9; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
    .users-table td { padding: 12px 16px; border-bottom: 1px solid #f2f0eb; color: rgba(0,0,0,0.87); }
    .users-table tr:last-child td { border-bottom: none; }
    .users-table tr:hover td { background: #fafafa; }
    .role-badge { padding: 3px 10px; border-radius: 50px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; }
    .role-student { background: #d4e9e2; color: #006241; }
    .role-teacher { background: #d4e9e2; color: #006241; }
    .role-admin { background: #faf6ee; color: #a07c3e; }
    .class-badge { padding: 3px 10px; border-radius: 50px; font-size: 12px; font-weight: 700; background: #f2f0eb; color: #1E3932; }
    .no-class { font-size: 12px; color: rgba(0,0,0,0.40); }
    .form-hint { font-size: 12px; color: rgba(0,0,0,0.58); margin: -6px 0 12px; }
    .actions { display: flex; gap: 8px; }
    .btn-icon { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; border-radius: 50%; cursor: pointer; transition: all 0.2s; }
    .btn-icon.edit { background: #d4e9e2; color: #006241; }
    .btn-icon.edit:hover { background: #00754A; color: white; }
    .btn-icon.del { background: rgba(200,32,20,0.08); color: #c82014; }
    .btn-icon.del:hover { background: rgba(200,32,20,0.16); }
    .btn-icon mat-icon { font-size: 17px; width: 17px; height: 17px; }
    .empty-state { text-align: center; padding: 40px; color: rgba(0,0,0,0.40); font-size: 15px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; padding: 32px; width: 420px; max-width: 95vw; box-shadow: 0 8px 40px rgba(0,0,0,0.18); }
    .modal-sm { width: 360px; }
    .modal h2 { font-size: 1.2rem; font-weight: 700; color: #006241; margin: 0 0 20px; letter-spacing: -0.01em; }
    .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; }
    .form-group label { font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.70); letter-spacing: -0.01em; }
    .form-group input, .form-group select { padding: 9px 13px; border: 1px solid #d6dbde; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; background: #f9f9f9; transition: border-color 0.2s; }
    .form-group input:focus, .form-group select:focus { border-color: #00754A; box-shadow: 0 0 0 3px rgba(0,117,74,0.10); background: white; }
    .form-group input:disabled { background: #f2f0eb; color: rgba(0,0,0,0.40); }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .btn-outline { padding: 9px 18px; background: white; border: 1px solid #d6dbde; border-radius: 50px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; color: rgba(0,0,0,0.87); transition: all 0.2s; letter-spacing: -0.01em; }
    .btn-outline:hover { background: #f2f0eb; }
    .btn-danger { padding: 9px 18px; background: #c82014; color: white; border: 1px solid #c82014; border-radius: 50px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em; }
    .btn-danger:hover:not(:disabled) { background: #a5180e; border-color: #a5180e; }
    .btn-danger:active:not(:disabled) { transform: scale(0.95); }
    .btn-danger:disabled { opacity: 0.55; cursor: not-allowed; }
    .error-msg { color: #c82014; font-size: 13px; margin-bottom: 8px; }
    .export-error { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 12px 16px; border-radius: 9px; background: rgba(200,32,20,0.06); color: #c82014; font-size: 14px; }
    .export-error mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .btn-export:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  saving = false;
  showModal = false;
  editingUser: User | null = null;
  deletingUser: User | null = null;
  errorMsg = '';
  exportError = '';
  exporting = false;
  filterName = '';
  filterEmail = '';
  filterRole = '';
  filterClassId: number | null = null;
  classes: ClassRoom[] = [];
  form: any = { name: '', email: '', password: '', role: 'STUDENT', classId: null };

  constructor(private userMgmt: UserManagementService,
              private classService: ClassRoomService,
              private translate: TranslateService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.classService.getAll().subscribe(list => this.classes = list);
  }

  private get filters() {
    return { name: this.filterName, email: this.filterEmail, role: this.filterRole, classId: this.filterClassId };
  }

  loadUsers(): void {
    this.loading = true;
    this.userMgmt.getUsers(this.filters).subscribe({
      next: users => { this.users = users; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(): void { this.loadUsers(); }

  exportCsv(): void {
    if (this.exporting) return;
    this.exporting = true;
    this.exportError = '';
    this.userMgmt.exportCsv(this.filters).subscribe({
      next: blob => {
        const stamp = new Date().toISOString().slice(0, 10);
        this.userMgmt.saveBlobAsFile(blob, `users-${stamp}.csv`);
        this.exporting = false;
      },
      error: () => {
        this.exportError = this.translate.instant('ADMIN_USERS.ERR_EXPORT');
        this.exporting = false;
      }
    });
  }

  openCreateModal(): void {
    this.editingUser = null;
    this.form = { name: '', email: '', password: '', role: 'STUDENT', classId: null };
    this.errorMsg = '';
    this.showModal = true;
  }

  openEditModal(user: User): void {
    this.editingUser = user;
    this.form = { name: user.name, email: user.email, password: '', role: user.role, classId: user.classId ?? null };
    this.errorMsg = '';
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.editingUser = null; }

  saveUser(): void {
    this.errorMsg = '';
    this.saving = true;
    if (this.editingUser) {
      // Luon gui classId: null nghia la hoc sinh chua xep lop (backend bo qua voi vai tro khac)
      const req: UpdateUserRequest = { name: this.form.name, role: this.form.role, classId: this.form.classId };
      if (this.form.password) req.password = this.form.password;
      this.userMgmt.updateUser(this.editingUser.id, req).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadUsers(); },
        error: (e) => { this.saving = false; this.errorMsg = e?.error?.error || e?.error?.message || this.translate.instant('ADMIN_USERS.ERR_UPDATE'); }
      });
    } else {
      const req: CreateUserRequest = { name: this.form.name, email: this.form.email, password: this.form.password, role: this.form.role, classId: this.form.classId };
      this.userMgmt.createUser(req).subscribe({
        next: () => { this.saving = false; this.closeModal(); this.loadUsers(); },
        error: (e) => { this.saving = false; this.errorMsg = e?.error?.error || e?.error?.message || this.translate.instant('ADMIN_USERS.ERR_CREATE'); }
      });
    }
  }

  confirmDelete(user: User): void { this.deletingUser = user; }

  doDelete(): void {
    if (!this.deletingUser) return;
    this.saving = true;
    this.userMgmt.deleteUser(this.deletingUser.id).subscribe({
      next: () => { this.saving = false; this.deletingUser = null; this.loadUsers(); },
      error: () => { this.saving = false; this.deletingUser = null; }
    });
  }
}
