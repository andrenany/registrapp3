import { TestBed } from '@angular/core/testing';
import { TareasService } from './tarea.service';
import { Storage } from '@ionic/storage-angular';
import { Tarea } from '../tarea.model';

class MockStorage {
  private tareas: Tarea[] = [];

  async create() {
    return this;
  }

  async get(key: string) {
    return key === 'tareas' ? this.tareas : null;
  }

  async set(key: string, value: Tarea[]) {
    if (key === 'tareas') {
      this.tareas = value;
    }
  }
}

describe('TareasService', () => {
  let service: TareasService;
  let storage: Storage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TareasService,
        { provide: Storage, useClass: MockStorage }
      ]
    });

    service = TestBed.inject(TareasService);
    storage = TestBed.inject(Storage);
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('debería agregar una tarea correctamente', async () => {
    const tarea: Tarea = { dia: new Date(), asignatura: 'Matemáticas', descripcion: 'Estudiar álgebra' };
    await service.agregarTarea(tarea);

    const tareas = await service.obtenerTareas();
    expect(tareas.length).toBe(1);
    expect(tareas[0]).toEqual(tarea);
  });

  it('debería eliminar una tarea correctamente', async () => {
    const tarea: Tarea = { dia: new Date(), asignatura: 'Matemáticas', descripcion: 'Estudiar álgebra' };
    await service.agregarTarea(tarea);
    await service.eliminarTarea(0);

    const tareas = await service.obtenerTareas();
    expect(tareas.length).toBe(0);
  });
});
