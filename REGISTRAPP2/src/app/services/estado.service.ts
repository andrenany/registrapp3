import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadoService {

      ///contador inicializado en 0
private contador = new BehaviorSubject <number>(0);

//observa la variable para poder suscribir

contadorActual = this.contador.asObservable();
  constructor() { 

  }
  //metodos

//incrementar numerillo
incrementar(){
  this.contador.next(this.contador.value +1);
}

//disminuis numerillos
disminuir(){
  this.contador.next(this.contador.value -1);

}
//reiniciar el contador en 0
reiniciar(){
this.contador.next(0);
}
}
