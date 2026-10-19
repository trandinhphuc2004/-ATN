import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'molecules',
    loadComponent: () => import('./pages/molecules/molecules.component').then(m => m.MoleculesComponent)
  },
  {
    path: 'molecules/:id',
    loadComponent: () => import('./pages/molecule-detail/molecule-detail.component').then(m => m.MoleculeDetailComponent)
  },
  // Bai hoc khong con cong khai: hoc sinh chi xem bai hoc da gan cho lop cua minh.
  {
    path: 'lessons',
    loadComponent: () => import('./pages/lessons/lessons.component').then(m => m.LessonsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'lessons/:id',
    loadComponent: () => import('./pages/lesson-detail/lesson-detail.component').then(m => m.LessonDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent),
    canActivate: [authGuard]
  },
  {
    path: 'reactions',
    loadComponent: () => import('./pages/reactions/reactions.component').then(m => m.ReactionsComponent)
  },
  {
    path: 'reactions/:id',
    loadComponent: () => import('./pages/reaction-detail/reaction-detail.component').then(m => m.ReactionDetailComponent)
  },
  {
    path: 'reactions/:id/lab',
    loadComponent: () => import('./pages/reaction-lab-detail/reaction-lab-detail.component').then(m => m.ReactionLabDetailComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/home' }
];
