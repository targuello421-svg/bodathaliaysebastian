# Lista de confirmados (RSVP) → Hoja de Google

Las confirmaciones de la web se guardarán como filas en una hoja de cálculo tuya:

| Fecha | Nombre | Asiste | Mensaje |
|-------|--------|--------|---------|

Solo hay que hacer esto **una vez** (10 minutos).

---

## Paso 1 — Crear la hoja
1. Entra en https://sheets.google.com y crea una **hoja nueva** en blanco.
2. Ponle nombre, p. ej. `Confirmaciones boda`.

## Paso 2 — Pegar el script
1. En esa hoja: menú **Extensiones → Apps Script**.
2. Borra el código de ejemplo que aparece.
3. Abre el archivo **`google-apps-script.gs`** de este proyecto, copia TODO su contenido y pégalo.
4. Pulsa el icono de **guardar** (💾).

## Paso 3 — Publicar como aplicación web
1. Arriba a la derecha: **Implementar → Nueva implementación**.
2. En el engranaje ⚙ (tipo) elige **Aplicación web**.
3. Configura:
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** **Cualquier persona**  ← importante
4. Pulsa **Implementar**. Google te pedirá **autorizar** (acepta; si sale "no verificado", entra en *Configuración avanzada → Ir a … (no seguro)* — es tu propio script).
5. Copia la **URL de la aplicación web** (termina en `/exec`).

## Paso 4 — Pegar la URL en la web
1. Abre **`script.js`** del proyecto.
2. En `CONFIG`, pega la URL en `rsvpEndpoint`:
   ```js
   rsvpEndpoint: 'https://script.google.com/macros/s/AAAA.../exec',
   ```
3. Guarda. ¡Listo!

## Comprobar que funciona
- Abre tu web, rellena el RSVP y pulsa **Confirmar asistencia**.
- Vuelve a la hoja de Google: debería aparecer una fila nueva. 🎉
- También puedes abrir la URL `/exec` en el navegador: debe decir “RSVP boda activo ✓”.

---

### Notas
- Mientras `rsvpEndpoint` esté vacío, el botón usa **WhatsApp** como respaldo.
- Si cambias el `.gs` más adelante, haz **Implementar → Gestionar implementaciones → editar → Nueva versión** (si creas una implementación nueva, la URL cambia y hay que volver a pegarla).
- ¿Quieres aviso por email con cada confirmación? Se puede añadir `MailApp.sendEmail(...)` dentro del script. Dímelo y lo agrego.
