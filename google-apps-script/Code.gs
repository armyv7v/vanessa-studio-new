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

  const IDX = { NAME: 1, EMAIL: 2, SERVICE: 4, START_LOCAL: 5 };
  const lastByEmail = {};

  // 1. Encuentra la última cita de cada cliente
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const email = (row[IDX.EMAIL] || "").toString().trim().toLowerCase();
    if (!email) continue;

    const dateObject = row[IDX.START_LOCAL];
    if (!dateObject || !(dateObject instanceof Date)) continue;

    const startDate = new Date(dateObject);

    const prev = lastByEmail[email];
    if (!prev || startDate > prev.startDate) {
      lastByEmail[email] = {
        name: row[IDX.NAME] || "",
        service: row[IDX.SERVICE] || "",
        startDate: startDate,
        startStr: Utilities.formatDate(startDate, TZ, "yyyy-MM-dd"),
      };
    }
  }

  // --- INICIO DE MEJORA DE CÓDIGO ---
  // Función auxiliar para obtener una fecha "solo día" en la zona horaria especificada.
  // Esto asegura que las comparaciones de días sean consistentes.
  const getDateOnlyInTimezone = (date, timezone) => {
    const formattedDate = Utilities.formatDate(date, timezone, "yyyy-MM-dd");
    return new Date(formattedDate); // Se interpreta como medianoche UTC, pero la comparación es correcta.
  };

  const now = new Date();
  const today = getDateOnlyInTimezone(now, TZ); // Obtener "hoy" a medianoche en America/Santiago
  // --- FIN DE MEJORA DE CÓDIGO ---

  // 2. Revisa cada cliente y envía recordatorio si cumple las condiciones
  Object.keys(lastByEmail).forEach(email => {
    const rec = lastByEmail[email];
    const lastDateOnly = getDateOnlyInTimezone(rec.startDate, TZ); // Obtener la fecha de la última cita a medianoche
    const diffDays = Math.floor((today.getTime() - lastDateOnly.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 20 && !hasReminderLogged(email, rec.startStr, "REMINDER20")) {
      const html = buildMaintenanceReminderHtml({
        clientName: rec.name || "Bella",
        lastDateStr: Utilities.formatDate(rec.startDate, TZ, "dd/MM/yyyy"),
        serviceName: rec.service || "",
        diffDays: diffDays
      });

      const subject = "💖 Recordatorio de Mantenimiento — Vanessa Nails Studio";
      try {
        MailApp.sendEmail({ to: email, subject, htmlBody: html });
        if (OWNER_EMAIL) {
          MailApp.sendEmail({ to: OWNER_EMAIL, subject: `Recordatorio enviado (${diffDays} días) — ${rec.name} <${email}>`, htmlBody: html });
        }
        logReminderSent(email, rec.startStr, "REMINDER20");
      } catch (err) {
        Logger.log(`ERROR al enviar correo a ${email}: ${err}`);
      }
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

function buildMaintenanceReminderHtml({ clientName, lastDateStr, serviceName, diffDays }) {
  const whatsLink = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    `Hola Vanessa 💖 Quiero agendar mi *mantenimiento*. Soy ${clientName}.`
  )}`;
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
        <div style="background:#fffaf0;border:1px solid #f2d7e2;border-radius:10px;padding:14px;margin:14px 0">
          <p style="margin:0"><b>Si superas los 30 días:</b> debemos realizar un
            <b>retiro completo</b> de la estructura anterior para evitar <b>acumulación de humedad</b>
            y prevenir <b>posibles hongos</b>. Es por tu salud y seguridad 🙏.</p>
        </div>
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