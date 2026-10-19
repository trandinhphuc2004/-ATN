import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

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
    path: 'quiz',
    loadComponent: () => import('./pages/quiz/quiz.component').then(m => m.QuizComponent),
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
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'ai-questions',
    loadComponent: () => import('./pages/ai-question-generator/ai-question-generator.component').then(m => m.AiQuestionGeneratorComponent),
    canActivate: [authGuard]
  },
  {
    path: 'ai-lesson',
    loadComponent: () => import('./pages/ai-lesson-generator/ai-lesson-generator.component').then(m => m.AiLessonGeneratorComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'TEACHER'] }
  },
  {
    path: 'ai-reaction-lab',
    loadComponent: () => import('./pages/ai-reaction-lab/ai-reaction-lab.component').then(m => m.AiReactionLabComponent),
    canActivate: [authGuard]
  },
  {
    path: 'ai-molecule-viewer',
    loadComponent: () => import('./pages/ai-molecule-viewer/ai-molecule-viewer.component').then(m => m.AiMoleculeViewerComponent),
    canActivate: [authGuard]
  },
  {
    path: 'recommendations',
    loadComponent: () => import('./pages/recommendations/recommendations.component').then(m => m.RecommendationsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'exams',
    loadComponent: () => import('./pages/exam-list/exam-list.component').then(m => m.ExamListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'exams/:id/take',
    loadComponent: () => import('./pages/exam-take/exam-take.component').then(m => m.ExamTakeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'exams/:id/review',
    loadComponent: () => import('./pages/exam-take/exam-take.component').then(m => m.ExamTakeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'exam-manage',
    loadComponent: () => import('./pages/exam-manage/exam-manage.component').then(m => m.ExamManageComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'TEACHER'] }
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/home' }
];
