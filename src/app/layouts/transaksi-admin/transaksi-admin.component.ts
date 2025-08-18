import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Database, ref, onValue, update, Unsubscribe, get, push, set, remove } from '@angular/fire/database';
import Swal from 'sweetalert2';
import moment from 'moment';

// Interface untuk mendefinisikan struktur data transaksi
interface TransactionData {
  id: string;
  nik: string;
  created_at?: string;
  mulai_pas_to_psg?: string;
  tiba_pas_to_psg?: string;
  durasi_pas_to_psg?: string;
  mulai_psg_to_pas?: string;
  tiba_psg_to_pas?: string;
  durasi_psg_to_pas?: string;

  mulai_bongkar?: string;
  selesai_bongkar?: string;
  durasi_bongkar?: string;
  mulai_cleaning?: string;
  selesai_cleaning?: string;
  durasi_cleaning?: string;
  
  sms_truck_history_id?: string;
  sms_driver_id?: string;
  sms_truck_id?: string;
  sms_tangki_id?: string;

  namaDriver?: string;
  nomorPolisi?: string;
  variantTangki?: string;
}

@Component({
  selector: 'app-transaksi-admin',
  standalone: true,
  imports: [CommonModule], // CommonModule untuk directive seperti *ngFor, *ngIf
  templateUrl: './transaksi-admin.component.html',
  styleUrls: ['./transaksi-admin.component.css']
})
export class TransaksiAdminComponent implements OnInit, OnDestroy {
  transactions: TransactionData[] = [];
  driversMap: { [key: string]: any } = {};
  trucksMap: { [key: string]: any } = {};
  tangkisMap: { [key: string]: any } = {};

  private dbSubscription: Unsubscribe | undefined;
  isLoading: boolean = true;

  // Opsi untuk Swal unlock dan teksnya
  private unlockOptions: { [key: string]: string } = {
    'mulai_pas_to_psg': 'Mulai PAS to PSG',
    'tiba_pas_to_psg': 'Tiba PAS to PSG',
    'mulai_psg_to_pas': 'Mulai PSG to PAS',
    'tiba_psg_to_pas': 'Tiba PSG to PAS'
  };

  private isToday(timestamp: string): boolean {
    const today = moment().startOf('day'); // 00:00 hari ini
    const date = moment(timestamp);
    return date.isSame(today, 'day'); // cek apakah tanggal sama
  }

  constructor(private database: Database, private router: Router) {}

