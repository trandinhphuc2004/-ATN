import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reaction } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReactionService {
  private apiUrl = `${environment.apiUrl}/reactions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Reaction[]> {
    return this.http.get<Reaction[]>(this.apiUrl);
  }

  getById(id: number): Observable<Reaction> {
    return this.http.get<Reaction>(`${this.apiUrl}/${id}`);
  }

  getByType(type: string): Observable<Reaction[]> {
    return this.http.get<Reaction[]>(`${this.apiUrl}/type/${type}`);
  }
}
