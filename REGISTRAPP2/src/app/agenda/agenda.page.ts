import { Component, OnInit } from '@angular/core';
import { TareasService } from '../services/tarea.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Tarea } from '../tarea.model';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
})
export class AgendaPage implements OnInit {
  tareas: Tarea[] = [];
  dia: string = '';
  asignatura: string = '';
  descripcion: string = '';

  constructor(
    private tareasService: TareasService,
    private alertController: AlertController,  // Se mantiene como private
    private router: Router
  ) {}

  ngOnInit() {
    this.actualizarTareas();
  }

  async actualizarTareas() {
    this.tareas = await this.tareasService.obtenerTareas();
  }

  // Agregar tarea
  async agregarTarea() {
    if (!this.dia || !this.asignatura || !this.descripcion) {
      // Mostrar alerta si falta algún campo
      const alert = await this.alertController.create({
        header: 'Campos requeridos',
        message: 'Por favor, completa todos los campos.',
        buttons: ['OK']
      });
      await alert.present();
      return; // No continuar con el proceso si hay campos vacíos
    }

    // Crear la nueva tarea
    const nuevaTarea: Tarea = {
      dia: new Date(this.dia),
      asignatura: this.asignatura,
      descripcion: this.descripcion
    };

    // Agregar la tarea
    await this.tareasService.agregarTarea(nuevaTarea);

    // Limpiar los campos después de agregar la tarea
    this.dia = '';
    this.asignatura = '';
    this.descripcion = '';

    // Actualizar la lista de tareas
    await this.actualizarTareas();
  }

  // Eliminar tarea
  async eliminarTarea(index: number) {
    await this.tareasService.eliminarTarea(index);
    await this.actualizarTareas();
  }

  // Navegar a la página de inicio
  navigateToHome() {
    this.router.navigate(['/home']);
  }

}
