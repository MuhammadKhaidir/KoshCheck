import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Problems from './components/Problems.jsx';
import Steps from './components/Steps.jsx';
import Cta from './components/Cta.jsx';
import Footer from './components/Footer.jsx';

// Urutan section = urutan di halaman. Tambah / pindah section di sini.
export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problems />
        <Steps />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
