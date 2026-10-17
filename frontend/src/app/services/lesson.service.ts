import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lesson, CreateLessonRequest } from '../models/models';
import { VideoSuggestion } from './video.service';
import { environment } from '../../environments/environment';

/** Yeu cau nho AI sinh bai hoc. Chi tieu de la bat buoc. */
export interface AiLessonRequest {
  title: string;
  difficulty?: string;
  topic?: string;
}

/** Bai hoc do AI sinh ra kem video, CHUA luu vao co so du lieu. */
export interface AiLessonResponse {
  title: string;
  content: string;
  topic: string;
  difficulty: string;
  videos: VideoSuggestion[];
}

@Injectable({ providedIn: 'root' })
export class LessonService {
  private apiUrl = `${environment.apiUrl}/lessons`;

  constructor(private http: HttpClient) {}

  getAll(title?: string): Observable<Lesson[]> {
    const params = title ? `?title=${encodeURIComponent(title)}` : '';
    return this.http.get<Lesson[]>(`${this.apiUrl}${params}`);
  }

  getById(id: number): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.apiUrl}/${id}`);
  }

  getByTopic(topic: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.apiUrl}/topic/${topic}`);
  }

  getByDifficulty(difficulty: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.apiUrl}/difficulty/${difficulty}`);
  }

  create(request: CreateLessonRequest): Observable<Lesson> {
    return this.http.post<Lesson>(this.apiUrl, request);
  }

  update(id: number, request: CreateLessonRequest): Observable<Lesson> {
    return this.http.put<Lesson>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Nho AI sinh bai hoc tu tieu de. Ket qua CHUA duoc luu vao co so du lieu,
   * muon luu thi goi tiep create() voi noi dung nhan duoc.
   */
  generateWithAi(request: AiLessonRequest): Observable<AiLessonResponse> {
    return this.http.post<AiLessonResponse>(
      `${environment.apiUrl}/ai/generate-lesson`,
      request
    );
  }
}
