import React, { useEffect, useState } from "react";
import FormInput from "../components/FormInput";
import { exportToExcel } from "../utils/exportToExcel";
import "./Home.css"; // import CSS biasa

const Home = () => {
  const [data, setData] = useState([]);
  const [presensiList, setPresensiList] = useState([]);

  useEffect(() => {
    const loadData = () => {
      const localData = JSON.parse(localStorage.getItem("siswa")) || [];
      const hadirList = JSON.parse(localStorage.getItem("dataPresensi")) || [];
      setData(localData);
      setPresensiList(hadirList);
    };

    loadData();

    const handleStorageChange = (e) => {
      if (e.key === "dataPresensi") {
        loadData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleAddSiswa = (newSiswa) => {
    const updatedData = [...data, newSiswa];
    setData(updatedData);
    localStorage.setItem("siswa", JSON.stringify(updatedData));
  };

  const handleDelete = (index) => {
    const updatedData = data.filter((_, i) => i !== index);
    setData(updatedData);
    localStorage.setItem("siswa", JSON.stringify(updatedData));
  };

  const generateQRUrl = (nisn) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(nisn)}`;

  const isHadir = (nisn) => presensiList.some((s) => s.nisn === nisn);

  const handleDownloadQR = (nisn) => {
    const url = generateQRUrl(nisn);
    const link = document.createElement("a");
    link.href = url;
    link.download = `QR_${nisn}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container">
      {/* SCAN SECTION */}
      <div className="scan-section">
        <h1>Scan QR Siswa</h1>
        <p>Silakan gunakan kamera untuk scan QR Code yang sudah tersedia.</p>
      </div>

      {/* FORM SECTION */}
      <div className="form-section">
        <h2>Input Data Siswa</h2>
        <FormInput onSubmit={handleAddSiswa} />
      </div>

      {/* TABLE SECTION */}
     <div className="table-section">
      <h2>Daftar Siswa</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>NISN</th>
              <th>QR Code</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.nama}</td>
                  <td>{item.nisn}</td>
                  <td>
                    <img
                      src={generateQRUrl(item.nisn)}
                      alt={`QR ${item.nisn}`}
                      className="qr-img"
                    />
                    <br />
                    <button className="download-btn" onClick={() => handleDownloadQR(item.nisn)}>
                      Unduh QR
                    </button>
                  </td>
                  <td>{isHadir(item.nisn) ? "✅ Hadir" : "❌ Belum Hadir"}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(index)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>Belum ada data siswa</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button className="export-btn" onClick={exportToExcel}>
        Export ke Excel
      </button>
    </div>

    </div>
  );
};

export default Home;
