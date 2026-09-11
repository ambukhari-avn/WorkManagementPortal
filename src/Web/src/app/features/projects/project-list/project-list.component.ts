// src/Web/src/app/features/projects/project-list/project-list.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../../shared/services/project.service';
import { Project } from '../../../shared/models/project.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss'
})
export class ProjectListComponent implements OnInit {
  private projectService = inject(ProjectService);
  private router = inject(Router);
  protected readonly Math = Math;

  projects = signal<Project[]>([]);
  totalCount = signal(0);
  loading = signal(true);

  search = '';
  archivedFilter: string = '';
  page = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading.set(true);
    const isArchived = this.archivedFilter === '' ? undefined : this.archivedFilter === 'true';

    this.projectService.getAll(this.search || undefined, isArchived, this.page, this.pageSize).subscribe({
      next: result => {
        this.projects.set(result.items);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearchChange(): void {
    this.page = 1;
    this.loadProjects();
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadProjects();
  }

  goToPage(newPage: number): void {
    this.page = newPage;
    this.loadProjects();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount() / this.pageSize) || 1;
  }

  openProject(id: number): void {
    this.router.navigate(['/projects', id]);
  }

  initials(title: string): string {
    return title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
}