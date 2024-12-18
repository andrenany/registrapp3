import { Component, OnInit } from '@angular/core';
//importamos lo necesario import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
//de aca INICIA PARA QUE FUNCIONE EL INICIO DE SESION CON EL FIREBASE
  ionicForm!: FormGroup;
// Define un objeto FormGroup llamado ionicForm, que representa un formulario reactivo en Angular. 
 showTooltip: boolean = false; // Propiedad para mostrar/ocultar el tooltip

constructor(private toastController: ToastController,private loadingController: LoadingController,
  private authService:AuthService,private router: Router, public formBuilder: FormBuilder, private Alertcontroller: AlertController) { 

}

ngOnInit() {
  // Método que se ejecuta cuando el componente se inicializa.
  console.log('Inicializando el formulario reactivo...');

  // Define el formulario reactivo utilizando FormBuilder.
  this.ionicForm = this.formBuilder.group({
    fullname: ['',
      [Validators.required]
      // Campo fullname requerido.
    ],
    contact: ['',
      [
        Validators.required,
        Validators.pattern("^[0-9]*$"),
        Validators.minLength(8),
        // Campo contact requerido, solo números y mínimo -   dígitos.
      ]
    ],
    email: [
      '',
      [
        Validators.required,
        Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$'),
        // Campo email requerido con validación de patrón.
      ],
    ],
    password: ['', [
      Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-8])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}'),
      Validators.required,
      // Campo password requerido con validación para cumplir reglas de seguridad.
    ],
    ],
  });

  console.log('Formulario inicializado correctamente.');
}

get errorControl() {
  // Devuelve los controles del formulario para facilitar el acceso a ellos en la plantilla.
  return this.ionicForm.controls;
}

async signUP() {
  console.log('Intentando registrar al usuario...');

  const loading = await this.loadingController.create();
  await loading.present();
  // Muestra el indicador de carga.

  if (this.ionicForm.valid) {
    // Verifica si el formulario es válido.
    console.log('Formulario válido, procesando registro...');

    const user = await this.authService.registerUser(
      this.ionicForm.value.email,
      this.ionicForm.value.password,
      this.ionicForm.value.fullname
    ).catch((err: undefined) => {
      // Muestra el error si ocurre durante el registro.
      console.error('Error durante el registro:', err);
      this.presentToast('Error durante el registro: ' + err);
      loading.dismiss();
    });

    if (user) {
      // Si el registro es exitoso.
      console.log('Registro exitoso, redirigiendo a la página principal...');
      loading.dismiss();
      this.router.navigate(['/home']);
    }
  } else {
    // Si el formulario no es válido.
    console.error('Formulario inválido. Por favor, completa todos los campos requeridos.');
    this.presentToast('Por favor, completa todos los campos requeridos.');
    loading.dismiss();
  }
}

async presentToast(message: string) {
  // Método que muestra un mensaje emergente (toast).
  const toast = await this.toastController.create({
    message: message,
    duration: 1500,
    position: 'top',
  });

  await toast.present();
}


///ACA TERMINA POR FAVOR NO TOCAR QUE ESTA FUNCIONANDO
// Navega a la página de inicio de sesión
navigateToLogin() {
  this.router.navigate(['/login']);
}


}
