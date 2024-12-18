import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Tarea } from '../tarea.model';

@Injectable({
  providedIn: 'root'
})
export class TareasService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) { 
    this.init();
  }

  // Inicializa el almacenamiento
  async init() {
    if (!this._storage) {
      this._storage = await this.storage.create();
    }
  }

  // Agregar tarea
  async agregarTarea(tarea: Tarea): Promise<void> {
    const tareas = await this.obtenerTareas();
    tareas.push(tarea);
    await this._storage?.set('tareas', tareas);
  }

  // Obtener todas las tareas
  async obtenerTareas(): Promise<Tarea[]> {
    return (await this._storage?.get('tareas')) || [];
  }

  // Eliminar tarea
  async eliminarTarea(index: number): Promise<void> {
    const tareas = await this.obtenerTareas();
    tareas.splice(index, 1);
    await this._storage?.set('tareas', tareas);
  }
}
