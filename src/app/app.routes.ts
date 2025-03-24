import { Routes } from '@angular/router';
import { HomeComponent } from './layouts/home/home.component';
import { DetailComponent } from './layouts/detail/detail.component';
import { LoginNikComponent } from './layouts/login-nik/login-nik.component';
import { TransaksiComponent } from './layouts/transaksi/transaksi.component';

export const routes: Routes = [
    { path: '', component: LoginNikComponent },
    { path: 'home', component: HomeComponent }, 
    { path: 'detail', component: DetailComponent }, 
    { path: 'transaksi', component: TransaksiComponent }, 
];
