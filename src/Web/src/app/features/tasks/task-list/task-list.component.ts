// src/Web/src/app/features/tasks/task-list/task-list.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService } from '../../../shared/services/task.service';
import { TaskItem } from '../../../shared/models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  projectId!: number;
  tasks = signal<TaskItem[]>([]);
  totalCount = signal(0);
  loading = signal(true);

  search = '';
  statusFilter = '';
  priorityFilter = '';
  page = 1;
  pageSize = 10;

  protected readonly Math = Math;

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading.set(true);
    this.taskService.getByProject(
      this.projectId,
      this.statusFilter || undefined,
      this.priorityFilter || undefined,
      this.search || undefined,
      this.page,
      this.pageSize
    ).subscribe({
      next: result => {
        this.tasks.set(result.items);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadTasks();
  }

  goToPage(newPage: number): void {
    this.page = newPage;
    this.loadTasks();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount() / this.pageSize) || 1;
  }

  openTask(id: number): void {
    this.router.navigate(['/tasks', id]);
  }

  goBack(): void {
    this.router.navigate(['/projects', this.projectId]);
  }
}