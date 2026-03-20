'use strict';

// ═══════════════════════════════════════════════════
// AppRC — Servidor principal
// STRACON · SSOMA · v1.0
// ═══════════════════════════════════════════════════

const express    = require('express');
const cors       = require('cors');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
const { v4: uuidv4 } = require('uuid');
const Database   = require('better-sqlite3');
const ExcelJS    = require('exceljs');
const nodemailer = require('nodemailer');

const RC_CATALOG = require('./data/rc_catalog');

// ─── CONFIG ───────────────────────────────────────
const PORT       = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'apprc_stracon_2026_secret';
const UPLOADS_DIR = path.join(__dirname, 'uploads');
// DB: prioridad a variable de entorno, luego carpeta data/, luego /tmp como fallback
// En Windows/Linux/Mac nativos, data/apprc.db funciona directamente.
// En VM con filesystem FUSE/montado que no soporta SQLite, usar DB_PATH=/tmp/apprc_data.db
const DB_PATH    = process.env.DB_PATH || path.join(__dirname, 'data', 'apprc.db');

// Email config — ajustar con datos reales de SMTP
const SMTP_CONFIG = {
  host:    process.env.SMTP_HOST || 'smtp.gmail.com',
  port:    parseInt(process.env.SMTP_PORT || '587'),
  secure:  false,
  auth: {
    user:  process.env.SMTP_USER || '',
    pass:  process.env.SMTP_PASS || '',
  },
};
const SSOMA_EMAIL  = process.env.SSOMA_EMAIL  || 'ssoma@stracon.com';
const FROM_EMAIL   = process.env.FROM_EMAIL   || 'apprc@stracon.com';
const EMAIL_ACTIVE = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

// Asegurar carpeta uploads
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ─── BASE DE DATOS ────────────────────────────────
// Asegurar que la carpeta data existe
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

let db;
let dbActualPath = DB_PATH;
try {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
} catch (e) {
  // Fallback: filesystem no soporta WAL (FUSE/red). Usar carpeta temp persistente.
  const fallbackPath = path.join(require('os').tmpdir(), 'apprc_data.db');
  dbActualPath = fallbackPath;
  console.warn(`⚠ Filesystem no compatible con WAL: ${e.message}`);
  console.warn(`  Usando DB en: ${fallbackPath}`);
  db = new Database(fallbackPath);
  db.pragma('journal_mode = DELETE');
  db.pragma('foreign_keys = ON');
}

db.exec(`
  CREATE TABLE IF NOT EXISTS maestro_personal (
    id          TEXT PRIMARY KEY,
    nombre      TEXT NOT NULL,
    tipo_doc    TEXT DEFAULT 'DNI',
    dni         TEXT UNIQUE NOT NULL,
    cargo       TEXT,
    agrupador   TEXT,
    correo      TEXT,
    es_supervisor INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS registros (
    id              TEXT PRIMARY KEY,
    fecha_hora      TEXT NOT NULL,
    fecha_firma     TEXT,
    usuario_correo  TEXT NOT NULL,
    supervisor_id   TEXT,
    supervisor_nombre TEXT,
    supervisor_cargo  TEXT,
    supervisor_dni    TEXT,
    supervisor_agrupador TEXT,
    firma_imagen    TEXT,
    firma_texto     TEXT,
    gerencia        TEXT DEFAULT 'Construcción',
    lugar           TEXT,
    tarea           TEXT,
    fecha_registro  TEXT,
    rc_codigo       TEXT NOT NULL,
    rc_nombre       TEXT NOT NULL,
    estado          TEXT DEFAULT 'borrador',
    correo_supervisor_ok INTEGER DEFAULT 0,
    correo_ssoma_ok      INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS registro_subpuntos (
    id              TEXT PRIMARY KEY,
    registro_id     TEXT NOT NULL REFERENCES registros(id),
    subpunto_id     TEXT NOT NULL,
    subpunto_num    TEXT,
    subpunto_desc   TEXT,
    categoria_num   TEXT,
    categoria_nombre TEXT,
    respuesta       TEXT,
    evidencia_url   TEXT,
    evidencia_tipo  TEXT,
    plan_accion     TEXT,
    responsable_id  TEXT,
    responsable_nombre TEXT,
    responsable_correo TEXT,
    observacion     TEXT,
    fecha_hora_resp TEXT
  );

  CREATE TABLE IF NOT EXISTS registro_trabajadores (
    id              TEXT PRIMARY KEY,
    registro_id     TEXT NOT NULL REFERENCES registros(id),
    trabajador_nombre TEXT NOT NULL,
    trabajador_tipo_doc TEXT,
    trabajador_dni  TEXT,
    trabajador_cargo TEXT,
    trabajador_agrupador TEXT
  );
`);

