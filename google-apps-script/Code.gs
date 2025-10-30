/**
 * Script de Recordatorios de Mantenimiento — Vanessa Nails Studio
 * v1.6.0 - Versión final y limpia.
 */

const TZ = "America/Santiago";
const OWNER_EMAIL = "nailsvanessacl@gmail.com";
const SHEET_ID   = "1aE4dnWZQjEJWAMaDEfDRpACVUDU8_F9-fzd_2mSQQeM";
const SHEET_NAME = "Reservas";
const WHATSAPP_PHONE = "56991744464";

// --- FUNCIÓN PRINCIPAL DE RECORDATORIOS ---
function sendMaintenanceReminders() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) return;

  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return;
  Logger.log(`Total filas (incluyendo encabezado): ${data.length}`);

  const IDX = { NAME: 1, EMAIL: 2, SERVICE: 4, START_LOCAL: 5, END_LOCAL: 6 };
  const lastByEmail = {};
  const now = new Date();

  // 1. Encuentra la última cita de cada cliente
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    Logger.log(`Fila ${i + 1} raw: ${JSON.stringify(row)}`);
    const email = (row[IDX.EMAIL] || "").toString().trim().toLowerCase();
    if (!email) continue;

    const startDate = parseSheetDate(row[IDX.END_LOCAL] || row[IDX.START_LOCAL]);
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      Logger.log(`No se pudo interpretar fecha para ${email}: ${row[IDX.END_LOCAL]} / ${row[IDX.START_LOCAL]}`);
      continue;
    }
    if (startDate > now) continue; // ignoramos citas futuras
    Logger.log(`Fila ${i + 1}: ${email} -> ${startDate}`);

    const prev = lastByEmail[email];
    if (!prev || startDate > prev.startDate) {
      Logger.log(`Registrando última cita para ${email} en ${startDate}`);
      lastByEmail[email] = {
        name: row[IDX.NAME] || "",
        service: row[IDX.SERVICE] || "",
        startDate: startDate,
        startStr: Utilities.formatDate(startDate, TZ, "yyyy-MM-dd"),
      };
    }
  }
  Logger.log(`Clientes con última cita registrada: ${Object.keys(lastByEmail).length}`);

  // --- INICIO DE MEJORA DE CÓDIGO ---
  // Función auxiliar para obtener una fecha "solo día" en la zona horaria especificada.
  // Esto asegura que las comparaciones de días sean consistentes.
  const getDateOnlyInTimezone = (date, timezone) => {
    const formattedDate = Utilities.formatDate(date, timezone, "yyyy-MM-dd");
    return new Date(formattedDate); // Se interpreta como medianoche UTC, pero la comparación es correcta.
  };

  const today = getDateOnlyInTimezone(now, TZ); // Obtener "hoy" a medianoche en America/Santiago
  // --- FIN DE MEJORA DE CÓDIGO ---

  // 2. Revisa cada cliente y envía recordatorio si cumple las condiciones
  Object.keys(lastByEmail).forEach(email => {
    const rec = lastByEmail[email];
    const lastDateOnly = getDateOnlyInTimezone(rec.startDate, TZ); // Obtener la fecha de la última cita a medianoche
    const diffDays = Math.floor((today.getTime() - lastDateOnly.getTime()) / (1000 * 60 * 60 * 24));
    Logger.log(`Evaluando ${rec.name} <${email}>: última cita ${rec.startStr}, diff ${diffDays} días`);

    if (diffDays >= 28 && !hasReminderLogged(email, rec.startStr, "REMINDER28")) {
      sendReminder(email, rec, diffDays, "REMINDER28", "💗 Queremos volver a verte pronto");
    } else if (diffDays >= 20 && !hasReminderLogged(email, rec.startStr, "REMINDER20")) {
      sendReminder(email, rec, diffDays, "REMINDER20", "💖 Recordatorio de Mantenimiento — Vanessa Nails Studio");
    }
  });
}

// --- FUNCIONES AUXILIARES ---

function hasReminderLogged(email, baseDateStr, type) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName("EmailLog");
  if (!sh) return false;
  const values = sh.getDataRange().getValues();
  if (values.length <= 1) return false;
  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    if ((r[1] || "").toString().trim().toLowerCase() === (email || "").trim().toLowerCase() &&
        (r[2] || "") === type &&
        (r[3] || "").toString() === baseDateStr) {
      return true;
    }
  }
  return false;
}

function logReminderSent(email, baseDateStr, type) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName("EmailLog");
  if (!sh) {
    sh = ss.insertSheet("EmailLog");
    sh.appendRow(["Timestamp", "Email", "Type", "BaseDate", "Notes"]);
  }
  sh.appendRow([new Date(), email, type, baseDateStr, "Sent OK"]);
}

/**
 * Convierte el valor de Sheets (Date o String) en un objeto Date válido.
 * Acepta formatos ISO (2025-10-26T13:20:54.281Z) y valores DD/MM/YYYY o MM/DD/YYYY.
 */
function parseSheetDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // Intento 1: ISO 8601 u otros formatos que Date entienda nativamente
    const isoParsed = new Date(trimmed);
    if (!isNaN(isoParsed.getTime())) {
      return isoParsed;
    }

    // Intento 1b: Formato con GMT y zona entre paréntesis (ej. "Sat Aug 23 2025 10:30:00 GMT-0400 (Chile Standard Time)")
    const withoutParens = trimmed.replace(/\s*\(.*\)\s*$/, "");
    const gmtParsed = new Date(withoutParens);
    if (!isNaN(gmtParsed.getTime())) {
      return gmtParsed;
    }

    // Intento 2: formatos como DD/MM/YYYY HH:mm:ss o MM/DD/YYYY HH:mm:ss
    const match = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if (match) {
      let [ , part1, part2, yearStr, hourStr, minStr, secStr ] = match;
      const year = yearStr.length === 2 ? 2000 + parseInt(yearStr, 10) : parseInt(yearStr, 10);
      const first = parseInt(part1, 10);
      const secondPart = parseInt(part2, 10);

      // Asumimos formato latino (DD/MM) si el primer valor > 12; de lo contrario tratamos como MM/DD.
      let day, month;
      if (first > 12) {
        day = first;
        month = secondPart - 1;
      } else if (secondPart > 12) {
        month = first - 1;
        day = secondPart;
      } else {
        // Ambos <= 12: mantenemos DD/MM (comportamiento anterior)
        day = first;
        month = secondPart - 1;
      }

      const hour = hourStr ? parseInt(hourStr, 10) : 0;
      const minute = minStr ? parseInt(minStr, 10) : 0;
      const seconds = secStr ? parseInt(secStr, 10) : 0;

      const candidate = new Date(year, month, day, hour, minute, seconds);
      if (!isNaN(candidate.getTime())) {
        return candidate;
      }
    }
  }

  return null;
}

function buildMaintenanceReminderHtml({ clientName, lastDateStr, serviceName, diffDays, type }) {
  const whatsLink = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    `Hola Vanessa 💖 Quiero agendar mi *mantenimiento*. Soy ${clientName}.`
  )}`;
  const emphasis = type === "REMINDER28"
    ? `<p style="margin:14px 0;padding:12px;border-radius:10px;background:#fff7fb;border:1px solid #f5cbe0">
         <b>Ya van ${diffDays} días desde tu última sesión.</b><br>
         Nos encantaría volver a mimar tus manos; después de los 30 días solemos retirar y reconstruir
         para cuidar la salud de tus uñas, así que si puedes, agendemos juntas tu próxima cita 💖
       </p>`
    : `<div style="background:#fffaf0;border:1px solid #f2d7e2;border-radius:10px;padding:14px;margin:14px 0">
         <p style="margin:0"><b>Si superas los 30 días:</b> debemos realizar un
           <b>retiro completo</b> de la estructura anterior para evitar <b>acumulación de humedad</b>
           y prevenir <b>posibles hongos</b>. Es por tu salud y seguridad 🙏.</p>
       </div>`;

  return `
  <div style="font-family:Arial,sans-serif;color:#333;line-height:1.6">
    <div style="max-width:560px;margin:auto;border:1px solid #f2d7e2;border-radius:12px;overflow:hidden">
      <div style="background:#fef0f5;padding:16px 20px">
        <h2 style="margin:0;color:#d63384">💅 Recordatorio de Mantenimiento</h2>
      </div>
      <div style="padding:20px">
        <p>Hola <b>${clientName}</b>, ¡esperamos que estés disfrutando tus uñas! ✨</p>
        <p>Hoy se cumplen <b>${diffDays} días</b> desde tu última visita
          ${lastDateStr ? `(<b>${lastDateStr}</b>)` : ""} ${serviceName ? `para <b>${serviceName}</b>` : ""}.
        </p>
        <div style="background:#fff7fb;border:1px solid #f2d7e2;border-radius:10px;padding:14px;margin:14px 0">
          <p style="margin:0 0 8px 0"><b>Para mantenerlas perfectas:</b></p>
          <ul style="margin:0 0 0 18px;padding:0">
            <li><b>Mantenimiento ideal:</b> cada <b>21 días</b> (máximo <b>30 días</b>, sin excepción).</li>
            <li><b>Beneficios:</b> forma y brillo intactos, menos quiebres/desprendimientos y uñas más saludables.</li>
            <li><b>Bienestar personal:</b> manos siempre prolijas y listas para todo 💖.</li>
          </ul>
        </div>
        ${emphasis}
        <p style="margin:16px 0 10px">¿Agendamos tu mantención?</p>
        <p>
          <a href="${whatsLink}"
             style="display:inline-block;background:#d63384;color:#fff;padding:10px 16px;border-radius:8px;
                    text-decoration:none;font-weight:bold">Reservar por WhatsApp</a>
        </p>
        <p style="font-size:12px;color:#666;margin-top:18px">
          Gracias por confiar en <b>Vanessa Nails Studio</b> 💅🏻<br>
          Queremos que tus uñas siempre luzcan bellas, impecables y <b>saludables</b>.
        </p>
      </div>
    </div>
  </div>`;
}
function sendReminder(email, rec, diffDays, type, subject) {
  const html = buildMaintenanceReminderHtml({
    clientName: rec.name || "Bella",
    lastDateStr: Utilities.formatDate(rec.startDate, TZ, "dd/MM/yyyy"),
    serviceName: rec.service || "",
    diffDays,
    type,
  });

  try {
    MailApp.sendEmail({ to: email, subject, htmlBody: html });
    if (OWNER_EMAIL) {
      MailApp.sendEmail({
        to: OWNER_EMAIL,
        subject: `${subject} — ${rec.name} <${email}>`,
        htmlBody: html,
      });
    }
    logReminderSent(email, rec.startStr, type);
  } catch (err) {
    Logger.log(`ERROR al enviar correo (${type}) a ${email}: ${err}`);
  }
}