  ngOnInit(): void {
    this.loadReferenceData().then(() => {
      this.loadTransactions(); // baru muat transaksi setelah referensi siap
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe dari listener Firebase untuk mencegah memory leak
    if (this.dbSubscription) {
      this.dbSubscription();
    }
  }

  copyLink(transactionId: string): void {
    const transaction = this.transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const nik = transaction.nik || '';
    const namaDriver = encodeURIComponent(transaction.namaDriver || '');
    const baseUrl = ' https://silo-pt-pas.web.app/transaksi';

    const link = `${baseUrl}?id=${transactionId}&nik=${nik}&nama=${namaDriver}`;
    
    navigator.clipboard.writeText(link).then(() => {
      Swal.fire('Berhasil!', 'Link telah disalin ke clipboard.', 'success');
    }).catch(err => {
      Swal.fire('Gagal!', 'Tidak bisa menyalin link.', 'error');
      console.error("Gagal menyalin link:", err);
    });
  }

  copyLinkPulang(transactionId: string): void {
    const transaction = this.transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const nik = transaction.nik || '';
    const namaDriver = encodeURIComponent(transaction.namaDriver || '');
    const baseUrl = 'https://silo-pt-pas.web.app/transaksi-pulang';

    const link = `${baseUrl}?id=${transactionId}&nik=${nik}&nama=${namaDriver}`;

    navigator.clipboard.writeText(link).then(() => {
      Swal.fire('Berhasil!', 'Link pulang telah disalin ke clipboard.', 'success');
    }).catch(err => {
      Swal.fire('Gagal!', 'Tidak bisa menyalin link.', 'error');
      console.error("Gagal menyalin link:", err);
    });
  }

  async loadReferenceData(): Promise<void> {
    try {
      const driverSnapshot = await get(ref(this.database, 'sms_driver'));
      if (driverSnapshot.exists()) {
        this.driversMap = driverSnapshot.val();
      }

      const truckSnapshot = await get(ref(this.database, 'sms_truck'));
      if (truckSnapshot.exists()) {
        this.trucksMap = truckSnapshot.val();
      }

      const tangkiSnapshot = await get(ref(this.database, 'sms_tangki'));
      if (tangkiSnapshot.exists()) {
        this.tangkisMap = tangkiSnapshot.val();
      }
    } catch (error) {
      console.error('Gagal memuat data referensi:', error);
    }
  }
  loadTransactions(): void {
    const transactionRef = ref(this.database, 'sms_transaction');
    
    // onValue(transactionRef, async (snapshot) => {
    //   if (snapshot.exists()) {
    //     const data = snapshot.val();
        
    //     const promises = Object.keys(data).map(async (key) => {
    //       const transaction = {
    //         id: key,
    //         ...data[key]
    //       } as TransactionData;

    //       // Jika ada sms_truck_history_id, ambil data tambahan
    //       if (transaction.sms_truck_history_id) {
    //         const historySnapshot = await get(ref(this.database, `sms_truck_history/${transaction.sms_truck_history_id}`));
            
    //         if (historySnapshot.exists()) {
    //           const historyData = historySnapshot.val();

    //           // Ambil ID dari history
    //           // transaction.sms_driver_id = historyData.sms_driver_id || null;
    //           // transaction.sms_truck_id = historyData.sms_truck_id || null;
    //           // transaction.sms_tangki_id = historyData.sms_tangki_id || null;

    //           // // Ambil nama driver, no polisi, dan variant tangki
    //           // transaction.namaDriver = this.driversMap?.[transaction.sms_driver_id]?.nama || 'N/A';
    //           // transaction.nomorPolisi = this.trucksMap?.[transaction.sms_truck_id]?.variant || 'N/A';
    //           // transaction.variantTangki = this.tangkisMap?.[transaction.sms_tangki_id]?.variant || 'N/A';
    //           const driverId = historyData.sms_driver_id;
    //           const truckId = historyData.sms_truck_id;
    //           const tangkiId = historyData.sms_tangki_id;

    //           // Nama Driver
    //           if (driverId && this.driversMap?.[driverId]) {
    //             transaction.namaDriver = this.driversMap[driverId].nama || 'N/A';
    //           } else {
    //             transaction.namaDriver = 'N/A';
    //           }

    //           // Nomor Polisi Truck
    //           if (truckId && this.trucksMap?.[truckId]) {
    //             transaction.nomorPolisi = this.trucksMap[truckId].variant || 'N/A';
    //           } else {
    //             transaction.nomorPolisi = 'N/A';
    //           }

    //           // Variant Tangki
    //           if (tangkiId && this.tangkisMap?.[tangkiId]) {
    //             transaction.variantTangki = this.tangkisMap[tangkiId].variant || 'N/A';
    //           } else {
    //             transaction.variantTangki = 'N/A';
    //           }

    //         } else {
    //           // Jika history tidak ditemukan
    //           transaction.namaDriver = 'N/A';
    //           transaction.nomorPolisi = 'N/A';
    //           transaction.variantTangki = 'N/A';
    //         }
    //       } else {
    //         // Jika tidak ada sms_truck_history_id
    //         transaction.namaDriver = 'N/A';
    //         transaction.nomorPolisi = 'N/A';
    //         transaction.variantTangki = 'N/A';
    //       }

    //       return transaction;
    //     });

    //     this.transactions = await Promise.all(promises);
    //     this.isLoading = false;

    //   } else {
    //     this.transactions = [];
    //     this.isLoading = false;
    //   }
    // }, (error) => {
    //   console.error("Error fetching transactions:", error);
    //   this.isLoading = false;
    // });

    onValue(transactionRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        const promises = Object.keys(data).map(async (key) => {
          const rawData = data[key];
          const transaction = {
            id: key,
            ...rawData
          } as TransactionData;

          // Cek apakah transaksi hari ini
          if (!rawData.created_at || !this.isToday(rawData.created_at)) {
            return null; // Abaikan transaksi yang bukan hari ini
          }

          // Ambil data tambahan jika ada history
          if (transaction.sms_truck_history_id) {
            const historySnapshot = await get(ref(this.database, `sms_truck_history/${transaction.sms_truck_history_id}`));
            if (historySnapshot.exists()) {
              const historyData = historySnapshot.val();
              const driverId = historyData.sms_driver_id;
              const truckId = historyData.sms_truck_id;
              const tangkiId = historyData.sms_tangki_id;

              transaction.namaDriver = this.driversMap?.[driverId]?.nama || 'N/A';
              transaction.nomorPolisi = this.trucksMap?.[truckId]?.variant || 'N/A';
              transaction.variantTangki = this.tangkisMap?.[tangkiId]?.variant || 'N/A';
            } else {
              transaction.namaDriver = 'N/A';
              transaction.nomorPolisi = 'N/A';
              transaction.variantTangki = 'N/A';
            }
          } else {
            transaction.namaDriver = 'N/A';
            transaction.nomorPolisi = 'N/A';
            transaction.variantTangki = 'N/A';
          }

          return transaction;
        });

        // Tunggu semua promise, lalu filter yang null (bukan hari ini)
        const results = await Promise.all(promises);
        this.transactions = results.filter(t => t !== null) as TransactionData[];

        this.isLoading = false;

      } else {
        this.transactions = [];
        this.isLoading = false;
      }
    }, (error) => {
      console.error("Error fetching transactions:", error);
      this.isLoading = false;
    });
  }

