import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import "./PresensiScanner.css";

const PresensiScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef();
  const [message, setMessage] = useState("");
  const [dataPresensi, setDataPresensi] = useState([]);

  // Reset otomatis presensi harian
  useEffect(() => {
    const checkAndResetPresensi = () => {
      const today = new Date().toLocaleDateString("id-ID");
      const lastReset = localStorage.getItem("lastReset");

      if (lastReset !== today) {
        localStorage.setItem("dataPresensi", JSON.stringify([]));
        localStorage.setItem("lastReset", today);
        setDataPresensi([]);
        setMessage("✅ Presensi telah direset otomatis untuk hari ini");
      } else {
        const existing = JSON.parse(localStorage.getItem("dataPresensi")) || [];
        setDataPresensi(existing);
      }
    };

    checkAndResetPresensi();
    const interval = setInterval(checkAndResetPresensi, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Inisialisasi kamera dan loop scanning
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error("❌ Tidak bisa akses kamera", err);
        setMessage("❌ Tidak bisa mengakses kamera");
      }
    };

    const scanLoop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, canvas.width, canvas.height);
        if (code) handleScan(code.data.trim());
      }

      requestAnimationFrame(scanLoop);
    };

    startCamera().then(() => requestAnimationFrame(scanLoop));
    return () => {
      const tracks = videoRef.current?.srcObject?.getTracks();
      tracks?.forEach((track) => track.stop());
    };
  }, []);

  // Tangani hasil scan QR
  const handleScan = (nisn) => {
    const list = JSON.parse(localStorage.getItem("siswa")) || [];
    const siswa = list.find((s) => s.nisn.trim() === nisn.trim());
    if (!siswa) return setMessage("❌ Siswa tidak ditemukan");

    const now = new Date();
    const tanggal = now.toLocaleDateString("id-ID");
    const waktu = now.toLocaleTimeString("id-ID");

    const existing = JSON.parse(localStorage.getItem("dataPresensi")) || [];
    const sudahAda = existing.find((d) => d.nisn === nisn && d.tanggal === tanggal);
    if (sudahAda) return setMessage(`⚠️ ${siswa.nama} sudah absen`);

    const presensiBaru = { ...siswa, tanggal, waktu };
    const updated = [...existing, presensiBaru];
    setDataPresensi(updated);
    localStorage.setItem("dataPresensi", JSON.stringify(updated));

    // Tambahkan ke riwayat presensi global
    const riwayat = JSON.parse(localStorage.getItem("riwayatPresensi")) || [];
    riwayat.push(presensiBaru);
    localStorage.setItem("riwayatPresensi", JSON.stringify(riwayat));

    setMessage(`✅ ${siswa.nama} hadir pada ${tanggal} ${waktu}`);
  };

  // Upload gambar QR
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code) handleScan(code.data.trim());
        else setMessage("❌ QR tidak terbaca dari gambar");
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="scanner-container">
      <video ref={videoRef} className="video" playsInline muted />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <p className="message">{message}</p>

      <div className="upload-wrapper">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleUpload} className="hidden" />
        <button onClick={() => fileInputRef.current.click()} className="btn-upload">Upload Gambar QR</button>
      </div>

      {dataPresensi.length > 0 && (
        <div className="presensi-list">
          <h3 className="title">Daftar Hadir</h3>
          <ul>
            {dataPresensi.map((item, i) => (
              <li key={i}>{item.nama} ({item.nisn}) – {item.tanggal} {item.waktu}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PresensiScanner;
