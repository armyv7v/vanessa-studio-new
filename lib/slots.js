// lib/slots.js

/**
 * Genera slots horarios.
 * - Si allowOverflowEnd = true: un slot es válido si start < closeHour; el fin puede pasar la hora de cierre
 * - Si allowOverflowEnd = false: slot válido sólo si end <= closeHour
 * - Conflicto si el intervalo [slotStart, slotEnd) se solapa con cualquier busy [{start,end}]
 */

export function generateTimeSlots({
  date,             // 'YYYY-MM-DD'
  openHour,         // 0..23
  closeHour,        // 0..23
  stepMinutes,      // 30
  durationMinutes,  // p. ej. 90
  busy = [],        // [{start,end}] en ISO
  tz = 'America/Santiago',
  allowOverflowEnd = false,
}) {
  const [Y, M, D] = date.split('-').map(Number);

  const mkLocal = (h, m = 0) => new Date(Y, M - 1, D, h, m, 0, 0);
  const dayStart = mkLocal(0, 0);
  const open = mkLocal(openHour, 0);
  const close = mkLocal(closeHour, 0);

  const normBusy = busy.map(b => ({
    start: new Date(b.start),
    end: new Date(b.end),
  }));

  const slots = [];

  // Hora inicial del primer slot del día (redondeada a step)
  let cursor = new Date(open);
  // Seguimos proponiendo inicios mientras:
  //  - allowOverflowEnd: start < close
  //  - !allowOverflowEnd: (start + duration) <= close
  const canPropose = (start) => {
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return allowOverflowEnd ? start < close : end <= close;
  };

  while (canPropose(cursor)) {
    const start = new Date(cursor);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    // conflicto: (start < bEnd && end > bStart)
    const overlapped = normBusy.some(b => start < b.end && end > b.start);

    slots.push({
      start: start.toISOString(),
      end: end.toISOString(),
      available: !overlapped,
    });

    cursor = new Date(cursor.getTime() + stepMinutes * 60000);
  }

  // Además, si el día seleccionado es hoy, ocultamos horas pasadas
  const now = new Date();
  const isSameDay =
    now.getFullYear() === Y && now.getMonth() === (M - 1) && now.getDate() === D;

  return slots.filter(s => {
    if (!isSameDay) return true;
    return new Date(s.start) > now;
  });
}
