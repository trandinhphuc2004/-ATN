import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AiMoleculeService } from '../../services/ai-molecule.service';
import { Molecule, MoleculeData, Atom, Bond } from '../../models/models';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const ELEMENT_COLORS: Record<string, number> = {
  'H': 0xFFFFFF, 'C': 0x333333, 'N': 0x3050F8, 'O': 0xFF0D0D,
  'S': 0xFFFF30, 'P': 0xFF8000, 'Cl': 0x1FF01F, 'F': 0x90E050, 'Br': 0xA62929
};

const ELEMENT_RADII: Record<string, number> = {
  'H': 0.25, 'C': 0.4, 'N': 0.38, 'O': 0.35,
  'S': 0.45, 'P': 0.42, 'Cl': 0.43, 'F': 0.3, 'Br': 0.46
};

@Component({
  selector: 'app-ai-molecule-viewer',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule, 
    MatCardModule, MatButtonModule, MatIconModule, 
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule,
    TranslateModule
  ],
  template: `
    <div class="page-wrapper">
      <div class="header-section">
        <a routerLink="/molecules" class="back-link">
          <mat-icon>arrow_back</mat-icon> {{ 'MOLECULES.BACK' | translate }}
        </a>
        <div class="header-content">
          <div class="title-with-badge">
            <h1>{{ 'AI_MOLECULE.TITLE' | translate }}</h1>
            <span class="ai-badge">{{ 'AI_MOLECULE.AI_POWERED' | translate }}</span>
          </div>
          <p>{{ 'AI_MOLECULE.SUBTITLE' | translate }}</p>
        </div>
      </div>

      <div class="search-container">
        <div class="search-box">
          <mat-icon class="search-icon">science</mat-icon>
          <input type="text" [(ngModel)]="query" 
                 [placeholder]="'AI_MOLECULE.PLACEHOLDER' | translate" 
                 (keyup.enter)="generateMolecule()"
                 [disabled]="loading">
          <button class="generate-btn" (click)="generateMolecule()" [disabled]="!query.trim() || loading">
            @if (loading) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              <mat-icon>auto_awesome</mat-icon>
              <span>{{ 'AI_MOLECULE.GENERATE' | translate }}</span>
            }
          </button>
        </div>
      </div>

      <div class="viewer-layout" [class.active]="molecule">
        <div class="main-viewer">
          <div class="viewer-wrapper">
            <div #viewerContainer class="viewer-container">
              @if (!molecule && !loading) {
                <div class="empty-state">
                  <mat-icon>model_training</mat-icon>
                  <p>{{ 'AI_MOLECULE.EMPTY_STATE' | translate }}</p>
                </div>
              }
            </div>
            @if (molecule) {
              <div class="controls-hint">
                <mat-icon>mouse</mat-icon>
                {{ 'MOLECULES.CONTROLS' | translate }}
              </div>
            }
          </div>
        </div>

        @if (molecule) {
          <div class="side-info animate-in">
            <mat-card class="info-card">
              <div class="card-header">
                <h2>{{ molecule.name }}</h2>
                <span class="formula-badge">{{ molecule.formula }}</span>
              </div>
              <p class="desc">{{ molecule.description }}</p>
              
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">{{ 'MOLECULES.ATOMS' | translate }}</span>
                  <span class="stat-value">{{ moleculeData?.atoms?.length }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">{{ 'MOLECULES.BONDS' | translate }}</span>
                  <span class="stat-value">{{ moleculeData?.bonds?.length }}</span>
                </div>
              </div>

              <div class="elements-section">
                <span class="stat-label">{{ 'MOLECULES.ELEMENTS' | translate }}</span>
                <div class="element-chips">
                  @for (elem of uniqueElements; track elem) {
                    <span class="elem-chip" [style.background-color]="getElementColorHex(elem)">
                      {{ elem }}
                    </span>
                  }
                </div>
              </div>
            </mat-card>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper { width: 100%;
      max-width: var(--page-max-mid);
      margin: 0 auto;
      padding: 32px var(--page-gutter) 60px;
    }

    .header-section {
      margin-bottom: 32px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      margin-bottom: 20px;
      transition: color 0.2s;
    }

    .back-link:hover { color: #00754A; }

    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .ai-badge {
      padding: 4px 10px;
      background: #1E3932;
      color: white;
      font-size: 11px;
      font-weight: 700;
      border-radius: 50px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    h1 { font-size: 2rem; font-weight: 800; color: rgba(0,0,0,0.87); margin: 0; letter-spacing: -0.01em; }
    .header-content p { color: rgba(0,0,0,0.58); margin: 0; font-size: 1.1rem; }

    .search-container {
      margin-bottom: 40px;
      display: flex;
      justify-content: center;
    }

    .search-box {
      width: 100%;
      max-width: 700px;
      height: 64px;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 18px;
      padding: 0 8px 0 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .search-box:focus-within {
      border-color: #00754A;
      box-shadow: 0 10px 25px -5px rgba(0, 117, 74, 0.1);
      transform: translateY(-2px);
    }

    .search-icon { color: #94a3b8; font-size: 24px; width: 24px; height: 24px; }

    input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 1.1rem;
      font-weight: 500;
      color: #1e293b;
    }

    input::placeholder { color: #94a3b8; }

    .generate-btn {
      height: 48px;
      padding: 0 24px;
      background: #00754A;
      color: white;
      border: none;
      border-radius: 50px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .generate-btn:hover:not(:disabled) {
      background: #006241;
    }

    .generate-btn:active:not(:disabled) { transform: scale(0.95); }

    .generate-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .viewer-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      transition: all 0.4s ease;
    }

    .viewer-layout.active {
      grid-template-columns: 1fr 380px;
    }

    .viewer-wrapper {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      background: #0f172a;
      box-shadow: 0 8px 28px rgba(0,0,0,0.12);
    }

    .viewer-container {
      width: 100%;
      height: 600px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .empty-state {
      text-align: center;
      color: #475569;
    }

    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; opacity: 0.3; }
    .empty-state p { font-size: 1.1rem; font-weight: 500; }

    .controls-hint {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(8px);
      padding: 8px 16px;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.1);
      color: #94a3b8;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      pointer-events: none;
    }

    .side-info.animate-in {
      animation: slideIn 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .info-card {
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24);
      background: white;
      height: 100%;
    }

    .card-header {
      margin-bottom: 20px;
    }

    h2 { font-size: 1.5rem; font-weight: 700; color: #006241; margin: 0 0 8px; letter-spacing: -0.01em; }
    .formula-badge {
      display: inline-block;
      padding: 4px 12px;
      background: #d4e9e2;
      color: #006241;
      font-weight: 700;
      font-size: 13px;
      border-radius: 50px;
    }

    .desc { color: rgba(0,0,0,0.58); line-height: 1.6; font-size: 0.95rem; margin-bottom: 24px; }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-item {
      padding: 16px;
      background: #f9f9f9;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-label { font-size: 12px; color: rgba(0,0,0,0.58); font-weight: 600; text-transform: uppercase; }
    .stat-value { font-size: 1.5rem; font-weight: 800; color: rgba(0,0,0,0.87); letter-spacing: -0.01em; }

    .element-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    .elem-chip {
      padding: 4px 12px;
      border-radius: 20px;
      color: white;
      font-weight: 700;
      font-size: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    @media (max-width: 1024px) {
      .viewer-layout.active { grid-template-columns: 1fr; }
      .side-info { order: 2; }
    }
  `]
})
export class AiMoleculeViewerComponent implements OnInit, OnDestroy {
  @ViewChild('viewerContainer', { static: false }) viewerContainer!: ElementRef;

