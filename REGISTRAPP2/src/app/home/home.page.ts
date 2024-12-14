import { Component, OnInit  } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertController, LoadingController, ToastController, AnimationController } from '@ionic/angular';
import { EstadoService } from 'src/app/services/estado.service';
import { Storage } from '@ionic/storage-angular';
import { QrService } from '../services/qr.service';
import { ChangeDetectorRef } from '@angular/core';
import { TareasService } from '../services/tarea.service';
import { Tarea } from '../tarea.model';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  scanCount: number = 0; // Contador de asistencias escaneadas
  email: any;
  userEmail: string = ''; // Agregado para el template
  formulario: FormGroup = this.formBuilder.group({
    campo1: ['', Validators.required],
    campo2: ['', Validators.required],
  });
  showCalendar: boolean = false;
  contador: number = 0;
  fechaActual: Date = new Date();
  notificacionesPendientes: number = 2;
 

  asisTotales: number = 10; // Total de asistencias necesarias
  asisRegistradas: number = 0; // Asistencias registradas
  progreso: number = 0; // Progreso como porcentaje
  
  // Agregado: lista de reuniones que se almacenarán en localStorage
  reuniones: any[] = [];
  nuevaReunion = { titulo: '', hora: '', ubicacion: '', tipo: '' }; // Modelo para nueva reunión

  constructor(
    public authService: AuthService,
    public qr: QrService,  // Hacemos pública la propiedad
    private storage: Storage,
    private toastController: ToastController,
    private router: Router,
    private animationCtrl: AnimationController,
    private estadoService: EstadoService,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef,
    private loadingController: LoadingController,
    private formBuilder: FormBuilder,
    private tareasService: TareasService
  ) { }

  async ngOnInit() {
    this.cargarTareasCercanas();
    this.authService.getProfile()
      .then(user => {
        this.email = user?.email;
        this.userEmail = user?.email || '';
        console.log(user?.email);
      })
      .catch(error => {
        console.error('Error getting user profile:', error);
      });

    await this.cargarReuniones();

    this.estadoService.contadorActual.subscribe((contador) => {
      this.scanCount = contador;
    });
  }

  async cargarReuniones() {
    this.reuniones = await this.storage.get('reuniones') || [];
    console.log('Reuniones cargadas:', this.reuniones);
  }

  async agregarReunion() {
    if (!this.nuevaReunion.titulo || !this.nuevaReunion.hora || !this.nuevaReunion.ubicacion || !this.nuevaReunion.tipo) {
      alert('Por favor completa todos los campos.');
      return;
    }
    this.reuniones.push({ ...this.nuevaReunion });
    await this.storage.set('reuniones', this.reuniones);
    this.nuevaReunion = { titulo: '', hora: '', ubicacion: '', tipo: '' };
    await this.cargarReuniones();
    alert('Reunión guardada exitosamente.');
  }

  async eliminarReunion(reunion: any) {
    this.reuniones = this.reuniones.filter(r => r !== reunion);
    await this.storage.set('reuniones', this.reuniones);
    await this.cargarReuniones();
    alert('Reunión eliminada exitosamente.');
  }

  signOut() {
    this.authService.signOut().then(() => {
      this.router.navigate(['/landing']);
    });
  }

  navigateToAgenda() {
    this.router.navigate(['/agenda']);
  }

  async Scaneo() {
    try {
      const qrData = await this.qr.StarScan();
      if (!qrData) {
        throw new Error('El escaneo no retornó datos. Intente nuevamente.');
      }
      const attendanceData = JSON.parse(qrData);
      const { meetingId, userId } = attendanceData;

      if (!meetingId || !userId) {
        throw new Error('Datos del QR incompletos.');
      }

      const asistencia = {
        meetingId,
        userId,
        timestamp: new Date().toISOString(),
      };

      const asistenciasGuardadas = (await this.storage.get('asistencias')) || [];
      asistenciasGuardadas.push(asistencia);
      await this.storage.set('asistencias', asistenciasGuardadas);

      this.asisRegistradas = asistenciasGuardadas.length;
      this.actualizarProgreso();

      const alert = await this.alertController.create({
        header: 'Éxito',
        message: '¡Asistencia registrada correctamente!',
        buttons: ['Aceptar'],
      });
      await alert.present();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'No se pudo registrar la asistencia. Verifica el código QR e inténtalo nuevamente.';
      const alert = await this.alertController.create({
        header: 'Error',
        message: errorMessage,
        buttons: ['Aceptar'],
      });
      await alert.present();
    }
  }

  actualizarProgreso() {
    this.progreso = (this.asisRegistradas / this.asisTotales) * 100;
    if (this.progreso > 100) {
      this.progreso = 100;
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
 

  async cargarTareasCercanas() {
    try {
      console.log('Iniciando la carga de tareas cercanas...');
  
      // Obtener todas las tareas del servicio
      const todasTareas = await this.tareasService.obtenerTareas();
      console.log('Todas las tareas obtenidas:', todasTareas);
  
      // Filtrar, ordenar por fecha, y tomar las 3 más cercanas
      this.tareasCercanas = todasTareas
        .filter(tarea => {
          const esFutura = new Date(tarea.dia) >= new Date();
          console.log(`Evaluando tarea: ${tarea.descripcion}, Fecha: ${tarea.dia}, ¿Es futura? ${esFutura}`);
          return esFutura; // Solo tareas futuras o de hoy
        })
        .sort((a, b) => {
          const diferencia = new Date(a.dia).getTime() - new Date(b.dia).getTime();
          console.log(`Comparando fechas: ${a.dia} y ${b.dia}, Diferencia: ${diferencia}`);
          return diferencia; // Ordenar por fecha
        })
        .slice(0, 3); // Tomar las 3 primeras
  
      console.log('Tareas cercanas cargadas:', this.tareasCercanas);
    } catch (error) {
      console.error('Error al cargar tareas cercanas:', error);
    }
  }
  
}
