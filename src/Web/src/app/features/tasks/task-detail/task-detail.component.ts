// task-detail.component.ts
import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService } from '../../../shared/services/task.service';
import { CommentService } from '../../../shared/services/comment.service';
import { AttachmentService } from '../../../shared/services/attachment.service';
import { AuthService } from '../../../shared/services/auth.service';
import { ProjectService } from '../../../shared/services/project.service';
import { TaskItem } from '../../../shared/models/task.model';
import { Comment } from '../../../shared/models/comment.model';
import { Attachment } from '../../../shared/models/attachment.model';
import { ProjectMember } from '../../../shared/models/project.model';
import { AuditLogService } from '../../../shared/services/audit-log.service';
import { AuditLog } from '../../../shared/models/audit-log.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent implements OnInit {
  private taskService = inject(TaskService);
  private commentService = inject(CommentService);
  attachmentService = inject(AttachmentService);
  private authService = inject(AuthService);
  private projectService = inject(ProjectService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auditLogService = inject(AuditLogService);
  activity = signal<AuditLog[]>([]);

  taskId!: number;
  task = signal<TaskItem | null>(null);
  comments = signal<Comment[]>([]);
  attachments = signal<Attachment[]>([]);
  projectMembers = signal<ProjectMember[]>([]);
  loading = signal(true);
  newComment = '';
  uploading = signal(false);

  isMember = computed(() => {
    const userId = Number(this.authService.currentUser()?.sub);
    return this.projectMembers().some(m => m.userId === userId);
  });

  canEdit = computed(() => this.isMember() || this.authService.isAdmin());

  ngOnInit(): void {
    this.taskId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTask();
    this.loadComments();
    this.loadAttachments();
    this.loadActivity();
  }

  loadTask(): void {
    this.taskService.getById(this.taskId).subscribe({
      next: t => {
        this.task.set(t);
        this.loading.set(false);
        this.projectService.getMembers(t.projectId).subscribe(m => this.projectMembers.set(m));
      },
      error: () => this.loading.set(false)
    });
  }

  loadActivity(): void {
  this.auditLogService.getByEntity('TaskItem', this.taskId).subscribe(a => this.activity.set(a));
}

  loadComments(): void {
    this.commentService.getByTask(this.taskId).subscribe(c => this.comments.set(c));
  }

  loadAttachments(): void {
    this.attachmentService.getByTask(this.taskId).subscribe(a => this.attachments.set(a));
  }

  addComment(): void {
    if (!this.newComment.trim()) return;
    const authorUserId = Number(this.authService.currentUser()?.sub);

    this.commentService.create(this.taskId, {
      content: this.newComment,
      taskItemId: this.taskId,
      authorUserId
    }).subscribe(() => {
      this.newComment = '';
      this.loadComments();
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.uploading.set(true);
    this.attachmentService.upload(this.taskId, input.files[0]).subscribe({
      next: () => { this.uploading.set(false); this.loadAttachments(); },
      error: () => this.uploading.set(false)
    });
    input.value = '';
  }

  deleteAttachment(id: number): void {
    this.attachmentService.delete(id).subscribe(() => this.loadAttachments());
  }

  goBack(): void {
    const t = this.task();
    if (t) this.router.navigate(['/projects', t.projectId, 'tasks']);
  }

  downloadAttachment(file: Attachment): void {
  this.attachmentService.download(file.id, file.fileName);
}
}