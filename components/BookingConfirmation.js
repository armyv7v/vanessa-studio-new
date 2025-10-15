// components/BookingConfirmation.js
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function BookingConfirmation({ service, date, time, client, isExtra }) {
  if (!service || !date || !time || !client) {
    return null;
  }

  const formatDate = (d) => format(d, 'd MMMM yyyy', { locale: es });

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-green-600 mb-2">¡Cita Confirmada!</h2>
      <p className="text-gray-600 mb-6">Recibirás un correo con los detalles de tu reserva.</p>
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-left">
        <h3 className="font-semibold mb-3 text-lg text-gray-800">
          Resumen de tu cita {isExtra && '(EXTRA CUPO)'}:
        </h3>
        <div className="space-y-2">
          <p className="flex justify-between items-center">
            <span className="font-medium text-gray-600">Servicio:</span>
            <span className="text-gray-800 font-semibold text-right">{service.name}</span>
          </p>
          <p className="flex justify-between items-center">
            <span className="font-medium text-gray-600">Fecha:</span>
            <span className="text-gray-800 font-semibold">{formatDate(date)}</span>
          </p>
          <p className="flex justify-between items-center">
            <span className="font-medium text-gray-600">Hora:</span>
            <span className="text-gray-800 font-semibold">{time}</span>
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Redirigiendo al inicio en unos segundos...
      </p>
    </div>
  );
}