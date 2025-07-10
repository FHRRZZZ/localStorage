import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import "./PresensiScanner.css"; // Import file CSS eksternal

const PresensiScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef();
  const [message, setMessage] = useState("");
  const [dataPresensi, setDataPresensi] = useState([]);

  useEffect(() => {

    const today = new Date().toLocaleDateString("id-ID");
    const lastReset = localStorage.getItem("lastReset");

    if (lastReset !== today) {
        localStorage.removeItem("dataPresensi");
        localStorage.removeItem("presensi");
        localStorage.setItem("lastReset", today);
        setDataPresensi([]); // Kosongkan state juga
        setMessage("✅ Presensi telah direset untuk hari ini");
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
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

        if (code) {
          handleScan(code.data.trim());
        }
      }

      requestAnimationFrame(scanLoop);
    };

    startCamera().then(() => requestAnimationFrame(scanLoop));

    return () => {
      const tracks = videoRef.current?.srcObject?.getTracks();
      tracks?.forEach((track) => track.stop());
    };
  }, [dataPresensi]);

  const handleScan = (nisn) => {
    const list = JSON.parse(localStorage.getItem("siswa")) || [];
    const siswa = list.find((s) => s.nisn.trim() === nisn.trim());

    if (siswa) {
      const now = new Date();
      const waktu = now.toLocaleTimeString("id-ID");
      const tanggal = now.toLocaleDateString("id-ID");

      const sudahPresensi = dataPresensi.some((d) => d.nisn === nisn);
      if (!sudahPresensi) {
        const presensiBaru = { ...siswa, tanggal, waktu };
        const updated = [...dataPresensi, presensiBaru];
        setDataPresensi(updated);
        localStorage.setItem("dataPresensi", JSON.stringify(updated));
        setMessage(`✅ ${siswa.nama} hadir pada ${tanggal} ${waktu}`);

        const presensiList = JSON.parse(localStorage.getItem("presensi")) || [];
        if (!presensiList.includes(nisn)) {
          presensiList.push(nisn);
          localStorage.setItem("presensi", JSON.stringify(presensiList));
        }
      } else {
        setMessage(`⚠️ ${siswa.nama} sudah absen`);
      }
    } else {
      setMessage("❌ Siswa tidak ditemukan");
    }
  };

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
        if (code) {
          handleScan(code.data.trim());
        } else {
          setMessage("❌ QR tidak terbaca dari gambar");
        }
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
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
        />
        <button onClick={() => fileInputRef.current.click()} className="btn-upload">
          Upload Gambar QR
        </button>
      </div>

      {dataPresensi.length > 0 && (
        <div className="presensi-list">
          <h3 className="title">Daftar Hadir</h3>
          <ul>
            {dataPresensi.map((item, i) => (
              <li key={i}>
                {item.nama} ({item.nisn}) – {item.tanggal} {item.waktu}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PresensiScanner;
