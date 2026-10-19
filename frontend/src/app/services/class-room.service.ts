import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClassRoom, ClassRoomRequest } from '../models/models';
import { environment } from '../../environments/environment';

/** Quan tri vien quan ly lop hoc: tao lop, gan hoc sinh, giao vien, bai hoc, bai kiem tra. */
@Injectable({ providedIn: 'root' })
export class ClassRoomService {
  private apiUrl = `${environment.apiUrl}/admin/classes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ClassRoom[]> {
    return this.http.get<ClassRoom[]>(this.apiUrl);
  }

  getById(id: number): Observable<ClassRoom> {
    return this.http.get<ClassRoom>(`${this.apiUrl}/${id}`);
  }

  create(request: ClassRoomRequest): Observable<ClassRoom> {
    return this.http.post<ClassRoom>(this.apiUrl, request);
  }

  update(id: number, request: ClassRoomRequest): Observable<ClassRoom> {
    return this.http.put<ClassRoom>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /** Dat lai toan bo danh sach thanh vien / noi dung cua lop theo danh sach id. */
  setMembers(id: number, kind: 'students' | 'teachers' | 'lessons' | 'exams', ids: number[]): Observable<ClassRoom> {
    return this.http.put<ClassRoom>(`${this.apiUrl}/${id}/${kind}`, { ids });
  }
}
