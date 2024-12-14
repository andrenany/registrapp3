import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { EstadoService } from 'src/app/services/estado.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  ionicForm!: FormGroup;

  // email:any
  // password:any
  // contact:any
  constructor(private toastController: ToastController,private loadingController: LoadingController,
    private authService:AuthService,private router: Router, 
    public alertController: AlertController,public formBuilder: FormBuilder,private estadoService: EstadoService,) { 
    // Constructor de la clase. Aquí se inyectan las dependencias:
    // - toastController: Muestra mensajes emergentes (toast).
    // - loadingController: Muestra un indicador de carga mientras se realiza una operación.
    // - authService: Servicio personalizado para la autenticación.
    // - router: Permite la navegación entre páginas.
    // - formBuilder: Facilita la creación de formularios reactivos.
  }


  //aca incia para validar e inciar sesion NO TOCAR
  ngOnInit() {
    this.ionicForm = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$'),
        ],
      ],
      password: ['', [
        // Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}'),
        Validators.required,
      ]
      ],
    });
  }

  async login() {
    const loading = await this.loadingController.create(); // Crea el indicador de carga.
    await loading.present(); // Muestra el indicador de carga.
  
    try {
      if (this.ionicForm.valid) {
        // Verifica si el formulario es válido.
        console.log('Formulario válido, procesando inicio de sesión...');
  
        const user = await this.authService.loginUser(
          this.ionicForm.value.email,
          this.ionicForm.value.password
        );
  
        if (user) {
          // Si el inicio de sesión es exitoso.
          console.log('Inicio de sesión exitoso, redirigiendo...');
          this.router.navigate(['/home']); // Redirige al usuario a la página principal.
        } else {
          // Si el inicio de sesión falla.
          await this.showToast('Error al iniciar sesión: Usuario o contraseña incorrecto.');
        }
      } else {
        // Si el formulario no es válido.
        console.error('Formulario inválido. Por favor, completa todos los campos requeridos.');
        await this.showToast('Por favor, completa todos los campos requeridos.');
      }
    } catch (err) {
      // Manejo de cualquier error inesperado.
      console.error('Error al iniciar sesión:', err);
      await this.showToast('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      // Asegura que el indicador de carga se oculta.
      if (loading) {
        await loading.dismiss();
      }
    }
  }
  
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
    });
    await toast.present();
  }
  
  get errorControl() {
    // Devuelve los controles del formulario para facilitar el acceso a ellos en la plantilla.
    return this.ionicForm.controls;
  }
  
  async presentToast(message: string) {
    // Método que muestra un mensaje emergente (toast) en la parte superior de la pantalla.
    console.log('Mostrando mensaje de error:', message);
  
    const toast = await this.toastController.create({
      message: message,
      duration: 1700,
      position: 'middle',
    });
  
    await toast.present();
  }
  //ACA TERMINA

  //aca inicio otras funcionalidades 
    // Función para navegar hacia la página de registro (interacción de navegación en la UI)
    navigateToregistro() {
      this.router.navigate(['/signup']);
      this.estadoService.reiniciar();
    }

    //funcion para inciar sesion con ggogle
    //pa iniciar cpn ggogle
    async loginWithGoogle() {
      try {
        const user = await this.authService.loginWithGoogle();
        if (user) {
          console.log('Inicio de sesión exitoso:', user);
          // Redirigir o realizar alguna acción después del inicio de sesión
          // Si el inicio de sesión es exitoso.
          console.log('Inicio de sesión exitoso, redirigiendo...');
          this.router.navigate(['/home']); // Redirige al usuario a la página principal.
        }
      } catch (error) {
        console.error('Error durante el inicio de sesión:', error);
      }
    }
    

}
