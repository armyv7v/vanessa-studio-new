// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import BookingFlow from '../components/BookingFlow';

// El horario normal de atención es hasta las 21:00.
// Las citas ya agendadas (normales o extra) bloquearán los turnos correspondientes.
const normalConfig = {
  isExtra: false,
  openHour: 10,
  closeHour: 21, // Horario extendido por defecto
  allowOverflowEnd: true, // Permitir que el último turno termine después de las 21:00
  daysToShow: 21,
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Vanessa Nails Studio - Reserva de Citas</title>
        <meta name="description" content="Reserva tu cita en Vanessa Nails Studio" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-pink-600 mb-2">Vanessa Nails Studio</h1>
          <p className="text-gray-600">Reserva tu cita online</p>
          <div className="mt-4">
            <Link href="/extra-cupos" className="text-pink-600 hover:text-pink-800 underline">
              ¿Sin disponibilidad? Revisa aquí los <b>Extra Cupos (18:00–20:00)</b> →
            </Link>
          </div>
        </div>

        <BookingFlow config={normalConfig} />
      </main>

      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Vanessa Nails Studio. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
