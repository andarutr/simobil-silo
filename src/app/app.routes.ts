import { Routes } from '@angular/router';
import { HomeComponent } from './layouts/home/home.component';
import { ScanMobilComponent } from './layouts/scan-mobil/scan-mobil.component';
import { DetailComponent } from './layouts/detail/detail.component';
import { LoginNikComponent } from './layouts/login-nik/login-nik.component';
import { TransaksiComponent } from './layouts/transaksi/transaksi.component';
import { TransaksiPulangComponent } from './layouts/transaksi-pulang/transaksi-pulang.component';
import { GohomeComponent } from './layouts/gohome/gohome.component';

export const routes: Routes = [
    { path: 'login', component: LoginNikComponent },
    { path: 'home', component: HomeComponent }, 
    { path: 'scan-mobil', component: ScanMobilComponent }, 
    { path: 'detail', component: DetailComponent }, 
    { path: 'transaksi', component: TransaksiComponent }, 
    { path: 'transaksi-pulang', component: TransaksiPulangComponent }, 
    { path: 'gohome', component: GohomeComponent }, 
];
