import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Molecule, CreateMoleculeRequest } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MoleculeService {
  private apiUrl = `${environment.apiUrl}/molecules`;

  constructor(private http: HttpClient) {}

  getAll(name?: string): Observable<Molecule[]> {
    const params = name ? `?name=${encodeURIComponent(name)}` : '';
    return this.http.get<Molecule[]>(`${this.apiUrl}${params}`);
  }

  getById(id: number): Observable<Molecule> {
    return this.http.get<Molecule>(`${this.apiUrl}/${id}`);
  }

  getByFormula(formula: string): Observable<Molecule> {
    return this.http.get<Molecule>(`${this.apiUrl}/formula/${formula}`);
  }

  create(request: CreateMoleculeRequest): Observable<Molecule> {
    return this.http.post<Molecule>(this.apiUrl, request);
  }

  update(id: number, request: CreateMoleculeRequest): Observable<Molecule> {
    return this.http.put<Molecule>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
