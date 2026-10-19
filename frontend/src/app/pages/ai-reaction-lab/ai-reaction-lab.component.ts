import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AiReactionService } from '../../services/ai-reaction.service';
import { Reaction, ReactionMoleculeGroup, AnimationData, AnimationStep } from '../../models/models';
import { BeakerSimulationComponent } from '../../shared/beaker-simulation/beaker-simulation.component';
import { VideoSuggestionsComponent } from '../../shared/video-suggestions/video-suggestions.component';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const ELEMENT_COLORS: Record<string, number> = {
  'H': 0xFFFFFF, 'C': 0x333333, 'N': 0x3050F8, 'O': 0xFF0D0D,
  'S': 0xFFFF30, 'P': 0xFF8000, 'Cl': 0x1FF01F, 'F': 0x90E050,
  'Na': 0xAB5CF2, 'Ag': 0xC0C0C0, 'Fe': 0xE06633, 'Mg': 0x8AFF00
};
const ELEMENT_RADII: Record<string, number> = {
  'H': 0.25, 'C': 0.4, 'N': 0.38, 'O': 0.35,
  'S': 0.45, 'P': 0.42, 'Cl': 0.43, 'F': 0.3,
  'Na': 0.48, 'Ag': 0.46, 'Fe': 0.44, 'Mg': 0.42
};