// ─── VERIFICAR / AUTO-IMPORTAR PERSONAL ───────────
const existingPersonal = db.prepare('SELECT COUNT(*) as n FROM maestro_personal').get();
const supervisoresConCorreo = db.prepare("SELECT COUNT(*) as n FROM maestro_personal WHERE es_supervisor=1 AND correo IS NOT NULL").get();
if (existingPersonal.n === 0) {
  // Auto-importar desde Excel al arrancar (busca dentro del proyecto o en carpeta padre)
  const excelCandidates = [
    path.join(__dirname, 'data', 'MASTER_PERSONAL.xlsx'),
    path.join(__dirname, '..', 'MASTER DE PERSONAL- APP RC-con correo.xlsx'),
  ];
  const excelPath = excelCandidates.find(p => fs.existsSync(p));
  if (excelPath) {
    console.log('⏳ Personal vacío — importando desde Excel automáticamente...');
    try {
      require('child_process').execSync(
        `node "${path.join(__dirname,'importar_personal.js')}" --limpiar`,
        { stdio: 'inherit', env: { ...process.env, DB_PATH: dbActualPath } }
      );
    } catch(e) {
      console.warn('⚠ Auto-importación falló:', e.message);
    }
  } else {
    console.warn('⚠ Personal vacío. Coloque MASTER_PERSONAL.xlsx en data/ y reinicie.');
  }
} else {
  console.log(`✔ Personal cargado: ${existingPersonal.n} personas (${supervisoresConCorreo.n} supervisores con acceso)`);
}

// ─── MULTER — almacenamiento de fotos ────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { registroId, subpuntoId } = req.body;
    const fecha = new Date().toISOString().slice(0,10);
    const rcCode = (registroId || 'RC_DESCONOCIDO').split('-')[0] || 'RC';
    const carpeta = path.join(UPLOADS_DIR, fecha, rcCode, registroId || 'temp');
    fs.mkdirSync(carpeta, { recursive: true });
    cb(null, carpeta);
  },
  filename: (req, file, cb) => {
    const { subpuntoId, tipo } = req.body;
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${(subpuntoId || 'sp')}_${tipo || 'ev'}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });

// ─── APP EXPRESS ──────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

// ─── MIDDLEWARE AUTH ──────────────────────────────
function authMiddleware(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Sin autorización' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// ═══════════════════════════════════════════════════
// RUTAS — AUTH
// ═══════════════════════════════════════════════════

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) return res.status(400).json({ error: 'Correo y contraseña requeridos' });

  const persona = db.prepare('SELECT * FROM maestro_personal WHERE LOWER(correo) = LOWER(?)').get(correo.trim());
  if (!persona) return res.status(401).json({ error: 'Usuario no encontrado. Contacte al administrador.' });

  // En fase piloto: contraseña = DNI
  if (password.trim() !== persona.dni) {
    return res.status(401).json({ error: 'Contraseña incorrecta. Verifique su DNI.' });
  }

  const token = jwt.sign(
    { id: persona.id, correo: persona.correo, nombre: persona.nombre,
      cargo: persona.cargo, dni: persona.dni, agrupador: persona.agrupador,
      es_supervisor: persona.es_supervisor },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  const userPayload = {
    id: persona.id, nombre: persona.nombre, cargo: persona.cargo,
    dni: persona.dni, agrupador: persona.agrupador, correo: persona.correo,
    es_supervisor: persona.es_supervisor
  };
  // Devolver tanto "user" (inglés, para el frontend) como "usuario" (retrocompatible)
  res.json({ token, user: userPayload, usuario: userPayload });
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const p = db.prepare('SELECT * FROM maestro_personal WHERE id = ?').get(req.user.id);
  if (!p) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json({ id: p.id, nombre: p.nombre, cargo: p.cargo, dni: p.dni,
             agrupador: p.agrupador, correo: p.correo, es_supervisor: p.es_supervisor });
});

// ═══════════════════════════════════════════════════
// RUTAS — RC CATALOG
// ═══════════════════════════════════════════════════

// GET /api/rc — lista de todos los RC
app.get('/api/rc', authMiddleware, (req, res) => {
  const list = RC_CATALOG.map(rc => ({
    code: rc.code,
    name: rc.name,
    totalSubpoints: rc.categories.reduce((acc, c) => acc + c.subpoints.length, 0),
  }));
  res.json(list);
});

// GET /api/rc/:code — detalle completo de un RC
app.get('/api/rc/:code', authMiddleware, (req, res) => {
  const rc = RC_CATALOG.find(r => r.code.toUpperCase() === req.params.code.toUpperCase());
  if (!rc) return res.status(404).json({ error: 'RC no encontrado' });
  res.json(rc);
});

// ═══════════════════════════════════════════════════
// RUTAS — PERSONAL
// ═══════════════════════════════════════════════════

