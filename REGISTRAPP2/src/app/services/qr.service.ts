import { Injectable } from '@angular/core';
import {BarcodeScanner} from '@capacitor-community/barcode-scanner';

@Injectable({
  providedIn: 'root'
})
export class QrService {

  scan: boolean=false
  scanResult: any=  ""
  constructor() { }
  
  async checkPermission(){
    try{ 
      // check or request permission
      const status = await BarcodeScanner.checkPermission({ force: true });
    
      if (status.granted) {
        // the user granted permission
        return true;
      }
    
      return false;
    }catch(e){
      return undefined;
    }
  }

  async StarScan(): Promise<string | null> {
  if (!this.scan) {
    this.scan = true;
    try {
      const Permission = await this.checkPermission();
      if (!Permission) {
        alert("No hay permisos de cámara. Actívalos manualmente en la información de la aplicación");
        this.scan = false;
        return null; // Indica que no hay datos debido a permisos denegados
      } else {
        await BarcodeScanner.hideBackground();
        document.querySelector('body')?.classList.add('scanner-active');

        const result = await BarcodeScanner.startScan(); // Realiza el escaneo
        console.log("Resultado del escaneo:", result);

        BarcodeScanner.showBackground();
        document.querySelector('body')?.classList.remove('scanner-active');
        this.scan = false;

        if (result?.hasContent) {
          return result.content; // Devuelve el contenido escaneado
        } else {
          alert("El escaneo no encontró contenido válido.");
          return null;
        }
      }
    } catch (e) {
      console.error("Error durante el escaneo:", e);
      this.scan = false;
      return null;
    }
  } else {
    this.StopScan();
    return null;
  }
}

  async StopScan(){
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    document.querySelector('body')?.classList.remove('scanner-active');
    this.scan = false;
    this.scanResult = ""

  }
}
 

