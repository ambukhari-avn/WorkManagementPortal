// src/Web/src/app/shared/services/auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

// Builds a syntactically valid (but unsigned) JWT for testing jwtDecode() without needing a real signature.
function fakeJwt(payload: object): string {
  const base64UrlEncode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const header = { alg: 'HS256', typ: 'JWT' };
  return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.fakesignature`;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: { navigate: () => {} } }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store tokens and decode user info on successful login', () => {
    const token = fakeJwt({
      sub: '1',
      email: 'test@test.com',
      role: 'Member',
      exp: Math.floor(Date.now() / 1000) + 900
    });

    const mockResponse = {
      accessToken: token,
      refreshToken: 'fake-refresh-token',
      accessTokenExpiresAt: new Date(Date.now() + 900000).toISOString()
    };

    service.login({ email: 'test@test.com', password: 'password123' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(localStorage.getItem('access_token')).toBe(token);
    expect(service.currentUser()?.email).toBe('test@test.com');
    expect(service.isAdmin()).toBe(false);
  });

  it('should clear tokens on logout', () => {
    localStorage.setItem('access_token', 'some-token');
    localStorage.setItem('refresh_token', 'some-refresh');

    service.logout();

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  it('should return false from isAuthenticated when no token exists', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should return true from isAuthenticated with a valid, unexpired token', () => {
    const token = fakeJwt({ sub: '1', role: 'Member', exp: Math.floor(Date.now() / 1000) + 900 });
    localStorage.setItem('access_token', token);
    expect(service.isAuthenticated()).toBe(true);
  });
});