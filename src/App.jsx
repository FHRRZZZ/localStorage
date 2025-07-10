import Home from "./pages/Home";
import PresensiScanner from "./components/PresensiScanner";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Web Presensi QR</h1>
      <PresensiScanner />
      <Home />
    </div>
  );
}

export default App;
