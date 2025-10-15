import React from "react";
import { format } from "date-fns";

export default function ConfirmationCard({
  service,
  date,
  time,
  client,
  onConfirm,
  onEdit,
}) {
  const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy", {
    locale: undefined,
  });
  const formattedTime = time;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h4 className="mb-4 text-xl font-semibold text-primary-700">
        Confirmación de cita
      </h4>

      <ul className="space-y-2 text-gray-800">
        <li>
          <strong>Servicio:</strong> {service.name}
        </li>
        <li>
          <strong>Duración:</strong> {service.duration} min
        </li>
        <li>
          <strong>Fecha:</strong> {formattedDate}
        </li>
        <li>
          <strong>Hora de inicio:</strong> {formattedTime}
        </li>
        <li>
          <strong>Cliente:</strong> {client.name}
        </li>
        <li>
          <strong>Email:</strong> {client.email}
        </li>
        <li>
          <strong>Teléfono:</strong> {client.phone}
        </li>
      </ul>

      <div className="mt-6 flex gap-4">
        <button
          className="btn-primary flex-1"
          onClick={onConfirm}
        >
          Confirmar cita
        </button>

        <button
          className="border border-primary-500 text-primary-500 rounded-md px-4 py-2 flex-1"
          onClick={onEdit}
        >
          Editar
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        Al confirmar recibirás un correo con los datos y un recordatorio 4 h antes.
        <br />
        <a
          href={process.env.NEXT_PUBLIC_WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 underline"
        >
          Contactar por WhatsApp
        </a>{" "}
        |{" "}
        <a
          href={process.env.NEXT_PUBLIC_GOOGLE_MAPS_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 underline"
        >
          Ver ubicación en Google Maps
        </a>
      </p>
    </div>
  );
}