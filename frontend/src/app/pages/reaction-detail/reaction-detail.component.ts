import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReactionService } from '../../services/reaction.service';
import { AiQuestionService } from '../../services/ai-question.service';
import { Reaction, ReactionMoleculeGroup, AnimationData, AnimationStep, Question } from '../../models/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VideoSuggestionsComponent } from '../../shared/video-suggestions/video-suggestions.component';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const ELEMENT_COLORS: Record<string, number> = {
  'H': 0xFFFFFF, 'C': 0x333333, 'N': 0x3050F8, 'O': 0xFF0D0D,
  'S': 0xFFFF30, 'P': 0xFF8000, 'Cl': 0x1FF01F, 'F': 0x90E050
};

const ELEMENT_RADII: Record<string, number> = {
  'H': 0.25, 'C': 0.4, 'N': 0.38, 'O': 0.35,
  'S': 0.45, 'P': 0.42, 'Cl': 0.43, 'F': 0.3
};

@Component({
  selector: 'app-reaction-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, MatProgressSpinnerModule, TranslateModule,
    VideoSuggestionsComponent],
  template: `
    <div class="page-wrapper">
      <a routerLink="/reactions" class="back-link">
        <mat-icon>arrow_back</mat-icon> {{ 'REACTIONS.BACK_LIST' | translate }}
      </a>

      @if (reaction) {
        <div class="detail-header">
          <div class="header-icon">
            <mat-icon>bolt</mat-icon>
          </div>
          <div>
            <h1>{{ reaction.name }}</h1>
            <div class="equation-badge">{{ reaction.equation }}</div>
          </div>
        </div>
        <p class="detail-desc">{{ reaction.description }}</p>

        <div class="viewer-wrapper">
          <div #viewerContainer class="viewer-container"></div>
          <div class="controls-hint">
            <mat-icon>mouse</mat-icon>
            {{ 'REACTIONS.CONTROLS' | translate }}
          </div>
        </div>

        <!-- Animation Controls -->
        <div class="animation-controls">
          <div class="steps-track">
            @for (step of animationSteps; track step.label; let i = $index) {
              <button class="step-dot" [class.active]="currentStep === i"
                      [class.completed]="currentStep > i" (click)="goToStep(i)">
                <span class="dot-num">{{ i + 1 }}</span>
              </button>
              @if (i < animationSteps.length - 1) {
                <div class="step-line" [class.filled]="currentStep > i"></div>
              }
            }
          </div>

          <div class="step-info">
            <h3>{{ animationSteps[currentStep]?.label }}</h3>
            <p>{{ animationSteps[currentStep]?.description }}</p>
          </div>

          <div class="control-buttons">
            <button class="ctrl-btn" (click)="previousStep()" [disabled]="currentStep === 0">
              <mat-icon>skip_previous</mat-icon>
            </button>
            <button class="ctrl-btn play" (click)="togglePlay()">
              <mat-icon>{{ isPlaying ? 'pause' : 'play_arrow' }}</mat-icon>
            </button>
            <button class="ctrl-btn" (click)="nextStep()" [disabled]="currentStep >= animationSteps.length - 1">
              <mat-icon>skip_next</mat-icon>
            </button>
            <button class="ctrl-btn" (click)="resetAnimation()">
              <mat-icon>replay</mat-icon>
            </button>
          </div>
        </div>

        <!-- AI Cloud Chat Integration -->
        <div class="ai-interaction-container slide-up-ai">
          <div class="ai-cloud-wrapper" [class.ai-active]="aiLoading">
            <div class="cloud-header">
              <mat-icon class="pulse-icon">auto_awesome</mat-icon>
              <span>{{ 'AI_INTERACTION.CLOUD_TITLE' | translate }}</span>
            </div>
            
            <div class="cloud-input-box">
              <textarea [(ngModel)]="aiQuery" 
                        [placeholder]="'AI_INTERACTION.PLACEHOLDER' | translate"
                        (keyup.enter)="askAI()"></textarea>
              <button class="cloud-send-btn" (click)="askAI()" [disabled]="aiLoading || !aiQuery.trim()">
                @if (aiLoading) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <mat-icon>send</mat-icon>
                }
              </button>
            </div>
          </div>

          @if (aiGeneratedQuestions.length > 0) {
            <div class="ai-questions-results animate-in-questions">
              <div class="results-header">
                <h3><mat-icon>quiz</mat-icon> {{ 'AI_INTERACTION.QUESTIONS_GENERATED' | translate }}</h3>
                <button class="clear-btn" (click)="aiGeneratedQuestions = []"><mat-icon>close</mat-icon></button>
              </div>
              
              <div class="questions-list">
                @for (q of aiGeneratedQuestions; track q.question; let i = $index) {
                  <div class="ai-q-card">
                    <p class="ai-q-text" [innerHTML]="(i + 1) + '. ' + formatMessage(q.question)"></p>
                    <div class="ai-options">
                      @for (opt of [q.optionA, q.optionB, q.optionC, q.optionD]; track opt; let j = $index) {
                        <div class="ai-opt" [class.ai-correct]="aiRevealed[i] && (['A','B','C','D'][j] === q.correctAnswer)">
                          <span class="opt-label">{{ ['A','B','C','D'][j] }}</span>
                          {{ opt }}
                        </div>
                      }
                    </div>
                    
                    @if (aiRevealed[i]) {
                      <div class="ai-explanation">
                        <mat-icon>lightbulb</mat-icon>
                        <p [innerHTML]="formatMessage(q.explanation || '')"></p>
                      </div>
                    }
                    
                    <button class="ai-reveal-btn" (click)="aiRevealed[i] = !aiRevealed[i]">
                      {{ (aiRevealed[i] ? 'AI_GENERATOR.HIDE_ANSWER' : 'AI_GENERATOR.SHOW_ANSWER') | translate }}
                    </button>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Video bai giang goi y tu YouTube cho phan ung nay -->
          <app-video-suggestions [reactionId]="reaction.id"></app-video-suggestions>
        </div>
      } @else {
        <div class="loading-state">
          <mat-spinner></mat-spinner>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-wrapper { width: 100%; max-width: var(--page-max-mid); margin: 0 auto; padding: 32px var(--page-gutter) 60px; }
    .back-link { display: inline-flex; align-items: center; gap: 6px; color: rgba(0,0,0,0.58); font-size: 14px; font-weight: 500; text-decoration: none; margin-bottom: 24px; transition: color 0.2s; }
    .back-link:hover { color: #00754A; }
    .back-link mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .detail-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 8px;
    }

    .header-icon { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: #1E3932; color: white; flex-shrink: 0; }
    .header-icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .detail-header h1 { font-size: 1.5rem; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0 0 6px; letter-spacing: -0.01em; }
    .equation-badge { display: inline-block; padding: 4px 14px; font-size: 14px; font-weight: 600; font-family: 'Courier New', monospace; color: #006241; background: #d4e9e2; border-radius: 8px; }
    .detail-desc { font-size: 0.9375rem; color: rgba(0,0,0,0.58); margin: 0 0 28px; }
    .viewer-wrapper { border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.12); margin-bottom: 24px; }
    .viewer-container { width: 100%; height: 450px; background: #0f172a; }
    .controls-hint { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: #f9f9f9; font-size: 13px; color: rgba(0,0,0,0.58); border-top: 1px solid #edebe9; }
    .controls-hint mat-icon { font-size: 18px; width: 18px; height: 18px; color: rgba(0,0,0,0.30); }
    .animation-controls { background: white; border-radius: 12px; padding: 28px 24px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .steps-track { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 24px; }
    .step-dot { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; border: 2px solid #edebe9; background: white; color: rgba(0,0,0,0.40); font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.3s; flex-shrink: 0; }
    .step-dot.active { border-color: #00754A; background: #00754A; color: white; box-shadow: 0 0 0 4px rgba(0,117,74,0.15); }
    .step-dot.completed { border-color: #006241; background: #006241; color: white; }
    .step-line { flex: 1; height: 2px; max-width: 60px; background: #edebe9; transition: background 0.3s; }
    .step-line.filled { background: #006241; }
    .step-info { text-align: center; margin-bottom: 20px; }
    .step-info h3 { font-size: 1.1rem; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0 0 6px; letter-spacing: -0.01em; }
    .step-info p { font-size: 14px; color: rgba(0,0,0,0.58); margin: 0; }
    .control-buttons { display: flex; align-items: center; justify-content: center; gap: 12px; }
    .ctrl-btn { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border: 1px solid #edebe9; border-radius: 50%; background: white; color: rgba(0,0,0,0.70); cursor: pointer; transition: all 0.2s; }
    .ctrl-btn:hover:not(:disabled) { background: #f2f0eb; border-color: #d6dbde; }
    .ctrl-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .ctrl-btn.play { width: 52px; height: 52px; background: #00754A; border-color: #00754A; color: white; }
    .ctrl-btn.play:hover { background: #006241; border-color: #006241; }
    .ctrl-btn mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .ctrl-btn.play mat-icon { font-size: 26px; width: 26px; height: 26px; }
    .loading-state { display: flex; justify-content: center; padding: 80px 0; }

    .ai-interaction-container { margin-top: 40px; display: flex; flex-direction: column; gap: 20px; }
    .ai-cloud-wrapper { background: #1E3932; border-radius: 12px; padding: 24px; position: relative; box-shadow: 0 8px 24px rgba(30,57,50,0.25); overflow: hidden; }
    .cloud-header { display: flex; align-items: center; gap: 10px; color: #d4e9e2; font-weight: 700; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.08em; font-size: 12px; }
    .pulse-icon { animation: ai-pulse 2s infinite; }
    @keyframes ai-pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
    .cloud-input-box { display: flex; gap: 12px; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 12px; border: 1px solid rgba(212,233,226,0.2); }
    .cloud-input-box textarea { flex: 1; background: transparent; border: none; color: white; padding: 12px; font-family: inherit; font-size: 14px; resize: none; outline: none; height: 44px; }
    .cloud-input-box textarea::placeholder { color: rgba(255,255,255,0.50); }
    .cloud-send-btn { width: 44px; height: 44px; border-radius: 50%; background: white; color: #006241; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .cloud-send-btn:hover:not(:disabled) { background: #d4e9e2; transform: scale(1.05); }
    .cloud-send-btn:active:not(:disabled) { transform: scale(0.95); }
    .cloud-send-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .ai-questions-results { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24); }
    .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .results-header h3 { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 700; color: #006241; margin: 0; letter-spacing: -0.01em; }
    .results-header h3 mat-icon { color: #00754A; }
    .clear-btn { background: transparent; border: none; color: rgba(0,0,0,0.40); cursor: pointer; padding: 4px; border-radius: 50%; transition: all 0.2s; }
    .clear-btn:hover { color: #c82014; background: rgba(200,32,20,0.08); }
    .questions-list { display: flex; flex-direction: column; gap: 16px; }
    .ai-q-card { padding: 16px; border: 1px solid #edebe9; border-radius: 12px; background: #f9f9f9; }
    .ai-q-text { font-weight: 600; color: rgba(0,0,0,0.87); margin-bottom: 12px; line-height: 1.5; letter-spacing: -0.01em; }
    .ai-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
    .ai-opt { padding: 8px 12px; background: white; border: 1px solid #edebe9; border-radius: 8px; font-size: 13px; display: flex; align-items: center; gap: 8px; }
    .opt-label { font-weight: 800; color: rgba(0,0,0,0.30); font-size: 11px; }
    .ai-opt.ai-correct { background: #d4e9e2; border-color: #00754A; color: #006241; }
    .ai-opt.ai-correct .opt-label { color: #00754A; }
    .ai-explanation { margin-top: 12px; padding: 10px 14px; background: #faf6ee; border-left: 4px solid #cba258; display: flex; gap: 8px; font-size: 13px; color: #a07c3e; border-radius: 4px; }
    .ai-reveal-btn { margin-top: 12px; font-size: 12px; font-weight: 600; color: #006241; background: #d4e9e2; border: 1px solid #a8d8c5; border-radius: 50px; padding: 6px 14px; cursor: pointer; transition: all 0.2s; }
    .ai-reveal-btn:hover { background: #00754A; color: white; border-color: #00754A; }
    .slide-up-ai { animation: ai-slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes ai-slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    .animate-in-questions { animation: ai-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes ai-pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    @media (max-width: 640px) { .ai-options { grid-template-columns: 1fr; } .page-wrapper { padding: 24px 16px 40px; } .viewer-container { height: 320px; } }
  `]
})
export class ReactionDetailComponent implements OnInit, OnDestroy {
  @ViewChild('viewerContainer', { static: false }) viewerContainer!: ElementRef;

