import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ReactionService } from '../../services/reaction.service';
import { Reaction } from '../../models/models';

@Component({
  selector: 'app-reactions',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, TranslateModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-icon">
          <mat-icon>bolt</mat-icon>
        </div>
        <div>
          <h1>{{ 'REACTIONS.TITLE' | translate }}</h1>
          <p>{{ 'REACTIONS.SUBTITLE' | translate }}</p>
        </div>
      </div>
    </div>

    @if (showAiSynth) {
      <!-- AI Cloud Synth Interaction -->
      <div class="ai-synth-cloud-container slide-up">
        <div class="cloud-card-premium">
          <div class="cloud-stars"></div>
          <div class="card-content">
            <div class="premium-badge">
              <mat-icon>auto_awesome</mat-icon>
              {{ 'REACTIONS.AI_SYNTH_BADGE' | translate }}
            </div>
            <h2>{{ 'REACTIONS.AI_SYNTH_TITLE' | translate }}</h2>
            <p>{{ 'REACTIONS.AI_SYNTH_DESC' | translate }}</p>
            
            <div class="cloud-input-wrapper">
              <textarea [(ngModel)]="aiQuery" 
                        [placeholder]="'REACTIONS.AI_SYNTH_PLACEHOLDER' | translate"
                        (keyup.enter)="launchLab()"></textarea>
              <button class="synth-launch-btn" (click)="launchLab()" [disabled]="!aiQuery.trim()">
                <mat-icon>science</mat-icon>
                <span>{{ 'REACTIONS.LAUNCH_SYNTHESIS' | translate }}</span>
              </button>
            </div>
            
            <div class="suggest-row">
              <span class="label">{{ 'REACTIONS.TRY_LABEL' | translate }}</span>
              <span class="chip" (click)="aiQuery = 'Iron in Oxygen'">{{ 'REACTIONS.CHIP_IRON' | translate }}</span>
              <span class="chip" (click)="aiQuery = 'Sodum + Chlorine'">{{ 'REACTIONS.CHIP_NACL' | translate }}</span>
              <span class="chip" (click)="aiQuery = 'Esterification'">{{ 'REACTIONS.CHIP_ESTER' | translate }}</span>
            </div>
          </div>
          <div class="viz-element">
            <div class="orbit-path">
              <div class="electron-dot"></div>
            </div>
            <div class="core-glow"></div>
          </div>
        </div>
      </div>
    }

    <div class="page-wrapper" style="padding-top: 0;">
      <div class="reaction-grid">
        @for (reaction of reactions; track reaction.id) {
          <div class="reaction-card" [routerLink]="['/reactions', reaction.id]">
            <div class="card-top">
              <div class="card-icon-wrap">
                <mat-icon>science</mat-icon>
              </div>
              <span class="type-badge">{{ reaction.reactionType }}</span>
            </div>
            <h3>{{ reaction.name }}</h3>
            <div class="equation">{{ reaction.equation }}</div>
            <p class="card-desc">{{ reaction.description }}</p>
            <div class="card-action-row">
              <div class="card-action">
                <span>{{ 'REACTIONS.WATCH' | translate }}</span>
                <mat-icon>arrow_forward</mat-icon>
              </div>
              <a class="lab-link"
                 [routerLink]="['/reactions', reaction.id, 'lab']"
                 (click)="$event.stopPropagation()">
                {{ 'REACTIONS.LAB_VIEW' | translate }}
              </a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper { width: 100%; max-width: var(--page-max); margin: 0 auto; padding: 40px var(--page-gutter) 60px; }

    .page-header { display: flex; align-items: center; gap: 18px; margin-bottom: 36px; }

    .header-icon {
      display: flex; align-items: center; justify-content: center;
      width: 44px; height: 44px; border-radius: 50%;
      background: #1E3932; color: white; flex-shrink: 0;
    }
    .header-icon mat-icon { font-size: 22px; width: 22px; height: 22px; }

    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: #006241; margin: 0 0 4px; letter-spacing: -0.01em; }
    .page-header p { font-size: 0.9rem; color: rgba(0,0,0,0.58); margin: 0; }

    .reaction-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }

    .reaction-card {
      background: white; border-radius: 12px; padding: 24px; cursor: pointer;
      transition: all 0.2s; box-shadow: 0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.24);
    }
    .reaction-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06); }

    .card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }

    .card-icon-wrap {
      display: inline-flex; align-items: center; justify-content: center;
      width: 40px; height: 40px; border-radius: 50%; background: #d4e9e2; color: #006241;
    }
    .card-icon-wrap mat-icon { font-size: 20px; width: 20px; height: 20px; }

    .type-badge {
      font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 50px;
      background: #d4e9e2; color: #006241; text-transform: uppercase; letter-spacing: 0.02em;
    }

    .reaction-card h3 { font-size: 1rem; font-weight: 700; color: rgba(0,0,0,0.87); margin: 0 0 8px; letter-spacing: -0.01em; }

    .equation {
      display: inline-block; padding: 4px 12px; font-size: 13px; font-weight: 600;
      font-family: 'Courier New', monospace; color: #006241; background: #d4e9e2;
      border-radius: 8px; margin-bottom: 12px;
    }

    .card-desc { font-size: 13px; color: rgba(0,0,0,0.58); line-height: 1.55; margin: 0 0 16px; }

    .card-action { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #00754A; letter-spacing: -0.01em; }
    .card-action-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }

    .lab-link {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 4px 12px; border-radius: 50px; font-size: 12px; font-weight: 700;
      text-decoration: none; color: #00754A; background: #d4e9e2; border: 1px solid #a8d8c5; transition: all 0.2s;
      letter-spacing: -0.01em;
    }
    .lab-link:hover { color: #006241; background: #b8e0d2; }

    .card-action mat-icon { font-size: 16px; width: 16px; height: 16px; transition: transform 0.2s; }
    .reaction-card:hover .card-action mat-icon { transform: translateX(3px); }

    @media (max-width: 640px) { .reaction-grid { grid-template-columns: 1fr; } .page-wrapper { padding: 24px 16px 40px; } }

    /* === AI Synth Cloud Panel === */
    .ai-synth-cloud-container { max-width: 1100px; margin: 0 auto 48px; }

    .cloud-card-premium {
      background: #1E3932; border-radius: 12px; padding: 40px 48px;
      display: flex; align-items: center; justify-content: space-between;
      box-shadow: 0 8px 24px rgba(30,57,50,0.25); position: relative; overflow: hidden;
    }

    .premium-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(212,233,226,0.15); color: #d4e9e2;
      padding: 5px 14px; border-radius: 50px; font-size: 11px; font-weight: 700;
      letter-spacing: 0.08em; margin-bottom: 18px; border: 1px solid rgba(212,233,226,0.25);
    }

    .card-content { flex: 1; z-index: 5; }
    .card-content h2 { font-size: 2rem; font-weight: 700; color: white; margin: 0 0 10px; letter-spacing: -0.02em; }
    .card-content p { font-size: 1rem; color: rgba(255,255,255,0.65); margin: 0 0 28px; max-width: 480px; line-height: 1.6; }

    .cloud-input-wrapper { display: flex; flex-direction: column; gap: 14px; max-width: 500px; }

    .cloud-input-wrapper textarea {
      background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px;
      padding: 14px; color: white; font-family: inherit; font-size: 14px;
      resize: none; height: 76px; outline: none; transition: all 0.2s;
    }
    .cloud-input-wrapper textarea:focus { border-color: #d4e9e2; background: rgba(0,0,0,0.35); box-shadow: 0 0 0 3px rgba(212,233,226,0.15); }

    .synth-launch-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 10px;
      padding: 11px 24px; background: white; color: #00754A;
      border: 1px solid white; border-radius: 50px; font-size: 14px; font-weight: 700;
      cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em;
    }
    .synth-launch-btn:hover:not(:disabled) { background: #f2f0eb; }
    .synth-launch-btn:active { transform: scale(0.95); }
    .synth-launch-btn:disabled { opacity: 0.45; cursor: not-allowed; }

    .suggest-row { display: flex; align-items: center; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
    .suggest-row .label { color: rgba(255,255,255,0.50); font-size: 12px; font-weight: 600; }

    .chip {
      background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.65);
      padding: 5px 13px; border-radius: 50px; font-size: 12px; font-weight: 500;
      cursor: pointer; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.15);
    }
    .chip:hover { color: white; background: rgba(212,233,226,0.18); border-color: rgba(212,233,226,0.35); }

    .viz-element { position: relative; width: 280px; height: 280px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

    .orbit-path {
      width: 200px; height: 200px; border: 1px solid rgba(212,233,226,0.25); border-radius: 50%;
      position: relative; animation: rotate 10s linear infinite;
    }
    .electron-dot {
      position: absolute; top: -5px; left: 50%; width: 10px; height: 10px;
      background: #d4e9e2; border-radius: 50%; box-shadow: 0 0 12px #d4e9e2;
    }
    .core-glow {
      position: absolute; width: 80px; height: 80px; background: radial-gradient(circle, rgba(212,233,226,0.6) 0%, transparent 70%);
      filter: blur(20px); animation: pulse-glow 4s ease-in-out infinite;
    }

    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes pulse-glow { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.5); opacity: 0.7; } }
    @keyframes slide-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    .slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1); }

    @media (max-width: 768px) { .cloud-card-premium { flex-direction: column; padding: 32px 24px; } .viz-element { display: none; } }
  `]
})
export class ReactionsComponent implements OnInit {
  reactions: Reaction[] = [];
  aiQuery = '';
  showAiSynth = true;

  private readonly labReactionNames = [
    'Silver Chloride Precipitation',
    'Calcium Carbonate Precipitation',
    'Hydrogen Peroxide Decomposition'
  ];

  constructor(
    private reactionService: ReactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.reactionService.getAll().subscribe(data => {
      const filtered = data.filter(r => this.labReactionNames.includes(r.name));
      this.reactions = this.labReactionNames
        .map(name => filtered.find(r => r.name === name))
        .filter((r): r is Reaction => !!r);
    });
  }

  launchLab(): void {
    if (!this.aiQuery.trim()) return;
    this.router.navigate(['/ai-reaction-lab'], { queryParams: { q: this.aiQuery } });
  }
}