@Component({
  selector: 'app-ai-reaction-lab',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatIconModule,
    MatProgressSpinnerModule, TranslateModule,
    BeakerSimulationComponent,
    VideoSuggestionsComponent
  ],
  template: `
    <div class="lab-container">

      <!-- ── SIDEBAR ── -->
      <div class="lab-sidebar">
        <div class="sidebar-header">
          <div class="icon-pulse"><mat-icon>auto_awesome</mat-icon></div>
          <div>
            <h2>{{ 'AI_REACTION_LAB.SIDEBAR_TITLE' | translate }}</h2>
            <p>{{ 'AI_REACTION_LAB.SIDEBAR_DESC' | translate }}</p>
          </div>
        </div>

        <!-- Input -->
        <div class="cloud-card" [class.loading]="loading">
          <div class="cloud-header">
            <mat-icon class="pulse-icon">auto_awesome</mat-icon>
            <span>{{ 'AI_REACTION_LAB.CLOUD_TITLE' | translate }}</span>
          </div>
          <div class="cloud-body">
            <textarea [(ngModel)]="query"
                      [placeholder]="'AI_REACTION_LAB.PLACEHOLDER' | translate"
                      (keyup.enter)="generate()"
                      [disabled]="loading"></textarea>
            <button class="synth-btn" (click)="generate()" [disabled]="loading || !query.trim()">
              @if (loading) { <mat-spinner diameter="22"></mat-spinner> }
              @else { <mat-icon>science</mat-icon><span>{{ 'AI_REACTION_LAB.GENERATE' | translate }}</span> }
            </button>
          </div>
        </div>

        <!-- Quick chips -->
        <div class="quick-chips">
          <span class="chip-label">{{ 'AI_REACTION_LAB.TRY_THESE' | translate }}</span>
          <span class="chip" (click)="query='AgNO3 + NaCl'; generate()">AgNO₃ + NaCl</span>
          <span class="chip" (click)="query='2H2 + O2 → 2H2O'; generate()">{{ 'AI_REACTION_LAB.CHIP_WATER' | translate }}</span>
          <span class="chip" (click)="query='Đốt cháy Magie'; generate()">{{ 'AI_REACTION_LAB.CHIP_MG' | translate }}</span>
          <span class="chip" (click)="query='Photosynthesis'; generate()">{{ 'AI_REACTION_LAB.CHIP_PHOTOSYNTHESIS' | translate }}</span>
        </div>

        <!-- Loading state -->
        @if (loading) {
          <div class="loading-state">
            <div class="atom-loader">
              <div class="nucleus"></div>
              <div class="electron e1"></div>
              <div class="electron e2"></div>
              <div class="electron e3"></div>
            </div>
            <p>{{ 'AI_REACTION_LAB.LOADING_TEXT' | translate }}</p>
            <span class="status-tip">{{ loadingStatus }}</span>
          </div>
        }

        <!-- Reaction info -->
        @if (reaction && !loading) {
          <div class="reaction-info-card animate-in">
            <div class="info-header">
              <span class="type-tag">{{ reaction.reactionType }}</span>
              <h3>{{ reaction.name }}</h3>
            </div>
            <div class="eq-badge">{{ reaction.equation }}</div>
            <p>{{ reaction.description }}</p>

            <!-- Step controls for MOLECULAR view -->
            @if (activeTab === 'molecular') {
              <div class="step-controls">
                @for (step of animationSteps; track step.label; let i = $index) {
                  <div class="step-item" [class.active]="currentStep === i" (click)="goToStep(i)">
                    <div class="step-idx">{{ i + 1 }}</div>
                    <div class="step-text">
                      <div class="step-label">{{ step.label }}</div>
                      <div class="step-desc">{{ step.description }}</div>
                    </div>
                  </div>
                }
              </div>
              <div class="playback-controls">
                <button class="play-btn" (click)="togglePlay()">
                  <mat-icon>{{ isPlaying ? 'pause' : 'play_arrow' }}</mat-icon>
                </button>
                <button class="reset-btn" (click)="resetAnimation()">
                  <mat-icon>replay</mat-icon>
                </button>
              </div>
            }
          </div>
        }
      </div>

      <!-- ── MAIN VIEWER ── -->
      <div class="viewer-area">

        <!-- Tab switcher -->
        @if (reaction && !loading) {
          <div class="tab-bar">
            <button class="tab-btn" [class.active]="activeTab==='molecular'" (click)="switchTab('molecular')">
              <mat-icon>bubble_chart</mat-icon> {{ 'AI_REACTION_LAB.TAB_MOLECULAR' | translate }}
            </button>
            <button class="tab-btn" [class.active]="activeTab==='beaker'" (click)="switchTab('beaker')">
              <mat-icon>science</mat-icon> {{ 'AI_REACTION_LAB.TAB_BEAKER' | translate }}
            </button>
            <button class="tab-btn" [class.active]="activeTab==='video'" (click)="switchTab('video')">
              <mat-icon>play_circle</mat-icon> {{ 'AI_REACTION_LAB.TAB_VIDEO' | translate }}
            </button>
          </div>
        }

        <!-- Molecular viewer -->
        <div class="viewer-panel" [class.visible]="activeTab==='molecular' || !reaction">
          <div #viewerContainer class="viewer-container"></div>
          @if (!reaction && !loading) {
            <div class="empty-viewer">
              <mat-icon>science</mat-icon>
              <p>{{ 'AI_REACTION_LAB.EMPTY_HINT' | translate }}</p>
            </div>
          }
        </div>

        <!-- Beaker simulation -->
        <div class="viewer-panel" [class.visible]="activeTab==='beaker' && !!reaction && !loading">
          @if (reaction && !loading) {
            <app-beaker-simulation [reaction]="reaction" style="display:block;width:100%;height:100%">
            </app-beaker-simulation>
          }
        </div>

        <!-- Video bai giang goi y. Phan ung do AI tao ra chua luu vao co so du lieu
             nen chua co id, phai tim video theo tu khoa la ten + phuong trinh phan ung. -->
        <div class="viewer-panel scrollable" [class.visible]="activeTab==='video' && !!reaction && !loading">
          @if (reaction && !loading) {
            <app-video-suggestions
              [keyword]="reaction.name + ' ' + reaction.equation">
            </app-video-suggestions>
          }
        </div>

      </div>
    </div>
  `,
  styles: [`
    .lab-container {
      display: flex;
      height: 100vh;
      background: #0f172a;
      overflow: hidden;
      color: white;
    }

    /* ── Sidebar ── */
    .lab-sidebar {
      width: 390px;
      padding: 28px;
      background: rgba(15,23,42,0.82);
      backdrop-filter: blur(20px);
      border-right: 1px solid rgba(255,255,255,0.07);
      display: flex;
      flex-direction: column;
      gap: 20px;
      z-index: 10;
      overflow-y: auto;
      scrollbar-width: none;
    }
    .lab-sidebar::-webkit-scrollbar { display: none; }

    .sidebar-header { display: flex; align-items: center; gap: 14px; }
    .icon-pulse {
      width: 42px; height: 42px; border-radius: 50%;
      background: #00754A;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 18px rgba(0,117,74,.4);
      animation: pulse 2s infinite;
      flex-shrink: 0;
    }
    @keyframes pulse {
      0%{ box-shadow: 0 0 0 0 rgba(0,117,74,.7); }
      70%{ box-shadow: 0 0 0 10px rgba(0,117,74,0); }
      100%{ box-shadow: 0 0 0 0 rgba(0,117,74,0); }
    }
    .sidebar-header h2 { font-size: 1.1rem; font-weight: 700; margin: 0; }
    .sidebar-header p { font-size: 12px; color: #94A3B8; margin: 0; }

    /* Cloud card */
    .cloud-card {
      background: rgba(30,41,59,.45);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px; padding: 18px;
      transition: border-color .3s, box-shadow .3s;
    }
    .cloud-card.loading { border-color: #00754A; box-shadow: 0 0 24px rgba(0,117,74,.18); }
    .cloud-header { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
    .cloud-header span { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #94A3B8; }
    .pulse-icon { font-size: 16px; width: 16px; height: 16px; color: #d4e9e2; animation: icon-float 3s ease-in-out infinite; }
    @keyframes icon-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }

    .cloud-body { display: flex; flex-direction: column; gap: 10px; }
    .cloud-body textarea {
      background: rgba(15,23,42,.55); border: 1px solid rgba(255,255,255,.06);
      border-radius: 10px; padding: 12px; color: white;
      font-family: inherit; font-size: 14px; resize: none; height: 88px; outline: none;
      transition: border-color .2s;
    }
    .cloud-body textarea:focus { border-color: rgba(212,233,226,.5); }

    .synth-btn {
      height: 46px;
      background: #00754A;
      color: white; border: 1px solid #00754A; border-radius: 50px;
      font-weight: 700; display: flex; align-items: center;
      justify-content: center; gap: 9px; cursor: pointer; transition: all .3s;
      font-family: inherit; letter-spacing: -0.01em;
    }
    .synth-btn:hover:not(:disabled) { background: #006241; border-color: #006241; }
    .synth-btn:active:not(:disabled) { transform: scale(0.95); }
    .synth-btn:disabled { opacity: .55; cursor: not-allowed; }

    /* Chips */
    .quick-chips { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; }
    .chip-label { font-size: 10px; font-weight: 600; color: #64748B; }
    .chip {
      font-size: 10px; background: rgba(255,255,255,.05); padding: 5px 11px;
      border-radius: 100px; cursor: pointer; color: #94A3B8; transition: all .2s;
    }
    .chip:hover { color: white; background: rgba(212,233,226,.15); }

    /* Panel video: khac hai panel 3D vi noi dung la van ban, can cuon duoc.
       Nen sang de chu doc ro, khac voi nen toi cua khung 3D. */
    .viewer-panel.scrollable { overflow-y: auto; background: #fff; padding: 24px 28px; }

    /* Loader */
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 24px 0; text-align: center; }
    .atom-loader { position: relative; width: 54px; height: 54px; margin-bottom: 20px; }
    .nucleus { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 11px; height: 11px; background: #d4e9e2; border-radius: 50%; box-shadow: 0 0 8px #d4e9e2; }
    .electron { position: absolute; border: 1px solid rgba(212,233,226,.2); width: 54px; height: 27px; border-radius: 50%; top: 14px; left: 0; }
    .e1 { animation: orb1 1.8s linear infinite; }
    .e2 { transform: rotate(120deg); animation: orb2 1.8s linear infinite; }
    .e3 { transform: rotate(240deg); animation: orb3 1.8s linear infinite; }
    @keyframes orb1{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    @keyframes orb2{from{transform:rotate(120deg)}to{transform:rotate(480deg)}}
    @keyframes orb3{from{transform:rotate(240deg)}to{transform:rotate(600deg)}}
    .loading-state p { font-size: 13px; color: #E2E8F0; margin: 0 0 4px; }
    .status-tip { font-size: 11px; color: #64748B; font-style: italic; }

    /* Reaction card */
    .reaction-info-card {
      background: rgba(30,41,59,.4); border: 1px solid rgba(255,255,255,.06);
      border-radius: 12px; padding: 20px;
    }
    .info-header { margin-bottom: 10px; }
    .type-tag { font-size: 10px; font-weight: 700; color: #d4e9e2; text-transform: uppercase; letter-spacing: .1em; background: rgba(212,233,226,.1); padding: 2px 8px; border-radius: 4px; }
    .info-header h3 { font-size: 1.1rem; font-weight: 700; margin: 6px 0 0; }
    .eq-badge { display: inline-block; padding: 4px 12px; background: rgba(212,233,226,.1); border-radius: 6px; font-family: monospace; color: #d4e9e2; font-weight: 600; margin-bottom: 12px; font-size: 12px; }
    .reaction-info-card p { font-size: 12px; color: #94A3B8; line-height: 1.6; margin: 0 0 16px; }

    .step-controls { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .step-item { display: flex; gap: 10px; padding: 10px; border-radius: 9px; background: rgba(255,255,255,.03); cursor: pointer; transition: all .2s; border: 1px solid transparent; }
    .step-item:hover { background: rgba(255,255,255,.05); }
    .step-item.active { background: rgba(212,233,226,.08); border-color: rgba(212,233,226,.2); }
    .step-idx { width: 22px; height: 22px; border-radius: 6px; background: rgba(255,255,255,.05); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; color: #94A3B8; }
    .step-item.active .step-idx { background: #00754A; color: white; }
    .step-label { font-size: 12px; font-weight: 600; color: #F1F5F9; }
    .step-desc { font-size: 10px; color: #64748B; }

    .playback-controls { display: flex; gap: 10px; }
    .play-btn { flex: 1; height: 40px; border-radius: 50px; background: #00754A; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .2s; }
    .play-btn:hover { background: #006241; }
    .reset-btn { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,.07); border: none; color: #94A3B8; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .reset-btn:hover { background: rgba(255,255,255,.12); color: white; }

    /* ── Viewer Area ── */
    .viewer-area { flex: 1; position: relative; display: flex; flex-direction: column; overflow: hidden; }

    /* Tab bar */
    .tab-bar {
      position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
      z-index: 20;
      display: flex; gap: 6px;
      background: rgba(10,12,22,.72); backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 50px; padding: 5px;
    }
    .tab-btn {
      display: flex; align-items: center; gap: 7px;
      padding: 8px 18px; border-radius: 50px;
      border: none; background: transparent;
      color: #64748B; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: all .25s;
    }
    .tab-btn mat-icon { font-size: 17px; width: 17px; height: 17px; }
    .tab-btn:hover { color: #e2e8f0; background: rgba(255,255,255,.06); }
    .tab-btn.active { background: #00754A; color: white; box-shadow: 0 4px 14px rgba(0,117,74,.35); }

    /* Viewer panels */
    .viewer-panel {
      position: absolute; inset: 0;
      display: none; background: #000;
    }
    .viewer-panel.visible { display: block; }

    .viewer-container { width: 100%; height: 100%; }

    .empty-viewer {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%,-50%);
      text-align: center; color: #334155;
    }
    .empty-viewer mat-icon { font-size: 70px; width: 70px; height: 70px; opacity: .18; margin-bottom: 14px; }
    .empty-viewer p { font-size: 13px; color: #475569; }

    .animate-in { animation: slideIn .45s ease-out; }
    @keyframes slideIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  `]
})
export class AiReactionLabComponent implements OnInit, OnDestroy {
  @ViewChild('viewerContainer', { static: false }) viewerContainer!: ElementRef;