  async addNewTransaction(): Promise<void> {
    Swal.fire({
      title: 'Tambah Transaksi Baru',
      inputLabel: 'NIK Driver',
      inputPlaceholder: 'Masukkan NIK Driver',
      html: 'Memuat data pilihan...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // 1. Fetch data untuk dropdowns
      const driverRef = ref(this.database, 'sms_driver');
      const tangkiRef = ref(this.database, 'sms_tangki');
      const truckRef = ref(this.database, 'sms_truck');

      const [driverSnapshot, tangkiSnapshot, truckSnapshot] = await Promise.all([
        get(driverRef),
        get(tangkiRef),
        get(truckRef)
      ]);

      let driversOptionsHtml = '<option value="">Pilih NIK Driver...</option>';
      const driversData: { key: string, nik: string, nama: string }[] = [];
      if (driverSnapshot.exists()) {
        const drivers = driverSnapshot.val();
        Object.keys(drivers).forEach(key => {
          driversData.push({ key, ...drivers[key] });
          driversOptionsHtml += `<option value="${key}">${drivers[key].nik} - ${drivers[key].nama}</option>`;
        });
      }

      let tangkiOptionsHtml = '<option value="">Pilih Tangki...</option>';
      if (tangkiSnapshot.exists()) {
        const tangkiData = tangkiSnapshot.val();
        Object.keys(tangkiData).forEach(key => {
          tangkiOptionsHtml += `<option value="${key}">${tangkiData[key].variant}</option>`;
        });
      }

      let truckOptionsHtml = '<option value="">Pilih Truck...</option>';
      if (truckSnapshot.exists()) {
        const truckData = truckSnapshot.val();
        Object.keys(truckData).forEach(key => {
          truckOptionsHtml += `<option value="${key}">${truckData[key].variant}</option>`;
        });
      }

      Swal.close(); // Tutup loading swal

      const { value: formValues } = await Swal.fire({
        title: 'Tambah Transaksi Baru',
        html:
          `<div>` +
          `  <label for="swal-select-driver" style="display: block; text-align: left; margin-bottom: .25em;">NIK Driver:</label>` +
          `  <select id="swal-select-driver" class="swal2-input" style="width: 100%; margin-bottom: 1em;">${driversOptionsHtml}</select>` +
          `  <label for="swal-select-tangki" style="display: block; text-align: left; margin-bottom: .25em;">Tangki:</label>` +
          `  <select id="swal-select-tangki" class="swal2-input" style="width: 100%; margin-bottom: 1em;">${tangkiOptionsHtml}</select>` +
          `  <label for="swal-select-truck" style="display: block; text-align: left; margin-bottom: .25em;">Truck:</label>` +
          `  <select id="swal-select-truck" class="swal2-input" style="width: 100%;">${truckOptionsHtml}</select>` +
          `</div>`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Tambahkan Transaksi',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const selectedDriverKey = (Swal.getPopup()?.querySelector('#swal-select-driver') as HTMLSelectElement).value;
          const selectedTangkiKey = (Swal.getPopup()?.querySelector('#swal-select-tangki') as HTMLSelectElement).value;
          const selectedTruckKey = (Swal.getPopup()?.querySelector('#swal-select-truck') as HTMLSelectElement).value;

          if (!selectedDriverKey) {
            Swal.showValidationMessage('NIK Driver harus dipilih!');
            return false;
          }
          if (!selectedTangkiKey) {
            Swal.showValidationMessage('Tangki harus dipilih!');
            return false;
          }
          if (!selectedTruckKey) {
            Swal.showValidationMessage('Truck harus dipilih!');
            return false;
          }
          const selectedDriver = driversData.find(d => d.key === selectedDriverKey);
          return {
            driverKey: selectedDriverKey,
            driverNik: selectedDriver ? selectedDriver.nik : '',
            tangkiKey: selectedTangkiKey,
            truckKey: selectedTruckKey
          };
        }
      });

      if (formValues) {
        const { driverKey, driverNik, tangkiKey, truckKey } = formValues;

        // Konfirmasi sekali lagi (opsional, tapi baik untuk UX)
        Swal.fire({
          title: 'Konfirmasi Data',
          html: `Anda akan menambahkan transaksi untuk:<br>
                 NIK: <b>${driverNik}</b><br>
                 Tangki ID: <b>${tangkiKey}</b><br>
                 Truck ID: <b>${truckKey}</b><br>
                 Lanjutkan?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Ya, Tambahkan!',
          cancelButtonText: 'Batal'
        }).then(async (result) => {
          if (result.isConfirmed) {
            const transactionListRef = ref(this.database, 'sms_transaction');
            const newTransactionRef = push(transactionListRef);

            // const newTransactionData: Omit<TransactionData, 'id'> = {
            //   nik: driverNik,
            //   sms_driver_id: driverKey,
            //   sms_tangki_id: tangkiKey,
            //   sms_truck_id: truckKey,
            //   created_at: new Date().toISOString(),
            //   mulai_pas_to_psg: '-',
            //   tiba_pas_to_psg: '-',
            //   durasi_pas_to_psg: '-',
            //   mulai_psg_to_pas: '-',
            //   tiba_psg_to_pas: '-',
            //   durasi_psg_to_pas: '-',
            // };

            // 1. Buat entry baru di sms_truck_history
            const truckHistoryRef = push(ref(this.database, 'sms_truck_history'));
            const truckHistoryData = {
              sms_driver_id: driverKey,
              sms_tangki_id: tangkiKey,
              sms_truck_id: truckKey,
              created_at: new Date().toISOString()
            };
            await set(truckHistoryRef, truckHistoryData);

            // 2. Buat transaksi baru dengan history_id
            const newTransactionData: Omit<TransactionData, 'id'> = {
              nik: driverNik,
              sms_driver_id: driverKey,
              sms_tangki_id: tangkiKey,
              sms_truck_id: truckKey,
              sms_truck_history_id: truckHistoryRef.key!, // ⬅️ ini penting
              created_at: new Date().toISOString(),
              mulai_pas_to_psg: '-',
              tiba_pas_to_psg: '-',
              durasi_pas_to_psg: '-',
              mulai_psg_to_pas: '-',
              tiba_psg_to_pas: '-',
              durasi_psg_to_pas: '-',
              mulai_bongkar: '-',
              selesai_bongkar: '-',
              durasi_bongkar: '-',
              mulai_cleaning: '-',
              selesai_cleaning: '-',
              durasi_cleaning: '-',
            };

            await set(newTransactionRef, newTransactionData);
            Swal.fire('Berhasil!', 'Transaksi baru telah ditambahkan.', 'success');
          }
        });
      }
    } catch (error) {
      console.error("Error preparing or adding new transaction:", error);
      Swal.fire('Error', 'Gagal memuat data atau menambahkan transaksi baru.', 'error');
    }
  }

  async deleteTransaction(transaction: TransactionData): Promise<void> {
    Swal.fire({
      title: 'Konfirmasi Hapus',
      html: `Anda yakin ingin menghapus transaksi untuk NIK <b>${transaction.nik}</b> (ID: ${transaction.id})?<br>Tindakan ini tidak dapat dibatalkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const transactionRef = ref(this.database, `sms_transaction/${transaction.id}`);
          await remove(transactionRef);
          Swal.fire(
            'Terhapus!',
            `Transaksi untuk NIK ${transaction.nik} telah dihapus.`,
            'success'
          );
          // Data akan diperbarui otomatis oleh onValue listener
        } catch (error) {
          console.error("Error deleting transaction:", error);
          Swal.fire(
            'Gagal!',
            'Terjadi kesalahan saat menghapus transaksi.',
            'error'
          );
        }
      }
    });
  }
  