// GET /api/personal — todos los trabajadores (excluye al usuario logueado)
app.get('/api/personal', authMiddleware, (req, res) => {
  const q = req.query.q || '';
  const agrupador = req.query.agrupador || '';
  let sql = 'SELECT * FROM maestro_personal WHERE id != ?';
  const params = [req.user.id];
  if (q) { sql += ' AND (UPPER(nombre) LIKE ? OR dni LIKE ?)'; params.push(`%${q.toUpperCase()}%`, `%${q}%`); }
  if (agrupador) { sql += ' AND agrupador = ?'; params.push(agrupador); }
  sql += ' ORDER BY nombre';
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// GET /api/personal/supervisores — solo supervisores (para dropdown de responsables)
app.get('/api/personal/supervisores', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM maestro_personal WHERE es_supervisor = 1 ORDER BY nombre').all();
  res.json(rows);
});

// GET /api/personal/agrupadores — lista de agrupadores únicos
app.get('/api/personal/agrupadores', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT DISTINCT agrupador FROM maestro_personal WHERE agrupador IS NOT NULL ORDER BY agrupador').all();
  res.json(rows.map(r => r.agrupador));
});

// ═══════════════════════════════════════════════════
// RUTAS — REGISTROS
// ═══════════════════════════════════════════════════

// POST /api/registro — crear nuevo registro (borrador)
app.post('/api/registro', authMiddleware, (req, res) => {
  const { rcCodigo, gerencia, lugar, tarea, fechaRegistro } = req.body;
  const rc = RC_CATALOG.find(r => r.code === rcCodigo);
  if (!rc) return res.status(400).json({ error: 'RC inválido' });

  const id = `${rcCodigo}-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Date.now().toString().slice(-4)}`;
  const ahora = new Date().toISOString();

  db.prepare(`INSERT INTO registros
    (id,fecha_hora,usuario_correo,supervisor_id,supervisor_nombre,supervisor_cargo,
     supervisor_dni,supervisor_agrupador,gerencia,lugar,tarea,fecha_registro,rc_codigo,rc_nombre,estado)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'borrador')`).run(
    id, ahora, req.user.correo,
    req.user.id, req.user.nombre, req.user.cargo,
    req.user.dni, req.user.agrupador,
    gerencia || 'Construcción', lugar || '', tarea || '',
    fechaRegistro || ahora.slice(0,10),
    rcCodigo, rc.name
  );

  // Pre-crear filas de subpuntos para cada criterio
  const insertSp = db.prepare(`INSERT INTO registro_subpuntos
    (id,registro_id,subpunto_id,subpunto_num,subpunto_desc,categoria_num,categoria_nombre)
    VALUES (?,?,?,?,?,?,?)`);
  const txSp = db.transaction(() => {
    for (const cat of rc.categories) {
      for (const sp of cat.subpoints) {
        insertSp.run(uuidv4(), id, sp.id, sp.n, sp.desc, cat.number, cat.name);
      }
    }
  });
  txSp();

  res.json({ id, mensaje: 'Registro creado' });
});

// GET /api/registro/:id — obtener registro completo
app.get('/api/registro/:id', authMiddleware, (req, res) => {
  const reg = db.prepare('SELECT * FROM registros WHERE id = ?').get(req.params.id);
  if (!reg) return res.status(404).json({ error: 'Registro no encontrado' });
  const subpuntos   = db.prepare('SELECT * FROM registro_subpuntos WHERE registro_id = ? ORDER BY subpunto_num').all(req.params.id);
  const trabajadores = db.prepare('SELECT * FROM registro_trabajadores WHERE registro_id = ?').all(req.params.id);
  res.json({ ...reg, subpuntos, trabajadores });
});

// PUT /api/registro/:id/subpunto — guardar respuesta de un subpunto
app.put('/api/registro/:id/subpunto', authMiddleware, (req, res) => {
  const { subpuntoId, respuesta, planAccion, responsableId, observacion } = req.body;

  // Buscar responsable si fue seleccionado
  let responsableNombre = null, responsableCorreo = null;
  if (responsableId) {
    const resp = db.prepare('SELECT * FROM maestro_personal WHERE id = ?').get(responsableId);
    if (resp) { responsableNombre = resp.nombre; responsableCorreo = resp.correo; }
  }

  db.prepare(`UPDATE registro_subpuntos SET
    respuesta=?, plan_accion=?,
    responsable_id=?, responsable_nombre=?, responsable_correo=?,
    observacion=?, fecha_hora_resp=?
    WHERE registro_id=? AND subpunto_id=?`).run(
    (respuesta || '').toLowerCase(), planAccion || null,
    responsableId || null, responsableNombre, responsableCorreo,
    observacion || null, new Date().toISOString(),
    req.params.id, subpuntoId
  );
  res.json({ ok: true });
});

// PUT /api/registro/:id/evidencia — actualizar URL de evidencia de un subpunto
app.put('/api/registro/:id/evidencia', authMiddleware, (req, res) => {
  const { subpuntoId, evidenciaUrl, evidenciaTipo } = req.body;
  db.prepare(`UPDATE registro_subpuntos SET evidencia_url=?, evidencia_tipo=?
    WHERE registro_id=? AND subpunto_id=?`).run(
    evidenciaUrl, evidenciaTipo || 'cumplimiento', req.params.id, subpuntoId
  );
  res.json({ ok: true });
});

