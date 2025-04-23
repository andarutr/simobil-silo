import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Database, ref, get, push, set } from '@angular/fire/database';
import { registerLocaleData } from '@angular/common'; 
import localeId from '@angular/common/locales/id'; // Import Indonesian locale
import { LOCALE_ID } from '@angular/core'; // Import LOCALE_ID from @angular/core
import Swal from 'sweetalert2';
import { Html5Qrcode } from 'html5-qrcode';

@Component({
  selector: 'app-scan-mobil',
  imports: [],
  templateUrl: './scan-mobil.component.html',
  styleUrl: './scan-mobil.component.css'
})
export class ScanMobilComponent {
  nik: string | null = null;
  nama: string | null = null; 
  lokasiTerdekat: string | null = null;

  isScanning: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private database: Database) {
    registerLocaleData(localeId);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.nik = params['nik'];
      this.nama = params['nama'];
    });
  }

  openQRScanner(lokasiTerdekat: string): void {
    if (!lokasiTerdekat) {
      Swal.fire({
        title: 'Error',
        text: 'Lokasi terdekat harus diisi!',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.isScanning = true;

    Swal.fire({
      title: 'Scan QR Code',
      html: `
        <div id="qr-reader" style="width: 100%; height: 300px;"></div>
        <p class="mt-3">Arahkan kamera ke QR Code mobil.</p>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Batal',
      allowOutsideClick: false,
      didOpen: () => {
        const html5QrCode = new Html5Qrcode('qr-reader');
        let isErrorShown = false;

        html5QrCode.start(
          { facingMode: 'user' }, // Gunakan kamera depan
          {
            fps: 10, // Frame rate
            qrbox: { width: 250, height: 250 } // Area pemindaian
          },
          async (decodedText: string) => {
            try {
              // Cari truck berdasarkan variant
              const truckRef = ref(this.database, 'sms_truck');
              const truckSnapshot = await get(truckRef);
              let truckStatus = false;
              let truckId = null;

              if (truckSnapshot.exists()) {
                const truckData = truckSnapshot.val();
                for (const [id, item] of Object.entries<any>(truckData)) {
                  if (item.variant === decodedText) {
                    truckStatus = true;
                    truckId = id;
                    break;
                  }
                }
              }

              if (!truckStatus) {
                throw new Error(`Truck ${decodedText} tidak tersedia!`);
              }

              // Cari driver berdasarkan NIK
              const driverRef = ref(this.database, 'sms_driver');
              const driverSnapshot = await get(driverRef);
              let driverStatus = false;
              let driverId = null;

              if (driverSnapshot.exists()) {
                const driverData = driverSnapshot.val();
                for (const [id, item] of Object.entries<any>(driverData)) {
                  if (item.nik === this.nik) {
                    driverStatus = true;
                    driverId = id;
                    break;
                  }
                }
              }

              if (!driverStatus) {
                throw new Error('Anda tidak memiliki akses. Hubungi departemen terkait!');
              }

              // Simpan data ke Firebase
              const historyRef = ref(this.database, 'sms_truck_history');
              const newHistoryRef = push(historyRef);
              set(newHistoryRef, {
                sms_truck_id: truckId,
                sms_driver_id: driverId,
                sms_tangki_id: '-',
                shift: this.getCurrentShift(),
                status: 'active',
                lokasi_terakhir: this.lokasiTerdekat,
                created_at: new Date().toISOString()
              });

              // Tampilkan notifikasi sukses
              Swal.close();
              Swal.fire({
                title: 'Berhasil',
                text: `Berhasil scan mobil dengan variant: ${decodedText}`,
                icon: 'success',
                confirmButtonText: 'OK'
              }).then(() => {
                this.router.navigate(['/home'], {
                  queryParams: {
                    nik: this.nik,
                    nama: this.nama
                  }
                });
              });
            } catch (error: any) {
              Swal.fire({
                title: 'Gagal',
                text: error.message || 'Terjadi kesalahan saat memproses data.',
                icon: 'error',
                confirmButtonText: 'OK'
              });
            } finally {
              html5QrCode.stop().catch((err) => {
                console.error('Gagal menghentikan QR Code scanner:', err);
              });
              this.isScanning = false;
            }
          },
          (error: any) => {
            if (!isErrorShown) {
              console.error('Error saat memindai QR Code:', error);
              isErrorShown = true;
            }
          }
        ).catch((err) => {
          console.error('Gagal memulai QR Code scanner:', err);
          Swal.fire({
            title: 'Error',
            text: 'Gagal memulai kamera. Pastikan kamera tersedia dan izin diberikan.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          this.isScanning = false;
        });
      },
      willClose: () => {
        const video = document.getElementById('qr-reader') as HTMLElement;
        if (video) {
          const scanner = new Html5Qrcode('qr-reader');
          scanner.stop().catch((err) => {
            console.error('Gagal menghentikan QR Code scanner:', err);
          });
        }
      }
    });
  }

  getCurrentShift(): string {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 15) {
      return 'Shift 1';
    } else if (hour >= 15 && hour < 23) {
      return 'Shift 2';
    } else {
      return 'Shift 3';
    }
  }
}
