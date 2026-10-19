import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AiQuestionRequest, Question } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AiQuestionService {
  private apiUrl = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  generateQuestions(request: AiQuestionRequest): Observable<Question[]> {
    return this.http.post<Question[]>(`${this.apiUrl}/generate-questions`, request);
  }
}
