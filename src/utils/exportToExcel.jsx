import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportToExcel = () => {
  const siswa = JSON.parse(localStorage.getItem("siswa")) || [];
  const riwayat = JSON.parse(localStorage.getItem("riwayatPresensi")) || [];

  if (siswa.length === 0) {
    alert("Belum ada data siswa!");
    return;
  }

  // Ambil semua tanggal unik dari riwayat
  const tanggalUnik = [...new Set(riwayat.map(p => p.tanggal))].sort();

  // Bentuk struktur baris: satu siswa, banyak tanggal
  const data = siswa.map(s => {
    const row = { Nama: s.nama, NISN: s.nisn };
    tanggalUnik.forEach(tgl => {
      const hadir = riwayat.some(p => p.nisn === s.nisn && p.tanggal === tgl);
      row[tgl] = hadir ? "✅" : "";
    });
    return row;
  });

  // Buat file Excel
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Presensi");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const fileData = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const tanggalExport = new Date().toISOString().slice(0, 10);
  saveAs(fileData, `rekap-presensi-${tanggalExport}.xlsx`);
};
