// src/Web/src/app/features/tasks/task-form/task-form.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../shared/services/task.service';
import { ProjectService } from '../../../shared/services/project.service';
import { ProjectMember } from '../../../shared/models/project.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  projectId!: number;
  taskId: number | null = null;
  members = signal<ProjectMember[]>([]);
  errorMessage = '';

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    priority: ['Medium', Validators.required],
    status: ['Pending'],
    assignedToUserId: [''],
    dueDate: ['']
  });

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    const taskIdParam = this.route.snapshot.paramMap.get('taskId');

    this.projectService.getMembers(this.projectId).subscribe(m => this.members.set(m));

    if (taskIdParam) {
      this.isEditMode.set(true);
      this.taskId = Number(taskIdParam);
      this.taskService.getById(this.taskId).subscribe(task => {
        this.form.patchValue({
          title: task.title,
          description: task.description || '',
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate ? task.dueDate.substring(0, 10) : ''
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();

    if (this.isEditMode() && this.taskId) {
      this.taskService.update(this.taskId, {
        title: raw.title!,
        description: raw.description || undefined,
        status: raw.status || undefined,
        priority: raw.priority || undefined,
        dueDate: raw.dueDate || undefined
      }).subscribe({
        next: () => this.router.navigate(['/tasks', this.taskId]),
        error: () => this.errorMessage = 'Failed to update task.'
      });
    } else {
      this.taskService.create({
        title: raw.title!,
        description: raw.description || null,
        priority: raw.priority!,
        projectId: this.projectId,
        assignedToUserId: raw.assignedToUserId ? Number(raw.assignedToUserId) : null
      }).subscribe({
        next: (task) => this.router.navigate(['/tasks', task.id]),
        error: () => this.errorMessage = 'Failed to create task.'
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/projects', this.projectId, 'tasks']);
  }
}