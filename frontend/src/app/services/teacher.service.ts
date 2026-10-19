import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ClassRoom, TeacherDashboard } from '../models/models';

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private apiUrl = `${environment.apiUrl}/teacher`;

  constructor(private http: HttpClient) {}

  /** Lop giao vien duoc phan cong (admin: moi lop). */
  getMyClasses(): Observable<ClassRoom[]> {
    return this.http.get<ClassRoom[]>(`${this.apiUrl}/classes`);
  }

  getClassDashboard(classId: number): Observable<TeacherDashboard> {
    return this.http.get<TeacherDashboard>(`${this.apiUrl}/classes/${classId}/dashboard`);
  }
}
