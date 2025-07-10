import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportToExcel = () => {
  const siswa = JSON.parse(localStorage.getItem("siswa")) || [];
  const presensi = JSON.parse(localStorage.getItem("dataPresensi")) || [];

  if (siswa.length === 0) {
    alert("Belum ada data siswa!");
    return;
  }

  // Ambil semua tanggal unik dari data presensi
  const tanggalUnik = [...new Set(presensi.map(p => p.tanggal))].sort();

  // Bentuk struktur baris untuk setiap siswa
  const data = siswa.map(s => {
    const row = {
      Nama: s.nama,
      NISN: s.nisn,
    };

    tanggalUnik.forEach(tgl => {
      const hadir = presensi.some(p => p.nisn === s.nisn && p.tanggal === tgl);
      row[tgl] = hadir ? "✅" : "";
    });

    return row;
  });

  // Buat dan export Excel
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