// POST /api/registro/:id/trabajadores — guardar lista de trabajadores
app.post('/api/registro/:id/trabajadores', authMiddleware, (req, res) => {
  const { trabajadores } = req.body; // array de {id, nombre, dni, cargo, agrupador, tipo_doc}
  if (!Array.isArray(trabajadores) || trabajadores.length < 1)
    return res.status(400).json({ error: 'Se requiere al menos 1 trabajador' });

  db.prepare('DELETE FROM registro_trabajadores WHERE registro_id = ?').run(req.params.id);
  const ins = db.prepare(`INSERT INTO registro_trabajadores
    (id,registro_id,trabajador_nombre,trabajador_tipo_doc,trabajador_dni,trabajador_cargo,trabajador_agrupador)
    VALUES (?,?,?,?,?,?,?)`);
  const tx = db.transaction(() => {
    for (const t of trabajadores) {
      ins.run(uuidv4(), req.params.id, t.nombre, t.tipo_doc||'DNI', t.dni, t.cargo, t.agrupador);
    }
  });
  tx();
  res.json({ ok: true });
});

// POST /api/registro/:id/firma — guardar imagen de firma (base64)
app.post('/api/registro/:id/firma', authMiddleware, (req, res) => {
  const { firmaBase64 } = req.body;
  if (!firmaBase64) return res.status(400).json({ error: 'Firma requerida' });

  // Guardar imagen de firma
  const reg = db.prepare('SELECT * FROM registros WHERE id = ?').get(req.params.id);
  if (!reg) return res.status(404).json({ error: 'Registro no encontrado' });

  const firmaDir = path.join(UPLOADS_DIR, reg.fecha_registro || new Date().toISOString().slice(0,10), reg.rc_codigo, req.params.id);
  fs.mkdirSync(firmaDir, { recursive: true });
  const firmaPath = path.join(firmaDir, 'firma_digital.png');
  const base64Data = firmaBase64.replace(/^data:image\/\w+;base64,/, '');
  fs.writeFileSync(firmaPath, Buffer.from(base64Data, 'base64'));

  const firmaUrl = `/uploads/${reg.fecha_registro || new Date().toISOString().slice(0,10)}/${reg.rc_codigo}/${req.params.id}/firma_digital.png`;
  const ahora   = new Date();
  const firmaTxt = `Firmado digitalmente por: ${reg.supervisor_nombre} | Cargo: ${reg.supervisor_cargo} | DNI: ${reg.supervisor_dni} | Fecha: ${ahora.toLocaleDateString('es-PE')} | Hora: ${ahora.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})} | RC: ${reg.rc_codigo} — ${reg.rc_nombre} | Lugar: ${reg.lugar}`;

  db.prepare(`UPDATE registros SET firma_imagen=?, firma_texto=?, fecha_firma=? WHERE id=?`).run(
    firmaUrl, firmaTxt, ahora.toISOString(), req.params.id
  );
  res.json({ ok: true, firmaUrl, firmaTxt });
});

// ─── UPLOAD DE FOTO ───────────────────────────────
app.post('/api/upload', authMiddleware, upload.single('foto'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });
  const fecha   = new Date().toISOString().slice(0,10);
  const rcCode  = (req.body.registroId || 'RC').split('-')[0];
  const regId   = req.body.registroId || 'temp';
  const url     = `/uploads/${fecha}/${rcCode}/${regId}/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

// ─── UPLOAD BASE64 (alternativo, más simple para móvil) ──
app.post('/api/upload-base64', authMiddleware, (req, res) => {
  const { base64, registroId, subpuntoId, tipo, ext } = req.body;
  if (!base64) return res.status(400).json({ error: 'Sin datos' });
  const fecha   = new Date().toISOString().slice(0,10);
  const rcCode  = (registroId || 'RC').split('-')[0] || 'RC';
  const dir     = path.join(UPLOADS_DIR, fecha, rcCode, registroId || 'temp');
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${subpuntoId || 'sp'}_${tipo || 'ev'}.${ext || 'jpg'}`;
  const data = base64.replace(/^data:image\/\w+;base64,/, '');
  fs.writeFileSync(path.join(dir, filename), Buffer.from(data, 'base64'));
  const url = `/uploads/${fecha}/${rcCode}/${registroId || 'temp'}/${filename}`;
  res.json({ url, filename });
});

// ═══════════════════════════════════════════════════
// RUTA FINAL — FINALIZAR REGISTRO (Excel + Emails)
// ═══════════════════════════════════════════════════

