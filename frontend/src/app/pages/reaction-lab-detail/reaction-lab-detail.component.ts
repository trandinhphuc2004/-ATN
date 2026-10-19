import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Reaction } from '../../models/models';
import { ReactionService } from '../../services/reaction.service';
import { TranslateModule } from '@ngx-translate/core';
import { BeakerSimulationComponent } from '../../shared/beaker-simulation/beaker-simulation.component';

@Component({
  selector: 'app-reaction-lab-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatProgressSpinnerModule, BeakerSimulationComponent, TranslateModule],
  template: `
    <div class="page-wrapper">
      <a routerLink="/reactions" class="back-link">
        <mat-icon>arrow_back</mat-icon>
        <span>{{ 'REACTION_LAB.BACK' | translate }}</span>
      </a>

      @if (reaction) {
        <div class="header-row">
          <div>
            <h1>{{ reaction.name }}</h1>
            <div class="equation">{{ reaction.equation }}</div>
            <p class="desc">{{ reaction.description }}</p>
          </div>
        </div>

        <div class="lab-stage">
          <app-beaker-simulation [reaction]="reaction" style="display:block;width:100%;height:100%"></app-beaker-simulation>
        </div>
      } @else {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-wrapper { width: 100%; max-width: var(--page-max); margin: 0 auto; padding: 24px; }
    .back-link { display: inline-flex; align-items: center; gap: 6px; color: rgba(0,0,0,0.58); text-decoration: none; font-weight: 600; margin-bottom: 18px; font-size: 14px; transition: color 0.2s; }
    .back-link:hover { color: #00754A; }
    .header-row h1 { font-size: 1.55rem; margin: 0 0 6px; color: rgba(0,0,0,0.87); font-weight: 700; letter-spacing: -0.01em; }
    .equation { display: inline-block; font-family: 'Courier New', monospace; font-size: 14px; font-weight: 700; color: #006241; background: #d4e9e2; border-radius: 8px; padding: 4px 10px; margin-bottom: 8px; }
    .desc { color: rgba(0,0,0,0.58); margin: 0 0 14px; max-width: 760px; }
    .lab-stage { height: min(76vh, 760px); border-radius: 12px; overflow: hidden; box-shadow: 0 8px 28px rgba(0,0,0,0.12); background: #020617; }
    .loading { height: 56vh; display: flex; align-items: center; justify-content: center; }
  `]
})
export class ReactionLabDetailComponent implements OnInit {
  reaction: Reaction | null = null;

  constructor(
    private route: ActivatedRoute,
    private reactionService: ReactionService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.reactionService.getById(id).subscribe(r => this.reaction = r);
  }
}
