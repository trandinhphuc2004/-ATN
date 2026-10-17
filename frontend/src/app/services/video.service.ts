import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/** Mot video YouTube goi y, khop voi VideoDto ben backend. */
export interface VideoSuggestion {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class VideoService {
  private apiUrl = `${environment.apiUrl}/videos`;

  /**
   * Ket qua kiem tra tinh nang co bat hay khong. shareReplay(1) de nhieu component
   * cung goi ma chi phat sinh mot request duy nhat cho ca phien lam viec.
   */
  private enabled$?: Observable<boolean>;

  constructor(private http: HttpClient) {}

  /** Backend da cau hinh YouTube API key chua. */
  isEnabled(): Observable<boolean> {
    if (!this.enabled$) {
      this.enabled$ = this.http
        .get<{ enabled: boolean }>(`${this.apiUrl}/status`)
        .pipe(
          map(res => res.enabled),
          // Loi mang hoac backend chua co endpoint -> coi nhu tat, khong lam vo trang.
          catchError(() => of(false)),
          shareReplay(1)
        );
    }
    return this.enabled$;
  }

  /** Video goi y cho mot bai hoc. */
  getForLesson(lessonId: number): Observable<VideoSuggestion[]> {
    return this.http
      .get<VideoSuggestion[]>(`${this.apiUrl}/lesson/${lessonId}`)
      .pipe(catchError(() => of([])));
  }

  /** Video goi y cho mot phan ung. */
  getForReaction(reactionId: number): Observable<VideoSuggestion[]> {
    return this.http
      .get<VideoSuggestion[]>(`${this.apiUrl}/reaction/${reactionId}`)
      .pipe(catchError(() => of([])));
  }

  /** Tim video theo tu khoa tuy y, dung cho noi dung AI vua tao chua co id. */
  search(keyword: string): Observable<VideoSuggestion[]> {
    const q = encodeURIComponent(keyword);
    return this.http
      .get<VideoSuggestion[]>(`${this.apiUrl}/search?q=${q}`)
      .pipe(catchError(() => of([])));
  }
}
