// src/Web/src/app/layout/layout.component.ts
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  ContainerComponent,
  SidebarComponent as CoreSidebarComponent,
  SidebarNavComponent,
  SidebarBrandComponent,
  HeaderComponent
} from '@coreui/angular';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    ContainerComponent,
    CoreSidebarComponent,
    SidebarNavComponent,
    SidebarBrandComponent,
    HeaderComponent
  ],
  template: `
  <c-sidebar class="border-end" visible>
    <c-sidebar-brand>Work Portal</c-sidebar-brand>
    <c-sidebar-nav>
      <a class="nav-link" routerLink="/dashboard">Dashboard</a>
      <a class="nav-link" routerLink="/projects">Projects</a>
      <a class="nav-link" routerLink="/my-tasks">My Tasks</a>
      @if (authService.isAdmin()) {
        <a class="nav-link" routerLink="/users">Users</a>
      }
    </c-sidebar-nav>
  </c-sidebar>
  <div class="wrapper d-flex flex-column min-vh-100">
    <c-header class="mb-4 d-print-none header header-sticky">
      <c-container class="justify-content-end" fluid>
        <button class="btn btn-outline-secondary" (click)="logout()">Logout</button>
      </c-container>
    </c-header>
    <div class="body flex-grow-1 px-3">
      <router-outlet></router-outlet>
    </div>
  </div>
`
})
export class LayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}