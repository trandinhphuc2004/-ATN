import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserRequest, UpdateUserRequest } from '../models/models';
import { environment } from '../../environments/environment';

export interface UserFilters {
  name?: string;
  email?: string;
  role?: string;
  classId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private apiUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getUsers(filters?: UserFilters): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, { params: this.toParams(filters) });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, request);
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, request);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Tai file CSV qua HttpClient de interceptor gan header Authorization.
   * (window.open khong gui duoc JWT nen backend tra ve 401/403 va khong tai duoc file.)
   */
  exportCsv(filters?: UserFilters): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, { params: this.toParams(filters), responseType: 'blob' });
  }

  private toParams(filters?: UserFilters): HttpParams {
    let params = new HttpParams();
    if (filters?.name) params = params.set('name', filters.name);
    if (filters?.email) params = params.set('email', filters.email);
    if (filters?.role) params = params.set('role', filters.role);
    if (filters?.classId) params = params.set('classId', filters.classId);
    return params;
  }

  /** Kich hoat trinh duyet luu Blob thanh file. */
  saveBlobAsFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
