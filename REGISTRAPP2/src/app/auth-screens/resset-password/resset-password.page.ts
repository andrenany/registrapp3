import { Component, OnInit } from '@angular/core'; // Importa el decorador Component y la interfaz OnInit
import { AuthService } from 'src/app/services/auth.service'; // Importa el servicio de autenticación
import { ToastController } from '@ionic/angular'; // Importa el controlador de toast de Ionic
import { Router } from '@angular/router'; // Importa el enrutador para la navegación

@Component({
  selector: 'app-resset-password', // Define el selector para usar el componente en HTML
  templateUrl: './resset-password.page.html', // Ruta al archivo HTML del componente
  styleUrls: ['./resset-password.page.scss'], // Rutas a los archivos CSS/SCSS del componente
})
export class RessetPasswordPage implements OnInit { // Define la clase del componente y que implementa OnInit

  email: any; // Propiedad para almacenar el correo electrónico ingresado por el usuario

  constructor(private authService: AuthService, private toastController: ToastController, private router: Router) { } // Constructor que inyecta dependencias

  ngOnInit() { // Método que se ejecuta al inicializar el componente
  }

  reset() { // Método para manejar el restablecimiento de contraseña
    this.authService.resetPassword(this.email).then(() => { // Llama al método de restablecimiento de contraseña
      console.log('sent'); // Muestra un mensaje en la consola como confirmación
      this.presentToast(); // Llama al método para mostrar un mensaje emergente
    });
  }

  async presentToast() { // Método para mostrar un mensaje emergente (toast)
    const toast = await this.toastController.create({ // Crea un nuevo toast
      message: 'Your reset password link has been sent on your email', // Mensaje del toast
      duration: 2000, // Duración del toast en milisegundos
      position: 'bottom' // Posición del toast (top, bottom, middle)
    });
  
    toast.present(); // Muestra el toast
    toast.onDidDismiss().then(() => { // Configura un callback cuando el toast se cierre
      this.router.navigate(['/login']); // Redirige al usuario a la página de inicio de sesión
    });
  }

}

