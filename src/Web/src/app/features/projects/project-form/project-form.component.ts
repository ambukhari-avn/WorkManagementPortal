// src/Web/src/app/features/projects/project-form/project-form.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../shared/services/project.service';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.scss'
})
export class ProjectFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  projectId: number | null = null;
  errorMessage = '';

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    isArchived: [false]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.projectId = Number(idParam);
      this.projectService.getById(this.projectId).subscribe(project => {
        this.form.patchValue({
          title: project.title,
          description: project.description || '',
          isArchived: project.isArchived
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();

    if (this.isEditMode() && this.projectId) {
      this.projectService.update(this.projectId, {
        title: raw.title!,
        description: raw.description || undefined,
        isArchived: raw.isArchived!
      }).subscribe({
        next: () => this.router.navigate(['/projects', this.projectId]),
        error: () => this.errorMessage = 'Failed to update project.'
      });
    } else {
      const currentUserId = Number(this.authService.currentUser()?.sub);
      this.projectService.create({
        title: raw.title!,
        description: raw.description || null,
        createdByUserId: currentUserId
      }).subscribe({
        next: (project) => this.router.navigate(['/projects', project.id]),
        error: () => this.errorMessage = 'Failed to create project.'
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/projects']);
  }
}