         import React, { useState } from "react";

export default function BookingForm({ onSubmit, initialData = {} }) {
  const [name, setName] = useState(initialData.name || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Ingresa un email válido.");
      return;
    }
    setError("");
    onSubmit({ name, email, phone });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4">
      <h4 className="mb-4 font-semibold text-primary-700">
        Completa tus datos
      </h4>

      {error && <p className="mb-2 text-red-600">{error}</p>}

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre y Apellido
        </label>
        <input
          type="text"
          className="w-full rounded-md border-gray-300 focus:ring-primary-500 focus:border-primary-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej.: María Pérez"
          required
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          className="w-full rounded-md border-gray-300 focus:ring-primary-500 focus:border-primary-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tucorreo@ejemplo.com"
          required
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono
        </label>
        <input
          type="tel"
          className="w-full rounded-md border-gray-300 focus:ring-primary-500 focus:border-primary-500"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+56912345678"
          required
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        Continuar
      </button>
    </form>
  );
}