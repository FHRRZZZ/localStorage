const QRGenerator = ({ nisn }) => {
  if (!nisn) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${nisn}`;

  return (
    <div className="mt-4 text-center">
      <h2 className="text-lg font-semibold">QR Code untuk NISN: {nisn}</h2>
      <img src={qrUrl} alt="QR Code" className="mx-auto mt-2" />
    </div>
  );
};

export default QRGenerator;
