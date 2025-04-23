import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Database, ref, get, update, set, push } from '@angular/fire/database';
import Swal from 'sweetalert2';
import moment from 'moment';

interface Transaction {
  id: string;
  mulai_pas_to_psg: string;
}

@Component({
  selector: 'app-transaksi',
  templateUrl: './transaksi.component.html',
  styleUrls: ['./transaksi.component.css']
})

export class TransaksiComponent {
  id: string | null = null;
  nik: string | null = null;
  nama: string | null = null;
  smsTransactionKey: string | null = null;
  
  constructor(private router: Router, private route: ActivatedRoute, private database: Database) {
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
      this.nik = params['nik'];
      this.nama = params['nama'];
    });
  }

  goBack() {
    this.router.navigate(['/home'], { queryParams: { nik: this.nik, nama: this.nama } });
  }

  async updateStartTransaction() {
    const dbRef = ref(this.database, 'sms_transaction'); // Referensi ke Firebase
  
    try {
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
  
      // Tampilkan notifikasi sukses
      Swal.fire({
        title: 'Sukses',
        text: 'Data berhasil disimpan!',
        icon: 'success',
        confirmButtonText: 'OK',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/transaksi'], { queryParams: { id: this.smsTransactionKey, nik: this.nik, nama: this.nama } });
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
  }

  async updateEndTransaction() {
    const dbRef = ref(this.database, 'sms_transaction');
    
    try {
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
            const transactions = snapshot.val();
            let transactionToUpdate = null;
            let transactionKey = null;

            for (const key in transactions) {
                if (transactions[key].sms_truck_history_id === this.id) {
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
                
                Swal.fire({
                    title: "Sukses",
                    text: "Data berhasil diperbarui!",
                    icon: "success",
                    confirmButtonText: "OK",
                    allowOutsideClick: false
                }).then((result) => {
                    if (result.isConfirmed) {
                        this.router.navigate(['/home'], { queryParams: { nik: this.nik, nama: this.nama } });
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
  }
}