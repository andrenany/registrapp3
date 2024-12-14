import { Component, OnInit } from '@angular/core';
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
import { DatabaseService } from '../services/database.service';
import { AttendanceService } from '../services/attendance.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  // Propiedades necesarias para el template
  tareasCercanas: Tarea[] = [];
  scanCount: number = 0;
  email: any;
  userEmail: string = '';
  formulario: FormGroup;
  asisTotales: number = 10;
  asisRegistradas: number = 0;
  progreso: number = 0;
  reuniones: any[] = [];
  qr = {
    scan: false,
    scanResult: ''
  };

  constructor(
    public authService: AuthService,
    private qrService: QrService,
    private storage: Storage,
    private toastController: ToastController,
    private router: Router,
    private estadoService: EstadoService,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef,
    private loadingController: LoadingController,
    private formBuilder: FormBuilder,
    private tareasService: TareasService,
    private databaseService: DatabaseService,
    private attendanceService: AttendanceService
  ) {
    this.formulario = this.formBuilder.group({
      campo1: ['', Validators.required],
      campo2: ['', Validators.required],
    });
  }

  async ngOnInit() {
    await this.cargarTareasCercanas();
    try {
      const user = await this.authService.getProfile();
      this.email = user?.email;
      this.userEmail = user?.email || '';
      console.log('Email del usuario:', user?.email);
    } catch (error) {
      console.error('Error getting user profile:', error);
    }

    await this.cargarReuniones();
    await this.loadAsistencias();

    this.estadoService.contadorActual.subscribe((contador) => {
      this.scanCount = contador;
    });
  }

  async loadAsistencias() {
    const totalAsistencias = await this.databaseService.getTotalAsistenciasEsperadas();
    this.asisTotales = totalAsistencias;

    // Usar el nuevo servicio para obtener asistencias en tiempo real
    this.attendanceService.getAttendanceCount().subscribe(count => {
      this.asisRegistradas = count;
      this.actualizarProgreso();
      this.cdr.detectChanges(); // Asegurar que la UI se actualice
    });
  }

  actualizarProgreso() {
    this.progreso = this.asisTotales > 0 ? (this.asisRegistradas / this.asisTotales) : 0;
  }

  async cargarReuniones() {
    this.reuniones = await this.storage.get('reuniones') || [];
    console.log('Reuniones cargadas:', this.reuniones);
  }

  async Scaneo() {
    try {
      this.qr.scan = true;
      const qrData = await this.qrService.StarScan();
      if (!qrData) {
        throw new Error('El escaneo no retornó datos. Intente nuevamente.');
      }
      
      this.qr.scanResult = qrData;
      await this.procesarAsistencia(qrData);
      
    } catch (error) {
      console.error('Error en el escaneo:', error);
      await this.mostrarError('Error al escanear el código QR');
    } finally {
      this.qr.scan = false;
    }
  }

  async procesarAsistencia(qrContent: string) {
    try {
      const asistenciaData = JSON.parse(qrContent);
      
      // Verificar asistencia existente usando el nuevo servicio
      const yaRegistrada = await this.attendanceService.checkExistingAttendance(
        asistenciaData.eventoId,
        this.email
      );

      if (yaRegistrada) {
        await this.mostrarError('Ya registraste tu asistencia para este evento');
        return;
      }

      // Registrar la asistencia usando el nuevo servicio
      await this.attendanceService.registerAttendance({
        eventoId: asistenciaData.eventoId,
        nombreEvento: asistenciaData.nombreEvento,
        tipoEvento: asistenciaData.tipoEvento,
        usuarioEmail: this.email,
        fecha: new Date().toISOString()
      });

      // Actualizar contador y progreso
      this.scanCount++;
      await this.mostrarExito(`Asistencia registrada para: ${asistenciaData.nombreEvento}`);
      
      // Actualizar el progreso local
      await this.loadAsistencias();
        
    } catch (error) {
      console.error('Error al procesar asistencia:', error);
      await this.mostrarError('Error al registrar la asistencia');
    }
  }

  async mostrarExito(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'middle',
      color: 'success'
    });
    await toast.present();
  }

  async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  signOut() {
    this.authService.signOut().then(() => {
      this.router.navigate(['/landing']);
    });
  }

  navigateToAgenda() {
    this.router.navigate(['/agenda']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  async cargarTareasCercanas() {
    try {
      console.log('Iniciando la carga de tareas cercanas...');
      const todasTareas = await this.tareasService.obtenerTareas();
      console.log('Todas las tareas obtenidas:', todasTareas);

      this.tareasCercanas = todasTareas
        .filter(tarea => {
          const esFutura = new Date(tarea.dia) >= new Date();
          console.log(`Evaluando tarea: ${tarea.descripcion}, Fecha: ${tarea.dia}, ¿Es futura? ${esFutura}`);
          return esFutura;
        })
        .sort((a, b) => new Date(a.dia).getTime() - new Date(b.dia).getTime())
        .slice(0, 3);

      console.log('Tareas cercanas cargadas:', this.tareasCercanas);
    } catch (error) {
      console.error('Error al cargar tareas cercanas:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudieron cargar las tareas cercanas',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}