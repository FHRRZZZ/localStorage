import { useState } from "react";

const FormInput = ({ onSubmit }) => {
  const [nama, setNama] = useState("");
  const [nisn, setNisn] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nama || !nisn) return;

    onSubmit({ nama, nisn });
    setNama("");
    setNisn("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nama"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
      />
      <input
        type="text"
        placeholder="NISN"
        value={nisn}
        onChange={(e) => setNisn(e.target.value)}
      />
      <button type="submit" className="submit-btn">
        Simpan
      </button>
    </form>
  );
};

export default FormInput;
