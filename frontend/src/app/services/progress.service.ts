import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dashboard } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private apiUrl = `${environment.apiUrl}/progress`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.apiUrl}/dashboard`);
  }

  markLessonCompleted(lessonId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/lessons/${lessonId}/complete`, {});
  }

  recordStudySession(activityType: string, referenceId: number | null, durationMinutes: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/study-session`, {
      activityType, referenceId, durationMinutes
    });
  }
}
