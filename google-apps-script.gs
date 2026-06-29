/**
 * RSVP boda Sebastián & Thalía — Google Apps Script
 * Recibe las confirmaciones de la web y las añade como filas en la hoja.
 * Instalación: ver RSVP_SETUP.md
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000); // evita filas pisadas si llegan dos a la vez
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Crea la fila de cabecera la primera vez
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Fecha', 'Nombre', 'Asiste', 'Mensaje']);
    }

    var p = e.parameter || {};
    sheet.appendRow([
      new Date(),
      p.name || '',
      p.attend || '',
      p.message || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Permite abrir la URL /exec en el navegador para comprobar que está viva.
function doGet() {
  return ContentService
    .createTextOutput('RSVP boda activo ✓')
    .setMimeType(ContentService.MimeType.TEXT);
}
