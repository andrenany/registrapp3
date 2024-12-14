import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  constructor(private firestore: AngularFirestore) {}

  // Obtener número de asistencias
  getAttendanceCount(): Observable<number> {
    return this.firestore.collection('asistencias')
      .snapshotChanges()
      .pipe(
        map(actions => actions.length)
      );
  }

  // Registrar una nueva asistencia
  async registerAttendance(eventData: any) {
    try {
      await this.firestore.collection('asistencias').add({
        ...eventData,
        timestamp: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      throw error;
    }
  }

  // Verificar si ya existe una asistencia
  async checkExistingAttendance(eventoId: string, email: string): Promise<boolean> {
    const asistencias = await this.firestore.collection('asistencias', ref => 
      ref.where('eventoId', '==', eventoId)
         .where('usuarioEmail', '==', email)
    ).get().toPromise();

    return !asistencias?.empty;
  }
}