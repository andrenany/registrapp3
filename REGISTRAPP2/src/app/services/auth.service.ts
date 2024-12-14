import { Injectable } from '@angular/core';
import { AngularFireAuth, } from '@angular/fire/compat/auth';
import { GoogleAuthProvider, signInWithPopup, AuthErrorCodes, getAuth  } from 'firebase/auth';
import { User } from 'firebase/auth';
import { ToastController } from '@ionic/angular';
import { Observable} from 'rxjs';
import firebase from 'firebase/compat/app';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Platform } from '@ionic/angular';


import {
  CollectionReference,
  DocumentData,
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from '@firebase/firestore';
import { Firestore, collectionData, docData } from '@angular/fire/firestore';



export interface Users{
  name:string;
  email: string
} 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  
  
  constructor(
    private ngFireAuth: AngularFireAuth,
    private toastController: ToastController,
    private google: GooglePlus,
    private platform: Platform
  ) {}

  //registrar un usuario
  async registerUser(email: string, password: string, name: string) {
    return await this.ngFireAuth.createUserWithEmailAndPassword(email, password)

  }
  
  //loggear un usuario
  async loginUser(email: string, password: string) {
    return await this.ngFireAuth.signInWithEmailAndPassword(email, password);

  }

  //resetear contraseña
  async resetPassword(email: string) {
    return await this.ngFireAuth.sendPasswordResetEmail(email);

  }
  
  async getProfile():Promise <User | null> {
    return new Promise<User | null>((resolve, reject) => {
      this.ngFireAuth.onAuthStateChanged(user => {
        if (user) {
          resolve(user as User);
        } else {
          resolve(null);
        }
      }, reject);
    })
  }
//cerrar sesion
  async signOut() {
    return await this.ngFireAuth.signOut();
  }

  //este es pa los guards 
  isAuthenticated(): boolean {
    return !!this.ngFireAuth.currentUser; // Verifica si hay un usuario actual
  }

  //otro metodo para incir
   // Método combinado para iniciar sesión con Google
   async loginWithGoogle() {
    if (this.platform.is('cordova')) {
      // Plataforma nativa
      try {
        const result = await this.google.login({});
        const user_data_google = result;

        const credential = GoogleAuthProvider.credential(
          null,
          user_data_google.accessToken
        );
        return await this.ngFireAuth.signInWithCredential(credential);
      } catch (error) {
        console.error('Error al iniciar sesión con Google (nativo):', error);
        throw error;
      }
    } else {
      // Plataforma web
      try {
        const provider = new GoogleAuthProvider();
        const result = await this.ngFireAuth.signInWithPopup(provider);
        console.log('Usuario logueado con Google (web):', result.user);
        return result.user;
      } catch (error) {
        console.error('Error al iniciar sesión con Google (web):', error);
        throw error;
      }
    }
  }
// Método para iniciar sesión con Google 2
//async loginWithGoogle() {
//  try {
//    const result = await this.google.login({});
//    const user_data_google = result;

//    return await this.ngFireAuth.signInWithCredential(
 //     GoogleAuthProvider.credential(null, user_data_google.accessToken)
//    );
//  } catch (error) {
//    console.error('Error al iniciar sesión con Google:', error);
 //   throw error;
//  }
//}





// Método para mostrar toast de éxito o error
async presentToast(message: string) {
  const toast = await this.toastController.create({
    message: message,
    duration: 2000,
    position: 'top',
  });
  await toast.present();
}

// Método para iniciar sesión con Google
 // async signInWithGoogle() {
   // const provider = new GoogleAuthProvider();  // Usamos el proveedor de Google para autenticación
  //  try {
   //   const result = await this.ngFireAuth.signInWithPopup(provider);  // Usamos signInWithPopup de compatibilidad
    //  const user = result.user; // Aquí obtienes la información del usuario
     // console.log('Usuario logueado con Google:', user);
      
      // Mostrar mensaje de éxito
 //     this.presentToast('Inicio de sesión exitoso');
 //     return user;
 //   } catch (error) {
 //     console.error('Error al iniciar sesión con Google:', error);
 //     let errorMessage = 'Error desconocido';
      
 //     this.presentToast(`Error al iniciar sesión con Google: ${errorMessage}`);
 //     return null;
 //   }
 // }

}
