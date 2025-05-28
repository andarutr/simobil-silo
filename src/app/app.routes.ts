import { Routes } from '@angular/router';
import { HomeComponent } from './layouts/home/home.component';
import { ScanMobilComponent } from './layouts/scan-mobil/scan-mobil.component';
import { DetailComponent } from './layouts/detail/detail.component';
import { LoginNikComponent } from './layouts/login-nik/login-nik.component';
import { LoginAdminComponent } from './layouts/login-admin/login-admin.component';
import { TransaksiAdminComponent } from './layouts/transaksi-admin/transaksi-admin.component';
import { TransaksiComponent } from './layouts/transaksi/transaksi.component';
import { TransaksiPulangComponent } from './layouts/transaksi-pulang/transaksi-pulang.component';
import { ThanksComponent } from './layouts/thanks/thanks.component';
import { GohomeComponent } from './layouts/gohome/gohome.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginNikComponent },
    { path: 'login-admin', component: LoginAdminComponent },
    { path: 'transaksi-admin', component: TransaksiAdminComponent },
    { path: 'home', component: HomeComponent }, 
    { path: 'scan-mobil', component: ScanMobilComponent }, 
    { path: 'detail', component: DetailComponent }, 
    { path: 'transaksi', component: TransaksiComponent }, 
    { path: 'transaksi-pulang', component: TransaksiPulangComponent }, 
    { path: 'thanks', component: ThanksComponent }, 
    { path: 'gohome', component: GohomeComponent }, 
];