app.post('/api/registro/:id/finalizar', authMiddleware, async (req, res) => {
  const reg = db.prepare('SELECT * FROM registros WHERE id = ?').get(req.params.id);
  if (!reg) return res.status(404).json({ error: 'Registro no encontrado' });

  const subpuntos    = db.prepare('SELECT * FROM registro_subpuntos WHERE registro_id = ? ORDER BY subpunto_num').all(req.params.id);
  const trabajadores = db.prepare('SELECT * FROM registro_trabajadores WHERE registro_id = ?').all(req.params.id);

  // Verificar que todos los subpuntos tienen respuesta
  const sinResponder = subpuntos.filter(s => !s.respuesta);
  if (sinResponder.length > 0) return res.status(400).json({ error: `${sinResponder.length} subpunto(s) sin responder` });

  // Generar Excel
  let excelPath, excelFilename;
  try {
    ({ path: excelPath, filename: excelFilename } = await generarExcel(reg, subpuntos, trabajadores));
  } catch (e) {
    console.error('Error generando Excel:', e.message);
    return res.status(500).json({ error: 'Error generando Excel: ' + e.message });
  }

  // Recopilar destinatarios de constancia
  const destinatariosConstancia = [{ nombre: reg.supervisor_nombre, correo: reg.usuario_correo }];
  const responsablesUnicos = [...new Map(
    subpuntos.filter(s => s.respuesta === 'no' && s.responsable_correo)
             .map(s => [s.responsable_correo, { nombre: s.responsable_nombre, correo: s.responsable_correo }])
  ).values()];
  destinatariosConstancia.push(...responsablesUnicos);

  // Enviar correos
  let emailsEnviados = [];
  let emailError = null;
  if (EMAIL_ACTIVE) {
    try {
      const transporter = nodemailer.createTransport(SMTP_CONFIG);
      // 1. Constancia al supervisor
      await transporter.sendMail({
        from: `AppRC STRACON <${FROM_EMAIL}>`,
        to:   reg.usuario_correo,
        subject: `[AppRC] Constancia de Registro — ${reg.rc_codigo} — ${reg.fecha_registro}`,
        html:  buildConstanciaHtml(reg, subpuntos, trabajadores, 'supervisor'),
      });
      emailsEnviados.push(reg.usuario_correo);

      // 2. Notificación a cada responsable de acciones pendientes
      for (const resp of responsablesUnicos) {
        const spsAsignados = subpuntos.filter(s => s.responsable_correo === resp.correo);
        await transporter.sendMail({
          from: `AppRC STRACON <${FROM_EMAIL}>`,
          to:   resp.correo,
          subject: `[AppRC] Acción pendiente asignada — ${reg.rc_codigo} — ${reg.fecha_registro}`,
          html:  buildConstanciaHtml(reg, spsAsignados, [], 'responsable', resp.nombre),
        });
        emailsEnviados.push(resp.correo);
      }

      // 3. Excel a SSOMA
      await transporter.sendMail({
        from: `AppRC STRACON <${FROM_EMAIL}>`,
        to:   SSOMA_EMAIL,
        subject: `[AppRC] Consolidado ${reg.rc_codigo} — ${reg.fecha_registro} — ${reg.supervisor_nombre}`,
        html: `<p>Se adjunta el consolidado del levantamiento RC:<br><b>${reg.rc_codigo} — ${reg.rc_nombre}</b><br>Supervisor: ${reg.supervisor_nombre} | Fecha: ${reg.fecha_registro}</p>`,
        attachments: [{ filename: excelFilename, path: excelPath }],
      });
      emailsEnviados.push(SSOMA_EMAIL);
    } catch (e) {
      emailError = e.message;
      console.error('Error enviando emails:', e.message);
    }
  } else {
    console.log('📧 Email no configurado — guardando constancia localmente');
    const logPath = path.join(__dirname, 'data', `email_log_${req.params.id}.json`);
    fs.writeFileSync(logPath, JSON.stringify({ reg, subpuntos, trabajadores, destinatariosConstancia, excelPath }, null, 2));
  }

  // Marcar registro como completado
  db.prepare(`UPDATE registros SET estado='completado', correo_supervisor_ok=?, correo_ssoma_ok=? WHERE id=?`)
    .run(EMAIL_ACTIVE ? 1 : 0, EMAIL_ACTIVE ? 1 : 0, req.params.id);

  res.json({
    ok: true,
    excelUrl:  `/uploads/${path.relative(UPLOADS_DIR, excelPath)}`,
    excelFilename,
    emailsEnviados,
    emailError,
    emailConfigured: EMAIL_ACTIVE,
    resumen: {
      si:    subpuntos.filter(s => s.respuesta === 'si').length,
      no:    subpuntos.filter(s => s.respuesta === 'no').length,
      na:    subpuntos.filter(s => s.respuesta === 'na').length,
      total: subpuntos.length,
    }
  });
});

// ─── GET registros del usuario actual ──────────────
app.get('/api/mis-registros', authMiddleware, (req, res) => {
  const rows = db.prepare(`SELECT id,rc_codigo,rc_nombre,lugar,fecha_registro,estado,fecha_hora
    FROM registros WHERE usuario_correo=? ORDER BY fecha_hora DESC LIMIT 20`).all(req.user.correo);
  res.json(rows);
});

