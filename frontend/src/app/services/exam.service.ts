import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Exam,
  CreateExamRequest,
  ExamSubmissionRequest,
  ExamResult,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ExamService {
  private apiUrl = `${environment.apiUrl}/exams`;

  constructor(private http: HttpClient) {}

  createExam(request: CreateExamRequest): Observable<Exam> {
    return this.http.post<Exam>(this.apiUrl, request);
  }

  getMyExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.apiUrl}/my`);
  }

  /** Chi admin: moi de thi (ke ca de dang dong) de gan vao lop. */
  getAllExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.apiUrl}/all`);
  }

  getActiveExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.apiUrl}/active`);
  }

  getExamForTaking(examId: number): Observable<Exam> {
    return this.http.get<Exam>(`${this.apiUrl}/${examId}/take`);
  }

  submitExam(request: ExamSubmissionRequest): Observable<ExamResult> {
    return this.http.post<ExamResult>(`${this.apiUrl}/submit`, request);
  }

  /** Xem lai bai thi da nop de chua bai. */
  reviewSubmission(examId: number): Observable<ExamResult> {
    return this.http.get<ExamResult>(`${this.apiUrl}/${examId}/review`);
  }

  toggleExam(examId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${examId}/toggle`, {});
  }

  deleteExam(examId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${examId}`);
  }
}