  async unlockTransaction(transaction: TransactionData): Promise<void> {
    // const { value: selectedField } = await Swal.fire({
    //   title: `Unlock Transaksi NIK: ${transaction.nik}`,
    //   input: 'select',
    //   inputOptions: this.unlockOptions,
    //   inputPlaceholder: 'Pilih proses yang akan di-unlock',
    const selectOptionsHtml = Object.entries(this.unlockOptions)
      .map(([value, text]) => `<option value="${value}">${text}</option>`)
      .join('');

    const currentTime = moment().format('HH:mm');

    const { value: formValues } = await Swal.fire({
      title: `Atur Ulang Proses Transaksi NIK: ${transaction.nik}`,
      html:
        `<div>` +
        `  <select id="swal-select-process" class="swal2-input" style="width: 80%; margin-bottom: 1em;">` +
        `    <option value="">Pilih proses...</option>` +
        `    ${selectOptionsHtml}` +
        `  </select>` +
        `  <input type="time" id="swal-input-time" class="swal2-input" value="${currentTime}" style="width: 80%;">` +
        `</div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Lanjutkan',
      cancelButtonText: 'Batal',
      // inputValidator: (value) => {
      //   if (!value) {
      //     return 'Anda harus memilih salah satu proses!';
      //   }
      //   return null;
      preConfirm: () => {
        const processEl = Swal.getPopup()?.querySelector('#swal-select-process') as HTMLSelectElement;
        const timeEl = Swal.getPopup()?.querySelector('#swal-input-time') as HTMLInputElement;
        const selectedProcess = processEl.value;
        const selectedTimeVal = timeEl.value;

        if (!selectedProcess) {
          Swal.showValidationMessage('Anda harus memilih salah satu proses!');
          return false;
        }
        if (!selectedTimeVal) {
          Swal.showValidationMessage('Waktu harus diisi!');
          return false;
        }
        return { selectedField: selectedProcess, time: selectedTimeVal };
      }
    });


    if (formValues) {
      const { selectedField, time } = formValues; // selectedField adalah 'mulai_pas_to_psg', 'tiba_pas_to_psg', dll.
                                                // time adalah input jam dan menit dari pengguna, misal "14:30"
      const selectedText = this.unlockOptions[selectedField as string] || 'Proses terpilih';

      Swal.fire({
        title: 'Konfirmasi Proses Ulang',
        html: `Anda yakin ingin memproses ulang "<b>${selectedText}</b>" pada pukul <b>${time}</b> untuk NIK <b>${transaction.nik}</b>?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Proses!',
        cancelButtonText: 'Batal'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const transactionRef = ref(this.database, `sms_transaction/${transaction.id}`);
            const updates: { [key: string]: any } = {};

            // Menggabungkan tanggal hari ini dengan waktu yang diinput pengguna
            // const today = moment().format('YYYY-MM-DD');
            // const newTimestamp = moment(`${today} ${time}`).toISOString(); // Hasilnya: "2023-10-27T14:30:00.000Z" (contoh)
            const newTimestamp = moment(time, 'HH:mm').format('HH:mm'); 

            // 1. Logika untuk "Mulai PAS to PSG"
            if (selectedField === 'mulai_pas_to_psg') {
                updates['mulai_pas_to_psg'] = newTimestamp; 
                const tibaTimestamp = transaction.tiba_pas_to_psg; 
                const momentMulai = moment(newTimestamp, 'HH:mm', true); 
                const momentTiba = moment(tibaTimestamp, 'HH:mm', true);

                  if (tibaTimestamp && tibaTimestamp !== '-') {
                    const durMoment = moment.duration(momentTiba.diff(momentMulai)); 
                    const totalHours = Math.floor(durMoment.asHours());
                    const seconds = durMoment.seconds();
                    const displayHoursFormatted = String(totalHours).padStart(2, '0');
                    const displaySecondsFormatted = String(seconds).padStart(2, '0');
                    updates['durasi_pas_to_psg'] = `${displayHoursFormatted}:${displaySecondsFormatted}`;
                } else {
                    updates['durasi_pas_to_psg'] = '-'; // Jika waktu mulai tidak valid, reset durasi
                }
            }
            else if (selectedField === 'tiba_pas_to_psg') {
                updates['tiba_pas_to_psg'] = newTimestamp; // Kirim data jam ke kolom 'tiba_pas_to_psg'
                const mulaiTimestamp = transaction.mulai_pas_to_psg; // Ambil waktu mulai yang sudah ada
                const momentMulai = moment(mulaiTimestamp, 'HH:mm', true); // Parse strict HH:mm
                const momentTiba = moment(newTimestamp, 'HH:mm', true);

                // Hitung durasi jika waktu mulai valid
                // if (mulaiTimestamp && mulaiTimestamp !== '-' && moment(mulaiTimestamp).isValid()) {
                //     const durMoment = moment.duration(moment(newTimestamp).diff(moment(mulaiTimestamp)));
                  if (mulaiTimestamp && mulaiTimestamp !== '-' && momentMulai.isValid()) {
                    const durMoment = moment.duration(momentTiba.diff(momentMulai)); 
                     // const hours = Math.floor(durMoment.asHours());
                    // const minutes = durMoment.minutes();
                    // updates['durasi_pas_to_psg'] = `${hours} jam ${minutes} menit`; // Simpan durasi
                    const totalHours = Math.floor(durMoment.asHours());
                    const seconds = durMoment.seconds();
                    const displayHoursFormatted = String(totalHours).padStart(2, '0');
                    const displaySecondsFormatted = String(seconds).padStart(2, '0');
                    updates['durasi_pas_to_psg'] = `${displayHoursFormatted}:${displaySecondsFormatted}`;
                } else {
                    updates['durasi_pas_to_psg'] = '-'; // Jika waktu mulai tidak valid, reset durasi
                }
            }
            // Logika serupa untuk "Mulai PSG to PAS"
            else if (selectedField === 'mulai_psg_to_pas') {
                updates['mulai_psg_to_pas'] = newTimestamp;
                
                const tibaTimestamp = transaction.tiba_psg_to_pas; 
                const momentMulai = moment(newTimestamp, 'HH:mm', true); 
                const momentTiba = moment(tibaTimestamp, 'HH:mm', true);

                  if (tibaTimestamp && tibaTimestamp !== '-') {
                    const durMoment = moment.duration(momentTiba.diff(momentMulai)); 
                    const totalHours = Math.floor(durMoment.asHours());
                    const seconds = durMoment.seconds();
                    const displayHoursFormatted = String(totalHours).padStart(2, '0');
                    const displaySecondsFormatted = String(seconds).padStart(2, '0');
                    updates['durasi_psg_to_pas'] = `${displayHoursFormatted}:${displaySecondsFormatted}`;
                } else {
                    updates['durasi_psg_to_pas'] = '-'; // Jika waktu mulai tidak valid, reset durasi
                }
            }
            // Logika serupa untuk "Tiba PSG to PAS"
            else if (selectedField === 'tiba_psg_to_pas') {
                updates['tiba_psg_to_pas'] = newTimestamp;
                const mulaiTimestamp = transaction.mulai_psg_to_pas;
                // if (mulaiTimestamp && mulaiTimestamp !== '-' && moment(mulaiTimestamp).isValid()) {
                //     const durMoment = moment.duration(moment(newTimestamp).diff(moment(mulaiTimestamp)));
                    // const hours = Math.floor(durMoment.asHours());
                    // const minutes = durMoment.minutes();
                    // updates['durasi_psg_to_pas'] = `${hours} jam ${minutes} menit`;
                const momentMulai = moment(mulaiTimestamp, 'HH:mm', true); // Parse strict HH:mm
                const momentTiba = moment(newTimestamp, 'HH:mm', true);

                if (mulaiTimestamp && mulaiTimestamp !== '-' && momentMulai.isValid()) {
                    const durMoment = moment.duration(momentTiba.diff(momentMulai));
                    const totalHours = Math.floor(durMoment.asHours());
                    const seconds = durMoment.seconds();
                    const displayHoursFormatted = String(totalHours).padStart(2, '0');
                    const displaySecondsFormatted = String(seconds).padStart(2, '0');
                    updates['durasi_psg_to_pas'] = `${displayHoursFormatted}:${displaySecondsFormatted}`;
                } else {
                    updates['durasi_psg_to_pas'] = '-';
                }
            }

            if (Object.keys(updates).length > 0) {
              await update(transactionRef, updates);
              Swal.fire(
                'Berhasil!',
                `Proses "${selectedText}" telah diatur ulang.`,
                'success'
              );
            } else {
               Swal.fire('Info', 'Tidak ada field yang diubah atau proses tidak dikenal.', 'info');
            }
            // Data akan diperbarui otomatis oleh onValue listener
          } catch (error) {
            console.error("Error updating transaction:", error);
            Swal.fire('Error', 'Gagal memperbarui transaksi.', 'error');
          }
        }
      });
    }
  }

  formatDisplayDate(dateInput?: string): string {
    if (!dateInput || dateInput === '-') return 'N/A';
    // Menggunakan moment.js untuk memformat tanggal
    // const date = moment(dateInput);
    let date = moment(dateInput, 'HH:mm', true); // true untuk parsing ketat
    if (!date.isValid()) {
      date = moment(dateInput); // Fallback jika bukan format HH:mm (misal ISO string dari data lama)
    }
    return date.isValid() ? date.format('DD MMM YYYY') : 'Tanggal Tidak Valid';
  }

  logoutAdmin(): void {
    // Tambahkan logika clear session admin jika ada
    this.router.navigate(['/login-admin']);
  }
}