  query = '';
  loading = false;
  molecule: Molecule | null = null;
  moleculeData: MoleculeData | null = null;
  uniqueElements: string[] = [];

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationId = 0;
  private atomMeshes: THREE.Mesh[] = [];

  constructor(
    private aiMoleculeService: AiMoleculeService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.cleanupViewer();
  }

  generateMolecule() {
    if (!this.query.trim() || this.loading) return;

    this.loading = true;
    this.cleanupViewer();
    this.molecule = null;
    this.moleculeData = null;

    this.aiMoleculeService.generateMolecule(this.query).subscribe({
      next: (mol) => {
        this.molecule = mol;
        // The AI backend returns atomsData and bondsData separately as strings or objects
        // In our Molecule entity we have them as separate fields now
        const atoms: Atom[] = typeof mol.atomsData === 'string' ? JSON.parse(mol.atomsData) : mol.atomsData;
        const bonds: Bond[] = typeof mol.bondsData === 'string' ? JSON.parse(mol.bondsData) : mol.bondsData;
        
        this.moleculeData = { atoms, bonds };
        this.uniqueElements = [...new Set(atoms.map(a => a.element))];
        this.loading = false;
        
        setTimeout(() => this.initViewer(), 0);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(this.translate.instant('AI_MOLECULE.ERROR_GENERATE'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      }
    });
  }

  private initViewer(): void {
    if (!this.viewerContainer) return;

    const container = this.viewerContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    this.camera.position.set(3, 3, 5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    this.scene.add(light);

    if (this.moleculeData) {
      this.buildMolecule(this.moleculeData);
    }

    const observer = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
    observer.observe(container);

    this.animate();
  }

  private buildMolecule(data: MoleculeData): void {
    const atomPositions: THREE.Vector3[] = [];

    data.atoms.forEach((atom, idx) => {
      const radius = ELEMENT_RADII[atom.element] || 0.35;
      const color = ELEMENT_COLORS[atom.element] || 0xcccccc;

      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshPhongMaterial({ color, shininess: 100 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(atom.x, atom.y, atom.z);
      
      this.scene.add(mesh);
      this.atomMeshes.push(mesh);
      atomPositions.push(new THREE.Vector3(atom.x, atom.y, atom.z));
    });

    data.bonds.forEach(bond => {
      const start = atomPositions[bond.from];
      const end = atomPositions[bond.to];
      if (!start || !end) return;

      const direction = new THREE.Vector3().subVectors(end, start);
      const len = direction.length();
      const geom = new THREE.CylinderGeometry(0.08, 0.08, len, 12);
      const mat = new THREE.MeshPhongMaterial({ color: 0x64748b });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(start).add(direction.clone().multiplyScalar(0.5));
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
      
      this.scene.add(mesh);
    });
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls?.update();
    this.renderer?.render(this.scene, this.camera);
  };

  private cleanupViewer(): void {
    cancelAnimationFrame(this.animationId);
    if (this.renderer) {
      this.renderer.dispose();
      this.viewerContainer?.nativeElement?.removeChild(this.renderer.domElement);
    }
    this.atomMeshes = [];
  }

  getElementColorHex(element: string): string {
    const color = ELEMENT_COLORS[element] || 0xcccccc;
    return '#' + color.toString(16).padStart(6, '0');
  }
}
