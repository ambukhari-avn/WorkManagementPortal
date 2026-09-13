// src/Web/src/app/shared/services/project.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService } from './project.service';
import { environment } from '../../../environments/environment';
import { Project, PagedResult } from '../models/project.model';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService]
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch paginated projects with default params', () => {
    const mockResult: PagedResult<Project> = {
      items: [
        { id: 1, title: 'Test Project', description: null, isArchived: false, createdByName: 'Test User', createdAt: new Date().toISOString() }
      ],
      totalCount: 1,
      page: 1,
      pageSize: 10
    };

    service.getAll().subscribe(result => {
      expect(result.items.length).toBe(1);
      expect(result.items[0].title).toBe('Test Project');
    });

    const req = httpMock.expectOne(r =>
      r.url === `${environment.apiUrl}/projects` && r.method === 'GET'
    );
    req.flush(mockResult);
  });

  it('should include search param when provided', () => {
    service.getAll('urgent').subscribe();

    const req = httpMock.expectOne(r => r.url === `${environment.apiUrl}/projects`);
    expect(req.request.params.get('search')).toBe('urgent');
    req.flush({ items: [], totalCount: 0, page: 1, pageSize: 10 });
  });

  it('should create a project', () => {
    const newProject: Project = {
      id: 5, title: 'New Project', description: 'desc', isArchived: false,
      createdByName: 'Test User', createdAt: new Date().toISOString()
    };

    service.create({ title: 'New Project', description: 'desc', createdByUserId: 1 }).subscribe(result => {
      expect(result.id).toBe(5);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/projects`);
    expect(req.request.method).toBe('POST');
    req.flush(newProject);
  });

  it('should delete a project', () => {
    service.delete(5).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/projects/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});