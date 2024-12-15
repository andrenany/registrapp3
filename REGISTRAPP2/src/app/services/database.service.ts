import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

interface Asistencia {
  eventoId: string;
  usuarioEmail: string;
  nombreEvento?: string;
  tipoEvento?: string;
  fecha: string;
  fechaRegistro?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  constructor(private firestore: AngularFirestore) {}

  async getTotalAsistenciasEsperadas(): Promise<number> {
    const eventos = await this.firestore.collection('eventos').get().toPromise();
    return eventos?.size || 0;
  }

  async getAsistenciasRegistradas(): Promise<number> {
    const email = localStorage.getItem('email');
    const asistencias = await this.firestore
      .collection('asistencias', (ref) => ref.where('usuarioEmail', '==', email))
      .get()
      .toPromise();
    return asistencias?.size || 0;
  }

  async verificarAsistenciaExistente(eventoId: string, email: string): Promise<boolean> {
    const asistencia = await this.firestore
      .collection('asistencias', (ref) =>
        ref.where('eventoId', '==', eventoId).where('usuarioEmail', '==', email)
      )
      .get()
      .toPromise();
    return !!asistencia?.size;
  }

  async registrarAsistencia(asistenciaData: Asistencia): Promise<void> {
    try {
      // Registrar la asistencia
      await this.firestore.collection('asistencias').add({
        ...asistenciaData,
        fechaRegistro: new Date().toISOString(),
      });

      // Actualizar el contador de asistencias del evento
      const eventoRef = this.firestore.collection('eventos').doc(asistenciaData.eventoId);
      const eventoDoc = await eventoRef.get().toPromise();

      if (eventoDoc?.exists) {
        const datos = eventoDoc.data() as { asistenciasRegistradas?: number };
        const asistenciasActuales = datos?.asistenciasRegistradas || 0;

        await eventoRef.update({
          asistenciasRegistradas: asistenciasActuales + 1,
        });
      }
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      throw error;
    }
  }

  async getDetallesEvento(eventoId: string): Promise<any> {
    try {
      const eventoDoc = await this.firestore
        .collection('eventos')
        .doc(eventoId)
        .get()
        .toPromise();

      if (!eventoDoc?.exists) {
        return null;
      }

      const data = eventoDoc.data();
      return data && typeof data === 'object'
        ? { id: eventoDoc.id, ...data }
        : { id: eventoDoc.id };
    } catch (error) {
      console.error('Error al obtener detalles del evento:', error);
      throw error;
    }
  }

  async getEstadisticasAsistencia(eventoId: string): Promise<any> {
    try {
      const asistenciasSnapshot = await this.firestore
        .collection('asistencias')
        .ref.where('eventoId', '==', eventoId)
        .get();

      const asistencias = asistenciasSnapshot.docs.map((doc) => {
        const data = doc.data();
        return data && typeof data === 'object' ? { id: doc.id, ...data } : { id: doc.id };
      });

      return {
        totalAsistentes: asistenciasSnapshot.size,
        asistencias: asistencias,
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  async getHistorialAsistencias(email: string): Promise<any[]> {
    try {
      const asistenciasSnapshot = await this.firestore
        .collection('asistencias')
        .ref.where('usuarioEmail', '==', email)
        .orderBy('fechaRegistro', 'desc')
        .get();

      return asistenciasSnapshot.docs.map((doc) => {
        const data = doc.data();
        return data && typeof data === 'object'
          ? { id: doc.id, ...data }
          : { id: doc.id };
      });
    } catch (error) {
      console.error('Error al obtener historial:', error);
      throw error;
    }
  }
}