// ─── GENERAR EXCEL ────────────────────────────────
async function generarExcel(reg, subpuntos, trabajadores) {
  const wb  = new ExcelJS.Workbook();
  wb.creator = 'AppRC — STRACON SSOMA';
  wb.created = new Date();

  // ─ Hoja 1: Datos del registro ─
  const ws1 = wb.addWorksheet('Registro RC');
  ws1.columns = [
    { header: 'Fecha Registro',       key: 'fecha_registro',    width: 14 },
    { header: 'Hora',                 key: 'hora',              width: 10 },
    { header: 'ID Registro',          key: 'id',                width: 28 },
    { header: 'Gerencia',             key: 'gerencia',          width: 14 },
    { header: 'Lugar',                key: 'lugar',             width: 24 },
    { header: 'Tarea',                key: 'tarea',             width: 30 },
    { header: 'Usuario',              key: 'usuario_correo',    width: 28 },
    { header: 'RC Código',            key: 'rc_codigo',         width: 10 },
    { header: 'RC Nombre',            key: 'rc_nombre',         width: 28 },
    { header: 'Categoría Nro.',       key: 'cat_num',           width: 12 },
    { header: 'Categoría Nombre',     key: 'cat_nombre',        width: 26 },
    { header: 'Subpunto Nro.',        key: 'sp_num',            width: 12 },
    { header: 'Subpunto Descripción', key: 'sp_desc',           width: 50 },
    { header: 'Respuesta',            key: 'respuesta',         width: 12 },
    { header: 'Tipo Evidencia',       key: 'ev_tipo',           width: 20 },
    { header: 'URL Evidencia',        key: 'ev_url',            width: 40 },
    { header: 'Plan de Acción',       key: 'plan_accion',       width: 40 },
    { header: 'Responsable Nombre',   key: 'resp_nombre',       width: 28 },
    { header: 'Responsable Correo',   key: 'resp_correo',       width: 28 },
    { header: 'Observación',          key: 'observacion',       width: 30 },
    { header: 'Supervisor Nombre',    key: 'sup_nombre',        width: 28 },
    { header: 'Supervisor DNI',       key: 'sup_dni',           width: 14 },
    { header: 'Supervisor Cargo',     key: 'sup_cargo',         width: 24 },
    { header: 'Supervisor Agrupador', key: 'sup_agrup',         width: 20 },
    { header: 'Firma Digital',        key: 'firma_texto',       width: 50 },
    { header: 'Fecha Firma',          key: 'fecha_firma',       width: 20 },
  ];

  // Encabezado con color
  ws1.getRow(1).eachCell(cell => {
    cell.fill   = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF1F4E79' } };
    cell.font   = { bold:true, color:{ argb:'FFFFFFFF' }, size:10 };
    cell.border = { top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} };
    cell.alignment = { vertical:'middle', horizontal:'center', wrapText:true };
  });
  ws1.getRow(1).height = 32;

  const ahora = new Date(reg.fecha_firma || reg.fecha_hora);
  for (const sp of subpuntos) {
    const row = ws1.addRow({
      fecha_registro: reg.fecha_registro,
      hora:           ahora.toLocaleTimeString('es-PE', { hour:'2-digit', minute:'2-digit' }),
      id:             reg.id,
      gerencia:       reg.gerencia,
      lugar:          reg.lugar,
      tarea:          reg.tarea,
      usuario_correo: reg.usuario_correo,
      rc_codigo:      reg.rc_codigo,
      rc_nombre:      reg.rc_nombre,
      cat_num:        sp.categoria_num,
      cat_nombre:     sp.categoria_nombre,
      sp_num:         sp.subpunto_num,
      sp_desc:        sp.subpunto_desc,
      respuesta:      (sp.respuesta || '').toUpperCase(),
      ev_tipo:        sp.evidencia_tipo || '',
      ev_url:         sp.evidencia_url || '',
      plan_accion:    sp.plan_accion || '',
      resp_nombre:    sp.responsable_nombre || '',
      resp_correo:    sp.responsable_correo || '',
      observacion:    sp.observacion || '',
      sup_nombre:     reg.supervisor_nombre,
      sup_dni:        reg.supervisor_dni,
      sup_cargo:      reg.supervisor_cargo,
      sup_agrup:      reg.supervisor_agrupador,
      firma_texto:    reg.firma_texto,
      fecha_firma:    reg.fecha_firma ? new Date(reg.fecha_firma).toLocaleString('es-PE') : '',
    });
    // Colorear celda de respuesta
    const rCell = row.getCell('respuesta');
    if (sp.respuesta === 'si')        rCell.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFC6EFCE' } };
    else if (sp.respuesta === 'no')   rCell.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFFFC7CE' } };
    else if (sp.respuesta === 'na')   rCell.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFEEEEEE' } };
    row.alignment = { vertical:'middle', wrapText:true };
    row.height = 28;
  }
  ws1.autoFilter = { from: 'A1', to: `Z1` };
  ws1.views = [{ state: 'frozen', ySplit: 1 }];

  // ─ Hoja 2: Trabajadores ─
  const ws2 = wb.addWorksheet('Trabajadores');
  ws2.columns = [
    { header: 'ID Registro',         key: 'reg_id',    width: 28 },
    { header: 'RC Código',           key: 'rc',        width: 10 },
    { header: 'Fecha Registro',      key: 'fecha',     width: 14 },
    { header: 'Apellidos y Nombres', key: 'nombre',    width: 32 },
    { header: 'Tipo Documento',      key: 'tipo_doc',  width: 14 },
    { header: 'DNI / Documento',     key: 'dni',       width: 16 },
    { header: 'Cargo',               key: 'cargo',     width: 26 },
    { header: 'Agrupador',           key: 'agrupador', width: 20 },
  ];
  ws2.getRow(1).eachCell(cell => {
    cell.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF2E75B6' } };
    cell.font = { bold:true, color:{ argb:'FFFFFFFF' }, size:10 };
    cell.alignment = { vertical:'middle', horizontal:'center' };
  });
  ws2.getRow(1).height = 28;
  for (const t of trabajadores) {
    ws2.addRow({ reg_id: reg.id, rc: reg.rc_codigo, fecha: reg.fecha_registro,
      nombre: t.trabajador_nombre, tipo_doc: t.trabajador_tipo_doc,
      dni: t.trabajador_dni, cargo: t.trabajador_cargo, agrupador: t.trabajador_agrupador });
  }

  // ─ Hoja 3: Resumen ─
  const ws3 = wb.addWorksheet('Resumen');
  ws3.getColumn('A').width = 28;
  ws3.getColumn('B').width = 40;
  const addRes = (k, v, color) => {
    const r = ws3.addRow([k, v]);
    r.getCell(1).font = { bold: true, size: 10 };
    r.getCell(1).fill = { type:'pattern', pattern:'solid', fgColor:{ argb: color || 'FFD6E4F0' } };
    r.getCell(2).fill = { type:'pattern', pattern:'solid', fgColor:{ argb: 'FFFFFFFF' } };
    r.height = 22;
  };
  addRes('ID Registro',         reg.id,                                    'FFD6E4F0');
  addRes('Gerencia',            reg.gerencia,                              'FFD6E4F0');
  addRes('Lugar',               reg.lugar,                                 'FFD6E4F0');
  addRes('Tarea',               reg.tarea,                                 'FFD6E4F0');
  addRes('RC Evaluado',         `${reg.rc_codigo} — ${reg.rc_nombre}`,     'FFBDD7EE');
  addRes('Fecha Registro',      reg.fecha_registro,                        'FFBDD7EE');
  addRes('Supervisor',          reg.supervisor_nombre,                     'FF1F4E79');
  addRes('Cargo Supervisor',    reg.supervisor_cargo,                      'FF1F4E79');
  addRes('DNI Supervisor',      reg.supervisor_dni,                        'FF1F4E79');
  addRes('Agrupador',           reg.supervisor_agrupador,                  'FF1F4E79');
  addRes('Total SÍ',            subpuntos.filter(s=>s.respuesta==='si').length, 'FFC6EFCE');
  addRes('Total NO',            subpuntos.filter(s=>s.respuesta==='no').length, 'FFFFC7CE');
  addRes('Total N/A',           subpuntos.filter(s=>s.respuesta==='na').length, 'FFEEEEEE');
  addRes('Total Subpuntos',     subpuntos.length,                          'FFD6E4F0');
  addRes('Total Trabajadores',  trabajadores.length,                       'FFD6E4F0');
  addRes('Firma Digital',       reg.firma_texto,                           'FFFFFF99');
  // Colorear nombre supervisor en blanco
  ['G','H','I','J'].forEach(col => { ws3.getCell(`${col}1`); }); // no-op placeholder
  ws3.getRows(7, 4).forEach(r => {
    r.getCell(1).font = { bold: true, color:{ argb:'FFFFFFFF' }, size:10 };
  });

  // Guardar
  const fecha     = reg.fecha_registro || new Date().toISOString().slice(0,10);
  const excelDir  = path.join(UPLOADS_DIR, fecha, reg.rc_codigo, reg.id);
  fs.mkdirSync(excelDir, { recursive: true });
  const filename  = `AppRC_${reg.rc_codigo}_${fecha.replace(/-/g,'')}_${(reg.supervisor_nombre||'').split(',')[0].trim().replace(/\s+/g,'')}.xlsx`;
  const fullPath  = path.join(excelDir, filename);
  await wb.xlsx.writeFile(fullPath);
  return { path: fullPath, filename };
}

