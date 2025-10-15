// pages/api/gs-check.js
// VERSIÓN DE PRUEBA "HOLA MUNDO"

export default function handler(req, res) {
  // Esta función ignora todo y simplemente devuelve un mensaje de éxito.
  // Si esto funciona, significa que la API se está desplegando.
  res.status(200).json({ message: "Hola Mundo! La API está funcionando." });
}
