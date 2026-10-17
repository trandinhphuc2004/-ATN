import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MoleculeService } from '../../services/molecule.service';
import { AuthService } from '../../services/auth.service';
import { Molecule, CreateMoleculeRequest } from '../../models/models';

@Component({
  selector: 'app-molecules',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, TranslateModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-icon"><mat-icon>view_in_ar</mat-icon></div>
        <div>
          <h1>{{ 'MOLECULES.TITLE' | translate }}</h1>
          <p>{{ 'MOLECULES.SUBTITLE' | translate }}</p>
        </div>
        @if (isAdminOrTeacher) {
          <button class="btn-add" (click)="openCreate()">
            <mat-icon>add</mat-icon> {{ 'MOLECULES.ADD_MOLECULE' | translate }}
          </button>
        }
      </div>

      <div class="search-bar">
        <mat-icon class="search-icon">search</mat-icon>
        <input class="search-input" [placeholder]="'MOLECULES.SEARCH_PLACEHOLDER' | translate" [(ngModel)]="searchName" (input)="onSearch()" />
      </div>

      <div class="ai-discovery-cta" routerLink="/ai-molecule-viewer">
        <div class="cta-content">
          <div class="cta-badge"><mat-icon>auto_awesome</mat-icon><span>{{ 'MOLECULES.NEW_BADGE' | translate }}</span></div>
          <h2>{{ 'AI_MOLECULE.TITLE' | translate }}</h2>
          <p>{{ 'AI_MOLECULE.SUBTITLE' | translate }}</p>
          <button class="cta-btn">{{ 'AI_MOLECULE.GENERATE' | translate }} <mat-icon>arrow_forward</mat-icon></button>
        </div>
        <div class="cta-visual"><mat-icon class="molecule-icon">model_training</mat-icon></div>
      </div>

      <div class="molecule-grid">
        @for (molecule of molecules; track molecule.id) {
          <div class="molecule-card">
            <div class="card-body" [routerLink]="['/molecules', molecule.id]">
              <div class="card-icon-wrap"><mat-icon>hexagon</mat-icon></div>
              <h3>{{ molecule.name }}</h3>
              <span class="formula-badge">{{ molecule.formula }}</span>
              <p class="card-desc">{{ molecule.description }}</p>
              <div class="card-action"><span>{{ 'MOLECULES.VIEW_3D' | translate }}</span><mat-icon>arrow_forward</mat-icon></div>
            </div>
            @if (isAdminOrTeacher) {
              <div class="card-actions">
                <button class="btn-icon edit" (click)="openEdit(molecule)"><mat-icon>edit</mat-icon></button>
                <button class="btn-icon del" (click)="confirmDelete(molecule)"><mat-icon>delete</mat-icon></button>
              </div>
            }
          </div>
        }
      </div>
      @if (molecules.length === 0 && !loading) {
        <div class="empty-state">{{ 'MOLECULES.EMPTY' | translate }}</div>
      }

      <!-- Create / Edit Modal -->
      @if (showModal) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <h2>{{ (editingId ? 'MOLECULES.EDIT_MOLECULE' : 'MOLECULES.ADD_MOLECULE') | translate }}</h2>
            <div class="form-group"><label>{{ 'MOLECULES.LABEL_NAME' | translate }}</label><input [(ngModel)]="form.name" [placeholder]="'MOLECULES.PH_NAME' | translate" /></div>
            <div class="form-group"><label>{{ 'MOLECULES.LABEL_FORMULA' | translate }}</label><input [(ngModel)]="form.formula" [placeholder]="'MOLECULES.PH_FORMULA' | translate" /></div>
            <div class="form-group"><label>{{ 'MOLECULES.LABEL_DESCRIPTION' | translate }}</label><textarea [(ngModel)]="form.description" rows="3" [placeholder]="'MOLECULES.PH_DESCRIPTION' | translate"></textarea></div>
            <div class="form-group"><label>{{ 'MOLECULES.LABEL_ATOMS_DATA' | translate }}</label><textarea [(ngModel)]="form.atomsData" rows="3" placeholder='[{"element":"O","x":0,"y":0,"z":0}]'></textarea></div>
            <div class="form-group"><label>{{ 'MOLECULES.LABEL_BONDS_DATA' | translate }}</label><textarea [(ngModel)]="form.bondsData" rows="2" placeholder='[{"from":0,"to":1,"order":1}]'></textarea></div>
            @if (errorMsg) { <div class="error-msg">{{ errorMsg }}</div> }
            <div class="modal-actions">
              <button class="btn-outline" (click)="closeModal()">{{ 'COMMON.CANCEL' | translate }}</button>
              <button class="btn-primary" (click)="save()" [disabled]="saving">{{ (saving ? 'COMMON.SAVING' : (editingId ? 'COMMON.UPDATE' : 'COMMON.CREATE')) | translate }}</button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirm -->
      @if (deletingMolecule) {
        <div class="modal-overlay" (click)="deletingMolecule = null">
          <div class="modal modal-sm" (click)="$event.stopPropagation()">
            <h2>{{ 'MOLECULES.DELETE_MOLECULE' | translate }}</h2>
            <p>{{ 'COMMON.DELETE' | translate }} <strong>{{ deletingMolecule.name }}</strong>?</p>
            <div class="modal-actions">
              <button class="btn-outline" (click)="deletingMolecule = null">{{ 'COMMON.CANCEL' | translate }}</button>
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
    .ai-discovery-cta { display: flex; align-items: center; justify-content: space-between; background: #1E3932; border-radius: 12px; padding: 32px 40px; margin-bottom: 40px; color: white; cursor: pointer; overflow: hidden; transition: all 0.2s; }
    .ai-discovery-cta:hover { box-shadow: 0 8px 24px rgba(30,57,50,0.30); transform: translateY(-2px); }
    .cta-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.12); padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.20); letter-spacing: 0.05em; }
    .cta-badge mat-icon { font-size: 14px; width: 14px; height: 14px; color: #d4e9e2; }
    .cta-content h2 { font-size: 1.65rem; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.02em; }
    .cta-content p { color: rgba(255,255,255,0.70); margin: 0 0 24px; max-width: 480px; line-height: 1.6; }
    .cta-btn { display: inline-flex; align-items: center; gap: 8px; background: white; color: #00754A; padding: 9px 22px; border-radius: 50px; font-weight: 700; border: 1px solid white; font-size: 14px; transition: all 0.2s; letter-spacing: -0.01em; }
    .cta-btn:active { transform: scale(0.95); }
    .ai-discovery-cta:hover .cta-btn { background: #f2f0eb; }
    .cta-visual { opacity: 0.12; transform: scale(3.5) rotate(-15deg); }
    .molecule-icon { font-size: 100px; width: 100px; height: 100px; }
    .molecule-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .molecule-card { background: white; border-radius: 12px; overflow: hidden; transition: all 0.2s; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .molecule-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06); }
    .card-body { padding: 24px 22px 20px; cursor: pointer; }
    .card-icon-wrap { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: #d4e9e2; color: #006241; margin-bottom: 14px; }
    .card-icon-wrap mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .molecule-card h3 { font-size: 1rem; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0 0 8px; letter-spacing: -0.01em; }
    .formula-badge { display: inline-block; padding: 3px 10px; font-size: 12px; font-weight: 600; color: #00754A; background: #d4e9e2; border-radius: 50px; margin-bottom: 12px; }
    .card-desc { font-size: 13px; color: rgba(0,0,0,0.58); line-height: 1.55; margin: 0 0 16px; }
    .card-action { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #00754A; letter-spacing: -0.01em; }
    .card-action mat-icon { font-size: 16px; width: 16px; height: 16px; transition: transform 0.2s; }
    .molecule-card:hover .card-action mat-icon { transform: translateX(3px); }
    .card-actions { display: flex; gap: 8px; padding: 8px 16px 12px; border-top: 1px solid #edebe9; }
    .btn-icon { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border: none; border-radius: 50%; cursor: pointer; transition: all 0.15s; }
    .btn-icon.edit { background: #d4e9e2; color: #006241; }
    .btn-icon.del { background: rgba(200,32,20,0.08); color: #c82014; }
    .btn-icon mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .empty-state { text-align: center; padding: 60px; color: rgba(0,0,0,0.45); font-size: 15px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.40); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 12px; padding: 32px; width: 480px; max-width: 95vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 8px 40px rgba(0,0,0,0.18); }
    .modal-sm { width: 360px; }
    .modal h2 { font-size: 1.15rem; font-weight: 700; color: #006241; margin: 0 0 20px; letter-spacing: -0.01em; }
    .modal p { color: rgba(0,0,0,0.70); margin: 0 0 4px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
    .form-group label { font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.70); letter-spacing: -0.01em; }
    .form-group input, .form-group textarea { padding: 9px 13px; border: 1px solid #d6dbde; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; resize: vertical; background: #f9f9f9; color: rgba(0,0,0,0.87); transition: border-color 0.2s; }
    .form-group input:focus, .form-group textarea:focus { border-color: #00754A; box-shadow: 0 0 0 3px rgba(0,117,74,0.10); background: white; }
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
    @media (max-width: 640px) { .molecule-grid { grid-template-columns: 1fr; } .page-wrapper { padding: 24px 16px 40px; } }
  `]
})
export class MoleculesComponent implements OnInit {
  molecules: Molecule[] = [];
  loading = false;
  saving = false;
  searchName = '';
  showModal = false;
  editingId: number | null = null;
  deletingMolecule: Molecule | null = null;
  errorMsg = '';
  form: any = { name: '', formula: '', description: '', atomsData: '', bondsData: '' };

  get isAdminOrTeacher(): boolean {
    const role = this.authService.getCurrentUser()?.role;
    return role === 'ADMIN' || role === 'TEACHER';
  }

  constructor(private moleculeService: MoleculeService, private authService: AuthService, private translate: TranslateService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.moleculeService.getAll(this.searchName || undefined).subscribe({
      next: data => { this.molecules = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onSearch(): void { this.load(); }

  openCreate(): void {
    this.editingId = null;
    this.form = { name: '', formula: '', description: '', atomsData: '', bondsData: '' };
    this.errorMsg = '';
    this.showModal = true;
  }

  openEdit(m: Molecule): void {
    this.editingId = m.id;
    this.form = { name: m.name, formula: m.formula, description: m.description || '', atomsData: m.atomsData || '', bondsData: m.bondsData || '' };
    this.errorMsg = '';
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  save(): void {
    if (!this.form.name || !this.form.formula) { this.errorMsg = this.translate.instant('MOLECULES.ERR_REQUIRED'); return; }
    this.saving = true;
    this.errorMsg = '';
    const req: CreateMoleculeRequest = { name: this.form.name, formula: this.form.formula, description: this.form.description, atomsData: this.form.atomsData, bondsData: this.form.bondsData };
    const obs = this.editingId ? this.moleculeService.update(this.editingId, req) : this.moleculeService.create(req);
    obs.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.load(); },
      error: (e) => { this.saving = false; this.errorMsg = e?.error?.message || 'Failed to save'; }
    });
  }

  confirmDelete(m: Molecule): void { this.deletingMolecule = m; }

  doDelete(): void {
    if (!this.deletingMolecule) return;
    this.saving = true;
    this.moleculeService.delete(this.deletingMolecule.id).subscribe({
      next: () => { this.saving = false; this.deletingMolecule = null; this.load(); },
      error: () => { this.saving = false; this.deletingMolecule = null; }
    });
  }
}