  query = '';
  loading = false;
  loadingStatus = '';
  reaction: Reaction | null = null;
  animationSteps: AnimationStep[] = [];
  currentStep = 0;
  isPlaying = false;
  activeTab: 'molecular' | 'beaker' | 'video' = 'molecular';

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationId = 0;
  private playInterval: any = null;
  private reactantsGroup = new THREE.Group();
  private productsGroup = new THREE.Group();
  private allAtomMeshes: THREE.Mesh[] = [];
  private allBondMeshes: THREE.Mesh[] = [];
  private reactantsData: ReactionMoleculeGroup | null = null;
  private productsData: ReactionMoleculeGroup | null = null;

  constructor(
    private aiService: AiReactionService,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['q']) { this.query = params['q']; this.generate(); }
    });
  }

  ngOnDestroy(): void { this.stopViewer(); }

  switchTab(tab: 'molecular' | 'beaker' | 'video') {
    this.activeTab = tab;
    if (tab === 'molecular' && this.reaction && !this.renderer) {
      setTimeout(() => this.initViewer(), 50);
    }
  }

  generate(): void {
    if (!this.query.trim() || this.loading) return;
    this.loading = true;
    this.loadingStatus = this.translate.instant('AI_REACTION_LAB.STATUS_1');
    this.reaction = null;
    this.activeTab = 'molecular';
    this.stopViewer();

    setTimeout(() => this.loadingStatus = this.translate.instant('AI_REACTION_LAB.STATUS_2'), 2000);
    setTimeout(() => this.loadingStatus = this.translate.instant('AI_REACTION_LAB.STATUS_3'), 4500);

    this.aiService.generateReaction(this.query).subscribe({
      next: (rxn) => {
        this.reaction = rxn;
        this.reactantsData = JSON.parse(rxn.reactantsData);
        this.productsData = JSON.parse(rxn.productsData);
        const ad: AnimationData = JSON.parse(rxn.animationSteps);
        this.animationSteps = ad.steps;
        this.loading = false;
        setTimeout(() => this.initViewer(), 120);
      },
      error: () => {
        this.loading = false;
        alert(this.translate.instant('AI_REACTION_LAB.ERROR_GENERATE'));
      }
    });
  }

  togglePlay(): void {
    if (this.isPlaying) {
      this.isPlaying = false;
      clearInterval(this.playInterval);
    } else {
      this.isPlaying = true;
      if (this.currentStep >= this.animationSteps.length - 1) { this.currentStep = 0; this.updateScene(); }
      this.playInterval = setInterval(() => {
        if (this.currentStep < this.animationSteps.length - 1) { this.currentStep++; this.updateScene(); }
        else { this.isPlaying = false; clearInterval(this.playInterval); }
      }, 2500);
    }
  }

  goToStep(i: number) { this.currentStep = i; this.updateScene(); }

  resetAnimation() {
    this.isPlaying = false; clearInterval(this.playInterval);
    this.currentStep = 0; this.updateScene();
  }

  private initViewer(): void {
    const cont = this.viewerContainer?.nativeElement;
    if (!cont) return;
    const w = cont.clientWidth, h = cont.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060912);

    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    this.camera.position.set(0, 2, 8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    cont.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const dir = new THREE.DirectionalLight(0xffffff, 2);
    dir.position.set(10, 10, 10); this.scene.add(dir);
    const pt = new THREE.PointLight(0x8B5CF6, 50, 20);
    pt.position.set(-5, 5, -5); this.scene.add(pt);

    this.scene.add(this.reactantsGroup);
    this.scene.add(this.productsGroup);
    this.updateScene();
    this.animateViewer();
  }

  private stopViewer(): void {
    cancelAnimationFrame(this.animationId);
    if (this.playInterval) clearInterval(this.playInterval);
    if (this.renderer) {
      this.renderer.dispose();
      const el = this.viewerContainer?.nativeElement;
      if (el && this.renderer.domElement.parentNode === el)
        el.removeChild(this.renderer.domElement);
      (this.renderer as any) = null;
    }
  }

  private animateViewer(): void {
    this.animationId = requestAnimationFrame(() => this.animateViewer());
    this.controls?.update();
    this.renderer?.render(this.scene, this.camera);
  }

  private updateScene(): void {
    this.clearGroup(this.reactantsGroup);
    this.clearGroup(this.productsGroup);
    this.allAtomMeshes = []; this.allBondMeshes = [];
    const phase = this.animationSteps[this.currentStep]?.phase || 'initial';

    if (phase === 'initial' || phase === 'breaking') {
      this.buildMolGroup(this.reactantsData!, this.reactantsGroup, 1.0);
      if (phase === 'breaking') this.allBondMeshes.forEach(m => {
        (m.material as THREE.MeshPhongMaterial).opacity = 0.3;
        (m.material as THREE.MeshPhongMaterial).transparent = true;
        (m.material as THREE.MeshPhongMaterial).emissive = new THREE.Color(0xFF3333);
        (m.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.5;
      });
    } else if (phase === 'transition') {
      this.buildScattered();
    } else if (phase === 'forming' || phase === 'final') {
      this.buildMolGroup(this.productsData!, this.productsGroup, 1.0);
      if (phase === 'forming') this.allBondMeshes.forEach(m => {
        (m.material as THREE.MeshPhongMaterial).opacity = 0.4;
        (m.material as THREE.MeshPhongMaterial).transparent = true;
        (m.material as THREE.MeshPhongMaterial).emissive = new THREE.Color(0x33FF33);
        (m.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.4;
      });
    }
  }

  private buildScattered(): void {
    if (!this.reactantsData) return;
    for (const mol of this.reactantsData.molecules)
      for (const atom of mol.atoms) {
        const r = ELEMENT_RADII[atom.element] || 0.35;
        const c = ELEMENT_COLORS[atom.element] || 0xcccccc;
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), new THREE.MeshPhongMaterial({ color: c, shininess: 80 }));
        const s = 0.8;
        m.position.set(atom.x + (Math.random() - .5) * s, atom.y + (Math.random() - .5) * s, atom.z + (Math.random() - .5) * s);
        this.reactantsGroup.add(m);
      }
  }

  private buildMolGroup(data: ReactionMoleculeGroup, group: THREE.Group, op: number): void {
    if (!data?.molecules) return;
    for (const mol of data.molecules) {
      const pos: THREE.Vector3[] = [];
      for (const atom of mol.atoms) {
        const r = ELEMENT_RADII[atom.element] || 0.35, c = ELEMENT_COLORS[atom.element] || 0xcccccc;
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), new THREE.MeshPhongMaterial({ color: c, shininess: 80, opacity: op, transparent: op < 1 }));
        m.position.set(atom.x, atom.y, atom.z);
        group.add(m); this.allAtomMeshes.push(m);
        pos.push(new THREE.Vector3(atom.x, atom.y, atom.z));
      }
      if (mol.bonds) for (const b of mol.bonds) {
        const s = pos[b.from], e = pos[b.to];
        if (s && e) this.createBond(s, e, 0xaaaaaa, 0.05, group);
      }
    }
  }

  private createBond(s: THREE.Vector3, e: THREE.Vector3, color: number, r: number, group: THREE.Group): void {
    const dir = new THREE.Vector3().subVectors(e, s);
    const len = dir.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12), new THREE.MeshPhongMaterial({ color }));
    m.position.copy(new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5));
    m.setRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()));
    group.add(m); this.allBondMeshes.push(m);
  }

  private clearGroup(g: THREE.Group): void {
    while (g.children.length > 0) {
      const c = g.children[0]; g.remove(c);
      if (c instanceof THREE.Mesh) { c.geometry.dispose(); (c.material as THREE.Material).dispose(); }
    }
  }
}
