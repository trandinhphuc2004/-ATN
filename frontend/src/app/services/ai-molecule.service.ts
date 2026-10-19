import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Molecule, AiMoleculeRequest } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiMoleculeService {
  private apiUrl = `${environment.apiUrl}/ai/molecule`;

  constructor(private http: HttpClient) {}

  generateMolecule(query: string): Observable<Molecule> {
    const request: AiMoleculeRequest = { query };
    return this.http.post<Molecule>(`${this.apiUrl}/generate`, request);
  }
}
