import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgendaPage } from './agenda.page';
import { TareasService } from '../services/tarea.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { of } from 'rxjs';

// Simulando el servicio de tareas
class MockTareasService {
  obtenerTareas() {
    return of([
      { dia: new Date(), asignatura: 'Matemáticas', descripcion: 'Repaso de ecuaciones' }
    ]);
  }

  agregarTarea(tarea: any) {
    return of(tarea);
  }

  eliminarTarea(index: number) {
    return of(true);
  }
}

// Simulando el AlertController
class MockAlertController {
  create() {
    return {
      present: jasmine.createSpy('present'),
    };
  }
}

// Simulando el Router
class MockRouter {
  navigate(path: string[]) {}
}

describe('AgendaPage', () => {
  let component: AgendaPage;
  let fixture: ComponentFixture<AgendaPage>;
  let tareasService: TareasService;
  let alertController: AlertController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgendaPage],
      providers: [
        { provide: TareasService, useClass: MockTareasService },
        { provide: AlertController, useClass: MockAlertController },
        { provide: Router, useClass: MockRouter },
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(AgendaPage);
    component = fixture.componentInstance;
    tareasService = TestBed.inject(TareasService);
    alertController = TestBed.inject(AlertController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar las tareas al iniciar el componente', async () => {
    // Espiamos el método obtenerTareas para verificar que se llame
    spyOn(tareasService, 'obtenerTareas').and.returnValue(Promise.resolve([{ dia: new Date(), asignatura: 'Matemáticas', descripcion: 'Resolver ejercicios' }]));
  
    // Llamamos al método ngOnInit
    await component.ngOnInit();
  
    // Verificamos que se haya llamado a obtenerTareas
    expect(tareasService.obtenerTareas).toHaveBeenCalled();
  
    // Verificamos que las tareas no estén vacías
    expect(component.tareas.length).toBeGreaterThan(0);
    expect(component.tareas[0].asignatura).toBe('Matemáticas');
  });
  

  it('debería mostrar una alerta cuando falta un campo al agregar tarea', async () => {
    component.dia = '';
    component.asignatura = '';
    component.descripcion = '';
    
    spyOn(alertController, 'create').and.callThrough();
    await component.agregarTarea();
    
    expect(alertController.create).toHaveBeenCalled();
    expect(alertController.create).toHaveBeenCalledWith({
      header: 'Campos requeridos',
      message: 'Por favor, completa todos los campos.',
      buttons: ['OK']
    });
  });

  it('debería agregar una nueva tarea correctamente', async () => {
    component.dia = '2024-12-01';
    component.asignatura = 'Historia';
    component.descripcion = 'Estudio de la Revolución Francesa';
    
    spyOn(tareasService, 'agregarTarea').and.callThrough();
    spyOn(component, 'actualizarTareas').and.callThrough();
    await component.agregarTarea();
    
    expect(tareasService.agregarTarea).toHaveBeenCalled();
    expect(component.dia).toBe('');
    expect(component.asignatura).toBe('');
    expect(component.descripcion).toBe('');
    expect(component.actualizarTareas).toHaveBeenCalled();
  });

  it('debería eliminar una tarea correctamente', async () => {
    spyOn(tareasService, 'eliminarTarea').and.callThrough();
    spyOn(component, 'actualizarTareas').and.callThrough();
    await component.eliminarTarea(0);
    expect(tareasService.eliminarTarea).toHaveBeenCalled();
    expect(component.actualizarTareas).toHaveBeenCalled();
  });

  it('debería navegar a la página de inicio', () => {
    spyOn(router, 'navigate');
    component.navigateToHome();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });
});
