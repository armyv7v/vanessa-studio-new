// pages/extra-cupos.js
import Head from 'next/head';
import Link from 'next/link';
import BookingFlow from '../components/BookingFlow';

const extraConfig = {
  isExtra: true,
  openHour: 18,
  closeHour: 20,
  allowOverflowEnd: true,
  daysToShow: 35,
};

export default function ExtraCup() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Turnos Extra Cupos - Vanessa Nails Studio</title>
        <meta name="description" content="Reserva extra cupos (18:00 a 20:00) con recargo" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-pink-600">Turnos Extra Cupos</h1>
            <p className="text-gray-600">Horarios extendidos (18:00 a 20:00) con recargo</p>
          </div>
          {/* Botón Volver */}
          <Link href="/" className="inline-flex items-center text-pink-600 hover:text-pink-800">
            <span className="text-lg">←</span>
            <span className="ml-2">Volver</span>
          </Link>
        </div>

        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg">
          ⚠ Al seleccionar estos turnos, existe un <b>recargo adicional de $5.000</b>, indistintamente del servicio.
        </div>

        <BookingFlow config={extraConfig} />
      </main>

      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Vanessa Nails Studio. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}