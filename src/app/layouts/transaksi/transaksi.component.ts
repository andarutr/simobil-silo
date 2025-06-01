import {
  Component
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  Database,
  ref,
  get,
  update,
  set,
  push
} from '@angular/fire/database';
import {
  CommonModule
} from '@angular/common';
import Swal from 'sweetalert2';
import moment from 'moment';
import {
  Html5Qrcode
} from 'html5-qrcode';

@Component({
  selector: 'app-transaksi',
  imports: [CommonModule],
  templateUrl: './transaksi.component.html',
  styleUrls: ['./transaksi.component.css']
})

export class TransaksiComponent {
  id: string | null = null;
  nik: string | null = null;
  nama: string | null = null;
  smsTransactionKey: string | null = null;
  smsHistoryKey: string | null = null;
  sudahJalan: boolean = false;
  isScanning: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute, private database: Database) {
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
      this.nik = params['nik'];
      this.nama = params['nama'];

      this.checkTransaction();
    });
  }

  goBack() {
    if (this.id && this.nik && this.nama) {
      this.router.navigate(['/home'], {
        queryParams: {
          id: this.id,
          nik: this.nik,
          nama: this.nama
        }
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Tidak dapat kembali: id, nik, atau nama tidak tersedia.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }

  private isMobileDevice(): boolean {
    if (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) {
      return true;
    }
    if ('ontouchstart' in window) {
        return true;
    }

    return false;
  }

  async checkTransaction() {
    const dbRef = ref(this.database, 'sms_transaction');

    try {
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const transactions = snapshot.val();

        for (const key in transactions) {
          if (key === this.id) {
            this.sudahJalan = true; // Set status jika transaksi ditemukan
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error checking transaction:', error);
      Swal.fire({
        title: 'Error',
        text: 'Terjadi kesalahan saat memeriksa transaksi.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }

  async updateStartTransaction() {
    this.isScanning = true;

    Swal.fire({
      title: 'Scan QR Code',
      html: `
        <div id="qr-reader" style="width: 100%; height: 300px;"></div>
        <p class="mt-3">Arahkan kamera ke QR Code POS 2.</p>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Batal',
      allowOutsideClick: false,
      didOpen: () => {
        const html5QrCode = new Html5Qrcode('qr-reader');
        let isErrorShown = false;
        let processingScan = false;

        const useRearCamera = this.isMobileDevice();
        const selectedFacingMode = useRearCamera ? 'environment' : 'user';

        html5QrCode.start({
            facingMode: selectedFacingMode
          }, // Gunakan kamera depan
          {
            fps: 10, // Frame rate
            qrbox: {
              width: 250,
              height: 250
            } // Area pemindaian
          },
          async (decodedText: string) => {
              if (decodedText != 'PT_PRAKARSA_ALAM_SEGAR') {
                await html5QrCode.stop().catch(err => console.error("Gagal menghentikan scanner (QR salah):", err));
                Swal.fire("Gagal", "QR Code tidak sesuai. Silahkan hubungi ITE!", "error");
                this.isScanning = false;
                return;
              }

              if (processingScan) {
                console.log('Scan sudah diproses, mengabaikan deteksi berikutnya.');
                return; // Keluar jika sudah memproses
              }

              processingScan = true;

              try {
                const dbRef = ref(this.database, 'sms_transaction');

                // Data yang akan disimpan
                const transactionData = {
                  nik: this.nik || '-', // NIK pengguna (jika ada)
                  sms_truck_history_id: this.id || '-', // ID history dari query params
                  no_pengiriman: '-', // Default value
                  proses: 'otw_pas_to_psg', // Proses saat ini
                  mulai_pas_to_psg: moment().format('HH:mm'), // Waktu mulai dalam format jam:menit
                  durasi_pas_to_psg: '-', // Durasi default
                  tiba_pas_to_psg: '-', // Waktu tiba default
                  mulai_psg_to_pas: '-', // Default value
                  durasi_psg_to_pas: '-', // Default value
                  tiba_psg_to_pas: '-', // Default value
                  mulai_bongkar: '-', // Default value
                  mulai_bongkar_by: '-', // Default value
                  selesai_bongkar: '-', // Default value
                  selesai_bongkar_by: '-', // Default value
                  durasi_bongkar: '-', // Default value
                  mulai_cleaning: '-', // Default value
                  mulai_cleaning_by: '-', // Default value
                  selesai_cleaning: '-', // Default value
                  selesai_cleaning_by: '-', // Default value
                  durasi_cleaning: '-', // Default value
                  created_at: new Date().toISOString(), // Waktu pembuatan data
                  updated_at: new Date().toISOString() // Waktu pembaruan data
                };

                // Push data ke Firebase
                const newTransactionRef = push(dbRef); // Membuat key unik untuk data baru
                this.smsTransactionKey = newTransactionRef.key;
                await set(newTransactionRef, transactionData);

                await html5QrCode.stop().catch(err => console.error("Gagal menghentikan scanner (QR salah):", err));

                Swal.fire({
                  title: 'Sukses',
                  text: 'Data berhasil disimpan!',
                  icon: 'success',
                  confirmButtonText: 'OK',
                  allowOutsideClick: false
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.router.navigate(['/transaksi'], {
                      queryParams: {
                        id: this.smsTransactionKey,
                        nik: this.nik,
                        nama: this.nama
                      }
                    });
                  }
                });
              } catch (error) {
                console.error('Error menyimpan transaksi:', error);
                Swal.fire({
                  title: 'Error',
                  text: 'Terjadi kesalahan: ' + (error instanceof Error ? error.message : 'Unknown error'),
                  icon: 'error',
                  confirmButtonText: 'OK'
                });
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

  async updateEndTransaction() {
    this.isScanning = true;

    Swal.fire({
      title: 'Scan QR Code',
      html: `
        <div id="qr-reader-end" style="width: 100%; height: 300px;"></div>
        <p class="mt-3">Arahkan kamera ke QR Code di gedung PSG.</p>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Batal',
      allowOutsideClick: false,
      didOpen: () => {
        const html5QrCode = new Html5Qrcode('qr-reader-end');
        let isErrorShown = false;
        let processingScan = false;

        const useRearCamera = this.isMobileDevice();
        const selectedFacingMode = useRearCamera ? 'environment' : 'user';

        html5QrCode.start({
            facingMode: selectedFacingMode
          }, // Gunakan kamera depan
          {
            fps: 10, // Frame rate
            qrbox: {
              width: 250,
              height: 250
            } // Area pemindaian
          },
          async (decodedText: string) => {
              if (decodedText != 'PT_PARAMASUKA_GUPITA') {
                await html5QrCode.stop().catch(err => console.error("Gagal menghentikan scanner (QR salah):", err));
                Swal.fire("Gagal", "QR Code tidak sesuai. Silahkan hubungi ITE!", "error");
                this.isScanning = false;
                return;
              }

              if (processingScan) {
                console.log('Scan sudah diproses, mengabaikan deteksi berikutnya.');
                return; // Keluar jika sudah memproses
              }

              processingScan = true;

              try {
                const dbRef = ref(this.database, 'sms_transaction');
                const snapshot = await get(dbRef);

                if (snapshot.exists()) {
                  const transactions = snapshot.val();
                  let transactionToUpdate = null;
                  let transactionKey = null;

                  for (const key in transactions) {
                    if (key === this.id) {
                      transactionToUpdate = transactions[key];
                      transactionKey = key;
                      break;
                    }
                  }

                  if (transactionToUpdate) {
                    const startTime = moment(transactionToUpdate.mulai_pas_to_psg, "HH:mm");
                    const endTime = moment();
                    const duration = endTime.diff(startTime, 'minutes');

                    const transactionData = {
                      tiba_pas_to_psg: endTime.format("HH:mm"),
                      durasi_pas_to_psg: `${duration} menit`
                    };

                    const transactionRef = ref(this.database, `sms_transaction/${transactionKey}`);
                    await update(transactionRef, transactionData);

                    await html5QrCode.stop().catch(err => console.error("Gagal menghentikan scanner (QR salah):", err));
                    Swal.fire({
                      title: "Sukses",
                      text: "Data berhasil diperbarui!",
                      icon: "success",
                      confirmButtonText: "OK",
                      allowOutsideClick: false
                    }).then((result) => {
                      if (result.isConfirmed) {
                        this.router.navigate(['/transaksi-pulang'], {
                          queryParams: {
                            id: transactionKey,
                            nik: this.nik,
                            nama: this.nama
                          }
                        });
                      }
                    });
                  } else {
                    Swal.fire("Error", "Transaksi tidak ditemukan!", "error");
                  }
                } else {
                  Swal.fire("Error", "Tidak ada transaksi ditemukan!", "error");
                }
              } catch (error) {
                console.error("Error updating transaction:", error);
                Swal.fire("Error", "Terjadi kesalahan: " + (error instanceof Error ? error.message : "Unknown error"), "error");
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
        const video = document.getElementById('qr-reader-end') as HTMLElement;
        if (video) {
          const scanner = new Html5Qrcode('qr-reader-end');
          scanner.stop().catch((err) => {
            console.error('Gagal menghentikan QR Code scanner:', err);
          });
        }
      }
    });
  }
}
