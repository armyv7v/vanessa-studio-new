// lib/calendarConfig.js

/**
 * Ventanas de atención para páginas:
 * - normal: 10:00–18:00 (cierre) con paso de 30'
 * - extra:  18:00–20:00 (cierre de inicio) con paso de 30' (permitimos terminar después de las 20:00)
 */
export const NORMAL_WINDOW = { openHour: 10, closeHour: 18, stepMin: 30 };
export const EXTRA_WINDOW  = { openHour: 18, closeHour: 20, stepMin: 30 };

/**
 * Determina si una fecha está permitida según reglas:
 * - Siempre permite de lunes a viernes
 * - Sábados según ENABLE_SATURDAY
 * - Domingos según ENABLED_SUNDAY_ORDINALS (si no está vacío) o ENABLE_SUNDAY_DEFAULT
 */
export function isAllowedBusinessDay(date, disabledDaysConfig = []) {
  const dow = date.getDay(); // 0=Dom ... 6=Sab
  const weekNum = Math.ceil(date.getDate() / 7);
  let dayCode = '';
  if (dow === 0) {
    dayCode = "SUN" + weekNum;
  } else if (dow === 6) {
    dayCode = "SAT" + weekNum;
  }
  return !disabledDaysConfig.includes(dayCode);
}
