// src/Web/src/app/features/tasks/my-tasks/my-tasks.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../../shared/services/task.service';
import { TaskItem } from '../../../shared/models/task.model';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-tasks.component.html',
  styleUrl: './my-tasks.component.scss'
})
export class MyTasksComponent implements OnInit {
  private taskService = inject(TaskService);
  private router = inject(Router);

  tasks = signal<TaskItem[]>([]);
  loading = signal(true);
  statusFilter = '';
  priorityFilter = '';

  ngOnInit(): void { this.loadTasks(); }

  loadTasks(): void {
    this.loading.set(true);
    this.taskService.getMine(this.statusFilter || undefined, this.priorityFilter || undefined).subscribe({
      next: result => { this.tasks.set(result.items); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openTask(id: number): void { this.router.navigate(['/tasks', id]); }
}