import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RessetPasswordPageRoutingModule } from './resset-password-routing.module';

import { RessetPasswordPage } from './resset-password.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RessetPasswordPageRoutingModule
  ],
  declarations: [RessetPasswordPage]
})
export class RessetPasswordPageModule {}
