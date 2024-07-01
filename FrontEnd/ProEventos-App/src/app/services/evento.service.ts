import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Evento } from '../models/Evento';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable()

export class EventoService {

  baseUrl = ('https://localhost:5001/api/eventos');

  // o pipe(take(1)) desenscreve do observable

  constructor( private http : HttpClient ) { }

  public getEventos(): Observable<Evento[]> {
    return this.http
      .get<Evento[]>(this.baseUrl)
      .pipe(take(1));
  }

  public getEventosByTema(tema: string): Observable<Evento[]> {
    return this.http
      .get<Evento[]>(`${this.baseUrl}/${tema}/tema`)
      .pipe(take(1));
  }

  public getEventosById(id: number): Observable<Evento> {
    return this.http
      .get<Evento>(`${this.baseUrl}/${id}`)
      .pipe(take(1)); 
  }
  
  public post(evento: Evento): Observable<Evento> {
    return this.http
      .post<Evento>(this.baseUrl, evento)
      .pipe(take(1));
  }
  
  public put(evento: Evento): Observable<Evento> {
    return this.http
      .put<Evento>(`${this.baseUrl}/${evento.id}`, evento)
      .pipe(take(1));
  }

  public deleteEvento(id: number): Observable<any> {
    return this.http
      .delete<string>(`${this.baseUrl}/${id}`)
      .pipe(take(1));
  }
}
