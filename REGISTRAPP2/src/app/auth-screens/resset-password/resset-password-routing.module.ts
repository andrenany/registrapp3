import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RessetPasswordPage } from './resset-password.page';

const routes: Routes = [
  {
    path: '',
    component: RessetPasswordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RessetPasswordPageRoutingModule {}
