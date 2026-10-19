import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExamAiService {
  private apiUrl = `${environment.apiUrl}/exam-ai`;

  constructor(private http: HttpClient) {}

  analyzeExam(file: File): Observable<{ result: string, error?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ result: string, error?: string }>(`${this.apiUrl}/analyze`, formData);
  }
}
