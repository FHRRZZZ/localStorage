import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportToExcel = () => {
  const data = JSON.parse(localStorage.getItem("dataPresensi")) || [];

  if (data.length === 0) {
    alert("Belum ada data presensi!");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Presensi");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const fileData = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(fileData, `data-presensi-${new Date().toISOString().slice(0,10)}.xlsx`);
};
