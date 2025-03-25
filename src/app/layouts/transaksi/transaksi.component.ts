import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-transaksi',
  templateUrl: './transaksi.component.html',
  styleUrls: ['./transaksi.component.css']
})
export class TransaksiComponent {
  nik: string | null = null;
  nama: string | null = null;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.nik = params['nik'];
      this.nama = params['nama'];
    });
  }

  goBack() {
    this.router.navigate(['/home'], { queryParams: { nik: this.nik, nama: this.nama } });
  }
}