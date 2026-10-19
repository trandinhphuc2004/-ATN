import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { Reaction } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AiReactionService {
  private apiUrl = `${environment.apiUrl}/ai`;

  // Model AI lon (mistral-medium) tra ve cham (~80s). Timeout 180s khop voi backend
  // de spinner khong quay mai neu API treo, va bao loi ro rang cho nguoi dung.
  private readonly REQUEST_TIMEOUT_MS = 180_000;

  constructor(private http: HttpClient) {}

  generateReaction(query: string): Observable<Reaction> {
    return this.http.post<Reaction>(`${this.apiUrl}/generate-reaction`, { query }).pipe(
      timeout(this.REQUEST_TIMEOUT_MS),
      catchError((err) => {
        // TimeoutError khong co 'status'; loi HTTP co err.status.
        if (err?.name === 'TimeoutError') {
          return throwError(() => new Error('AI phan hoi qua lau (>180s). Vui long thu lai.'));
        }
        const reason = err?.error?.reason || err?.error?.error || err?.message || 'Loi khong xac dinh';
        return throwError(() => new Error('Khong tao duoc phan ung: ' + reason));
      })
    );
  }
}
