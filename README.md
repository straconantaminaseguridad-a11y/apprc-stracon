# AppRC · STRACON SSOMA
**Sistema de Verificación de Riesgos Críticos**
Versión 1.0 · Marzo 2026

---

## Descripción
AppRC es una aplicación web progresiva (PWA) optimizada para móviles que permite a los inspectores de SSOMA realizar levantamientos de Riesgos Críticos en campo. El sistema cubre 28 RCs (RC5–RC32) con verificación jerárquica de subpuntos, captura de evidencias fotográficas, firma digital y envío automático de constancias por correo.

## Requisitos
- Node.js v18 o superior
- npm
- Sistema operativo: Linux, macOS o Windows

## Instalación

```bash
# 1. Entrar a la carpeta del proyecto
cd apprc

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional para correos)
cp .env.example .env
# Edite .env con sus datos SMTP si desea enviar correos automáticos

# 4. Iniciar el servidor
npm start
```

El servidor arranca en **http://localhost:3000**

## Primer Acceso

La aplicación trae 15 usuarios de prueba cargados automáticamente.

| Correo | Contraseña (DNI) | Rol |
|--------|-----------------|-----|
| c.garcia@stracon.com | 45123456 | Supervisor |
| r.vargas@stracon.com | 47234567 | Supervisora SSOMA |
| l.mendoza@stracon.com | 43876543 | Jefe de Turno |
| j.torres@stracon.com | 44567890 | Supervisor Eléctrico |
| a.huanca@stracon.com | 46789012 | Jefa de Planta |
| p.rios@stracon.com | 43987123 | Operador |

> **La contraseña inicial de cada usuario es su número de DNI.**

## Flujo de Uso

1. **Login** — Ingrese con correo y DNI como contraseña
2. **Datos Generales** — Seleccione gerencia, ingrese lugar y tarea
3. **Selección de RC** — Elija el Riesgo Crítico a verificar (RC5–RC32)
4. **Evaluación** — Responda cada subpunto: Sí / No / N/A
   - Los subpuntos con **No**: asigne responsable y plan de acción (obligatorio)
   - Capture fotos de evidencia con la cámara del dispositivo
5. **Trabajadores** — Agregue al menos 1 trabajador involucrado
6. **Firma Digital** — Firme en el área designada para confirmar el registro
7. **Confirmación** — El sistema genera el Excel y envía constancias automáticamente

## Estructura de Archivos

```
apprc/
├── server.js              # Backend principal (Express + SQLite)
├── package.json
├── .env.example           # Plantilla de configuración
├── data/
│   ├── rc_catalog.js      # Catálogo de los 28 RCs con subpuntos
│   └── apprc.db           # Base de datos SQLite (se crea automáticamente)
├── public/
│   └── index.html         # Aplicación SPA frontend
└── uploads/               # Fotos y archivos generados
    └── YYYY-MM-DD/
        └── RCxx/
            └── registro_id/
                ├── RC5-1.1_ev.jpg     # Evidencias por subpunto
                ├── firma_digital.png  # Firma del inspector
                └── AppRC_RC5_*.xlsx   # Excel consolidado
```

## Cargar Personal Real

Para reemplazar los usuarios de prueba con el personal real de STRACON, inserte los registros en la tabla `maestro_personal` de la base de datos SQLite:

```sql
INSERT INTO maestro_personal (id, nombre, tipo_doc, dni, cargo, agrupador, correo, es_supervisor)
VALUES ('uuid-unico', 'APELLIDO, Nombre', 'DNI', '12345678', 'Cargo', 'Area', 'correo@stracon.com', 0);
```

O use cualquier herramienta de gestión SQLite (DB Browser for SQLite, DBeaver, etc.) para importar desde Excel/CSV.

## Configuración de Correo

Edite el archivo `.env` con sus credenciales SMTP:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=su.correo@gmail.com
SMTP_PASS=contraseña_de_aplicacion
FROM_EMAIL=apprc@stracon.com
SSOMA_EMAIL=ssoma@stracon.com
```

> Para Gmail, genere una **Contraseña de Aplicación** en: Cuenta de Google → Seguridad → Verificación en 2 pasos → Contraseñas de aplicación

Sin configuración SMTP, el sistema guarda los datos localmente en `data/email_log_*.json`.

## Riesgos Críticos incluidos

| Código | Nombre |
|--------|--------|
| RC5 | Espacios Confinados |
| RC6 | Trabajos en Altura |
| RC7 | Izaje y Transporte de Cargas |
| RC8 | Trabajos con Energía Eléctrica |
| RC9 | Manejo de Explosivos y Voladuras |
| RC10 | Trabajos en Caliente |
| RC11 | Operación de Equipos Pesados |
| RC12 | Manejo de Materiales Peligrosos |
| RC13 | Trabajos de Perforación |
| RC14 | Sostenimiento y Shotcrete |
| RC15–RC32 | (ver data/rc_catalog.js) |

## Tecnologías

- **Backend:** Node.js, Express, better-sqlite3, JWT, ExcelJS, Nodemailer, Multer
- **Frontend:** HTML5, CSS3, JavaScript vanilla, Canvas API, MediaDevices API
- **Base de datos:** SQLite3
- **Exportación:** Excel (.xlsx) con 3 hojas: Registro RC, Trabajadores, Resumen

## Soporte
SSOMA STRACON · stracon.antamina.seguridad@gmail.com
