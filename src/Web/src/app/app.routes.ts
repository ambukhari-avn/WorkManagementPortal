import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
      { path: 'projects', loadComponent: () => import('./features/projects/project-list/project-list.component').then(m => m.ProjectListComponent) },
      { path: 'projects/new', loadComponent: () => import('./features/projects/project-form/project-form.component').then(m => m.ProjectFormComponent) },
      { path: 'projects/:id/edit', loadComponent: () => import('./features/projects/project-form/project-form.component').then(m => m.ProjectFormComponent) },
      { path: 'projects/:id', loadComponent: () => import('./features/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent) },
      { path: 'projects/:id/tasks', loadComponent: () => import('./features/tasks/task-list/task-list.component').then(m => m.TaskListComponent) },
    ]
  }
];