// ─── GENERAR HTML CONSTANCIA ──────────────────────
function buildConstanciaHtml(reg, subpuntos, trabajadores, tipo, destinatarioNombre) {
  const fecha = new Date(reg.fecha_firma || reg.fecha_hora);
  const spSi  = subpuntos.filter(s => s.respuesta === 'si');
  const spNo  = subpuntos.filter(s => s.respuesta === 'no');
  const spNa  = subpuntos.filter(s => s.respuesta === 'na');

  const trabajadoresHtml = trabajadores.map(t =>
    `<tr><td>${t.trabajador_nombre}</td><td>${t.trabajador_dni}</td><td>${t.trabajador_cargo}</td></tr>`
  ).join('');

  const spNoHtml = spNo.map(s =>
    `<tr><td>${s.subpunto_num}</td><td>${s.subpunto_desc}</td><td>${s.plan_accion||''}</td><td>${s.responsable_nombre||''}</td></tr>`
  ).join('');

  const saludoNombre = tipo === 'responsable' ? destinatarioNombre : reg.supervisor_nombre;
  const mensajePrincipal = tipo === 'responsable'
    ? `<p>Usted ha sido asignado como <strong>responsable de acciones correctivas</strong> en el siguiente levantamiento de Riesgo Crítico:</p>`
    : `<p>Se confirma el registro completado del siguiente levantamiento de Riesgo Crítico:</p>`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:20px">
    <div style="background:#1F4E79;color:#fff;padding:20px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;font-size:22px">AppRC — STRACON SSOMA</h1>
      <p style="margin:4px 0 0;opacity:.8">Constancia de Registro de Riesgo Crítico</p>
    </div>
    <div style="border:1px solid #ddd;border-top:none;padding:20px;border-radius:0 0 8px 8px">
      <p>Estimado/a <strong>${saludoNombre}</strong>,</p>
      ${mensajePrincipal}
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:7px 10px;background:#f0f7ff;font-weight:bold;width:40%">RC Evaluado</td><td style="padding:7px 10px">${reg.rc_codigo} — ${reg.rc_nombre}</td></tr>
        <tr><td style="padding:7px 10px;background:#f0f7ff;font-weight:bold">Lugar</td><td style="padding:7px 10px">${reg.lugar}</td></tr>
        <tr><td style="padding:7px 10px;background:#f0f7ff;font-weight:bold">Tarea</td><td style="padding:7px 10px">${reg.tarea}</td></tr>
        <tr><td style="padding:7px 10px;background:#f0f7ff;font-weight:bold">Fecha y Hora</td><td style="padding:7px 10px">${fecha.toLocaleDateString('es-PE')} ${fecha.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})}</td></tr>
        <tr><td style="padding:7px 10px;background:#f0f7ff;font-weight:bold">Supervisor Firmante</td><td style="padding:7px 10px">${reg.supervisor_nombre}</td></tr>
        <tr><td style="padding:7px 10px;background:#f0f7ff;font-weight:bold">Cargo</td><td style="padding:7px 10px">${reg.supervisor_cargo}</td></tr>
        <tr><td style="padding:7px 10px;background:#f0f7ff;font-weight:bold">DNI</td><td style="padding:7px 10px">${reg.supervisor_dni}</td></tr>
      </table>
      <p style="background:#f8f8f8;border-left:4px solid #2E75B6;padding:10px 14px;font-style:italic;font-size:12px">${reg.firma_texto||''}</p>
      ${spNo.length > 0 ? `<h3 style="color:#9C0006">Subpuntos con acción correctiva pendiente</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <tr style="background:#2E75B6;color:#fff"><th style="padding:6px">Nro.</th><th style="padding:6px">Criterio</th><th style="padding:6px">Plan de Acción</th><th style="padding:6px">Responsable</th></tr>
          ${spNoHtml}</table>` : ''}
      ${trabajadores.length > 0 ? `<h3 style="color:#1F4E79">Trabajadores vinculados al registro</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <tr style="background:#1F4E79;color:#fff"><th style="padding:6px">Nombre</th><th style="padding:6px">DNI</th><th style="padding:6px">Cargo</th></tr>
          ${trabajadoresHtml}</table>` : ''}
      <p style="margin-top:24px;font-size:11px;color:#666;border-top:1px solid #eee;padding-top:12px">
        Este correo fue generado automáticamente por AppRC · STRACON SSOMA · ${new Date().toLocaleDateString('es-PE')}<br>
        ID de registro: ${reg.id}
      </p>
    </div></body></html>`;
}

// ─── CATCH-ALL → SPA ─────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── START ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n╔═══════════════════════════════════════╗`);
  console.log(`║   AppRC — STRACON SSOMA               ║`);
  console.log(`║   Servidor corriendo en puerto ${PORT}   ║`);
  console.log(`╚═══════════════════════════════════════╝`);
  console.log(`\n🌐  Abrir en: http://localhost:${PORT}`);
  console.log(`📧  Email SMTP: ${EMAIL_ACTIVE ? '✔ Configurado' : '✗ No configurado (modo log local)'}`);
  console.log(`📁  Uploads:   ${UPLOADS_DIR}`);
  console.log(`🗄️   Base de datos: ${dbActualPath}\n`);
});
