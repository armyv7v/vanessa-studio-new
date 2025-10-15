import React from "react";

export default function ServiceCard({ service, onSelect }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between">
      <h3 className="text-lg font-semibold text-primary-700">{service.name}</h3>
      <p className="mt-2 text-sm text-gray-600">
        Duración: {service.duration} minutos
      </p>
      <button
        className="mt-4 btn-primary"
        onClick={() => onSelect(service)}
      >
        Seleccionar
      </button>
    </div>
  );
}