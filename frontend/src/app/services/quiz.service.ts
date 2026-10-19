import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question, QuizResult, QuizSubmission, CreateQuestionRequest } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private apiUrl = `${environment.apiUrl}/quiz`;

  constructor(private http: HttpClient) {}

  getQuestions(topic?: string): Observable<Question[]> {
    const params = topic ? `?topic=${topic}` : '';
    return this.http.get<Question[]>(`${this.apiUrl}/questions${params}`);
  }

  createQuestion(request: CreateQuestionRequest): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/questions`, request);
  }

  deleteQuestion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/questions/${id}`);
  }

  submitQuiz(submission: QuizSubmission): Observable<QuizResult> {
    return this.http.post<QuizResult>(`${this.apiUrl}/submit`, submission);
  }

  getResults(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/results`);
  }
}