  reaction: Reaction | null = null;
  animationSteps: AnimationStep[] = [];
  currentStep = 0;
  isPlaying = false;

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

  // AI Interaction states
  aiQuery = '';
  aiLoading = false;
  aiGeneratedQuestions: Question[] = [];
  aiRevealed: Record<number, boolean> = {};

  constructor(
    private route: ActivatedRoute,
    private reactionService: ReactionService,
    private aiQuestionService: AiQuestionService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.reactionService.getById(id).subscribe(reaction => {
      this.reaction = reaction;
      this.reactantsData = JSON.parse(reaction.reactantsData);
      this.productsData = JSON.parse(reaction.productsData);
      const animData: AnimationData = JSON.parse(reaction.animationSteps);
      this.animationSteps = animData.steps;
      setTimeout(() => this.initViewer(), 0);
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    if (this.playInterval) clearInterval(this.playInterval);
    this.renderer?.dispose();
  }

  togglePlay(): void {
    if (this.isPlaying) {
      this.isPlaying = false;
      if (this.playInterval) clearInterval(this.playInterval);
    } else {
      this.isPlaying = true;
      if (this.currentStep >= this.animationSteps.length - 1) {
        this.currentStep = 0;
        this.updateScene();
      }
      this.playInterval = setInterval(() => {
        if (this.currentStep < this.animationSteps.length - 1) {
          this.currentStep++;
          this.updateScene();
        } else {
          this.isPlaying = false;
          clearInterval(this.playInterval);
        }
      }, 2000);
    }
  }

  goToStep(index: number): void {
    this.currentStep = index;
    this.updateScene();
  }

  nextStep(): void {
    if (this.currentStep < this.animationSteps.length - 1) {
      this.currentStep++;
      this.updateScene();
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateScene();
    }
  }

  resetAnimation(): void {
    this.isPlaying = false;
    if (this.playInterval) clearInterval(this.playInterval);
    this.currentStep = 0;
    this.updateScene();
  }

  askAI(): void {
    if (!this.aiQuery.trim() || this.aiLoading) return;

    this.aiLoading = true;
    this.aiGeneratedQuestions = [];
    this.aiRevealed = {};

    const fullPrompt = `Based on the chemical reaction ${this.reaction?.name} (${this.reaction?.equation}) and the context of: ${this.aiQuery}. Generate appropriate questions for me.`;

    this.aiQuestionService.generateQuestions({
      topic: fullPrompt,
      difficulty: 'MEDIUM',
      count: 3
    }).subscribe({
      next: (questions) => {
        this.aiGeneratedQuestions = questions;
        this.aiLoading = false;
        this.aiQuery = '';
        this.snackBar.open(this.translate.instant('AI_GENERATOR.GENERATED_HEADER', { count: questions.length }), 'OK', { duration: 3000 });
      },
      error: () => {
        this.aiLoading = false;
        this.snackBar.open(this.translate.instant('CHAT.ERROR'), 'OK', { duration: 3000 });
      }
    });
  }

  formatMessage(text: string): string {
    if (!text) return '';
    return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  }

  private initViewer(): void {
    const container = this.viewerContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);

    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    this.camera.position.set(0, 2, 8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    this.scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 5, 5);
    this.scene.add(dirLight);
    const backLight = new THREE.DirectionalLight(0x6666ff, 0.5);
    backLight.position.set(-5, -3, -5);
    this.scene.add(backLight);

    this.scene.add(this.reactantsGroup);
    this.scene.add(this.productsGroup);

    this.updateScene();

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

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.controls?.update();
    this.renderer?.render(this.scene, this.camera);
  }

  private updateScene(): void {
    // Clear existing objects
    this.clearGroup(this.reactantsGroup);
    this.clearGroup(this.productsGroup);
    this.allAtomMeshes = [];
    this.allBondMeshes = [];

    const phase = this.animationSteps[this.currentStep]?.phase || 'initial';

    if (phase === 'initial') {
      this.buildMoleculeGroup(this.reactantsData!, this.reactantsGroup, 1.0);
    } else if (phase === 'breaking') {
      this.buildMoleculeGroup(this.reactantsData!, this.reactantsGroup, 1.0);
      // Make bonds semi-transparent to show breaking
      this.allBondMeshes.forEach(mesh => {
        (mesh.material as THREE.MeshPhongMaterial).opacity = 0.35;
        (mesh.material as THREE.MeshPhongMaterial).transparent = true;
      });
    } else if (phase === 'transition') {
      // Show atoms scattered (average between reactant and product positions)
      this.buildScatteredAtoms();
    } else if (phase === 'forming') {
      this.buildMoleculeGroup(this.productsData!, this.productsGroup, 1.0);
      // Make bonds semi-transparent to show forming
      this.allBondMeshes.forEach(mesh => {
        (mesh.material as THREE.MeshPhongMaterial).opacity = 0.5;
        (mesh.material as THREE.MeshPhongMaterial).transparent = true;
      });
    } else if (phase === 'final') {
      this.buildMoleculeGroup(this.productsData!, this.productsGroup, 1.0);
    }
  }

  private buildScatteredAtoms(): void {
    if (!this.reactantsData) return;
    const allAtoms: { element: string; x: number; y: number; z: number }[] = [];
    for (const mol of this.reactantsData.molecules) {
      for (const atom of mol.atoms) {
        allAtoms.push(atom);
      }
    }
    // Scatter with slight randomness
    for (const atom of allAtoms) {
      const radius = ELEMENT_RADII[atom.element] || 0.35;
      const color = ELEMENT_COLORS[atom.element] || 0xcccccc;
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshPhongMaterial({ color, shininess: 80, specular: 0x444444 });
      const mesh = new THREE.Mesh(geometry, material);

      const spread = 0.6;
      mesh.position.set(
        atom.x + (Math.random() - 0.5) * spread,
        atom.y + (Math.random() - 0.5) * spread,
        atom.z + (Math.random() - 0.5) * spread
      );
      this.reactantsGroup.add(mesh);
    }
  }

  private buildMoleculeGroup(data: ReactionMoleculeGroup, group: THREE.Group, opacity: number): void {
    for (const mol of data.molecules) {
      const positions: THREE.Vector3[] = [];

      for (const atom of mol.atoms) {
        const radius = ELEMENT_RADII[atom.element] || 0.35;
        const color = ELEMENT_COLORS[atom.element] || 0xcccccc;
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({
          color, shininess: 80, specular: 0x444444, opacity, transparent: opacity < 1
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(atom.x, atom.y, atom.z);
        group.add(mesh);
        this.allAtomMeshes.push(mesh);
        positions.push(new THREE.Vector3(atom.x, atom.y, atom.z));
      }

      for (const bond of mol.bonds) {
        const start = positions[bond.from];
        const end = positions[bond.to];
        if (start && end) {
          this.createBond(start, end, 0xaaaaaa, 0.06, group);
        }
      }
    }
  }

  private createBond(start: THREE.Vector3, end: THREE.Vector3, color: number, radius: number, group: THREE.Group): void {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 12);
    const material = new THREE.MeshPhongMaterial({ color, shininess: 40 });
    const mesh = new THREE.Mesh(geometry, material);

    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mesh.position.copy(midpoint);

    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction.normalize());
    mesh.setRotationFromQuaternion(quaternion);

    group.add(mesh);
    this.allBondMeshes.push(mesh);
  }

  private clearGroup(group: THREE.Group): void {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    }
  }
}
