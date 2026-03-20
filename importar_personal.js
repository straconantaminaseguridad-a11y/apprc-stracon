'use strict';
// ═══════════════════════════════════════════════════════
// AppRC — Importador de Maestro de Personal desde Excel
// STRACON · SSOMA · v1.0
//
// Uso:
//   node importar_personal.js
//   node importar_personal.js --preview      (solo muestra, no guarda)
//   node importar_personal.js --limpiar      (borra datos previos antes de importar)
// ═══════════════════════════════════════════════════════

const ExcelJS   = require('exceljs');
const Database  = require('better-sqlite3');
const path      = require('path');
const fs        = require('fs');
const { v4: uuidv4 } = require('uuid');
const os        = require('os');

// ─── CONFIGURACIÓN ──────────────────────────────────────
// Buscar el Excel: primero dentro del proyecto, luego en la carpeta padre
const EXCEL_PATH = fs.existsSync(path.join(__dirname, 'data', 'MASTER_PERSONAL.xlsx'))
  ? path.join(__dirname, 'data', 'MASTER_PERSONAL.xlsx')
  : path.join(__dirname, '..', 'MASTER DE PERSONAL- APP RC-con correo.xlsx');
const DB_PATH    = process.env.DB_PATH || path.join(os.tmpdir(), 'apprc_data.db');

const PREVIEW  = process.argv.includes('--preview');
const LIMPIAR  = process.argv.includes('--limpiar');

console.log('\n╔══════════════════════════════════════════════════╗');
console.log('║   AppRC — Importador de Personal                ║');
console.log('╚══════════════════════════════════════════════════╝\n');
console.log(`📂 Excel:    ${EXCEL_PATH}`);
console.log(`🗄  Base de datos: ${DB_PATH}`);
if (PREVIEW)  console.log('👁  MODO PREVIEW — no se guardará nada\n');
if (LIMPIAR)  console.log('⚠  Se borrarán los datos actuales de personal\n');

// ─── VERIFICAR ARCHIVOS ─────────────────────────────────
if (!fs.existsSync(EXCEL_PATH)) {
  console.error(`\n❌ No se encontró el archivo Excel: ${EXCEL_PATH}`);
  console.error('   Coloque el archivo en la carpeta APP-RC/ e intente de nuevo.\n');
  process.exit(1);
}

// ─── ABRIR BASE DE DATOS ────────────────────────────────
let db;
try {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
} catch (e) {
  console.warn(`⚠ Fallback DB (WAL no soportado): ${e.message}`);
  db = new Database(DB_PATH);
  db.pragma('journal_mode = DELETE');
  db.pragma('foreign_keys = ON');
}

// Asegurar que la tabla existe
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
`);

// ─── FUNCIÓN DE NORMALIZACIÓN ───────────────────────────
function normalizarNombre(n) {
  if (!n) return '';
  return String(n).trim().toUpperCase();
}
function normalizarDNI(d) {
  if (d === null || d === undefined) return '';
  return String(d).trim().replace(/\D/g, '').padStart(8, '0').slice(-8);
}
function normalizarCorrido(c) {
  if (!c) return null;
  return String(c).trim().toLowerCase();
}

// ─── LEER EXCEL ─────────────────────────────────────────
async function importar() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(EXCEL_PATH);

  const supervisores = [];
  const trabajadores = [];
  const errores      = [];

  // ── HOJA SUPERVISORES ──────────────────────────────────
  // Columnas: DNI | Apellidos y nombres | Doc tipo | Número DNI | Puesto | Agrupador | Correo
  const wsSup = wb.getWorksheet('SUPERVISORES');
  if (!wsSup) {
    console.error('❌ No se encontró la hoja "SUPERVISORES" en el Excel.');
    process.exit(1);
  }

  let supSinCorreo = 0;
  wsSup.eachRow((row, rn) => {
    if (rn === 1) return; // cabecera
    const nombre    = normalizarNombre(row.getCell(2).value);
    const tipo_doc  = String(row.getCell(3).value || 'DNI').trim();
    const dni       = normalizarDNI(row.getCell(4).value || row.getCell(1).value);
    const cargo     = String(row.getCell(5).value || '').trim();
    const agrupador = String(row.getCell(6).value || '').trim();
    const correo    = normalizarCorrido(row.getCell(7).value);

    if (!nombre || !dni) return; // fila vacía

    if (!correo) {
      supSinCorreo++;
      errores.push(`⚠ Supervisor sin correo [fila ${rn}]: ${nombre} (DNI: ${dni})`);
    }

    supervisores.push({ id: uuidv4(), nombre, tipo_doc, dni, cargo, agrupador, correo, es_supervisor: 1 });
  });

  // ── HOJA TRABAJADORES ──────────────────────────────────
  // Columnas: Apellidos y nombres | Doc tipo | Número DNI | Puesto | Agrupador
  const wsTrab = wb.getWorksheet('TRABAJADORES');
  if (!wsTrab) {
    console.error('❌ No se encontró la hoja "TRABAJADORES" en el Excel.');
    process.exit(1);
  }

  wsTrab.eachRow((row, rn) => {
    if (rn === 1) return; // cabecera
    const nombre    = normalizarNombre(row.getCell(1).value);
    const tipo_doc  = String(row.getCell(2).value || 'DNI').trim();
    const dni       = normalizarDNI(row.getCell(3).value);
    const cargo     = String(row.getCell(4).value || '').trim();
    const agrupador = String(row.getCell(5).value || '').trim();

    if (!nombre || !dni) return; // fila vacía

    trabajadores.push({ id: uuidv4(), nombre, tipo_doc, dni, cargo, agrupador, correo: null, es_supervisor: 0 });
  });

  // ─── RESUMEN DE LECTURA ──────────────────────────────
  console.log(`\n📊 Datos leídos del Excel:`);
  console.log(`   ✅ Supervisores con correo:    ${supervisores.filter(s => s.correo).length}`);
  if (supSinCorreo > 0)
    console.log(`   ⚠  Supervisores sin correo:    ${supSinCorreo} (no podrán hacer login)`);
  console.log(`   👷 Trabajadores (sin login):   ${trabajadores.length}`);
  console.log(`   Total a importar:              ${supervisores.length + trabajadores.length}`);

  if (errores.length > 0) {
    console.log('\n⚠ Advertencias:');
    errores.slice(0, 10).forEach(e => console.log('  ' + e));
    if (errores.length > 10) console.log(`  ... y ${errores.length - 10} advertencias más`);
  }

  // ─── MUESTRA DE SUPERVISORES ─────────────────────────
  console.log('\n📋 Supervisores con acceso al sistema:');
  supervisores.filter(s => s.correo).slice(0, 5).forEach(s => {
    console.log(`   ${s.nombre.padEnd(40)} ${s.correo} / pwd:${s.dni}`);
  });
  if (supervisores.filter(s => s.correo).length > 5)
    console.log(`   ... y ${supervisores.filter(s => s.correo).length - 5} supervisores más`);

  if (PREVIEW) {
    console.log('\n👁  PREVIEW completado — no se guardaron cambios.\n');
    return;
  }

  // ─── GUARDAR EN BASE DE DATOS ─────────────────────────
  console.log('\n💾 Guardando en base de datos...');

  const tx = db.transaction(() => {
    if (LIMPIAR) {
      const deleted = db.prepare('DELETE FROM maestro_personal').run();
      console.log(`   🗑  Eliminados ${deleted.changes} registros previos`);
    }

    const insert = db.prepare(`
      INSERT OR REPLACE INTO maestro_personal
        (id, nombre, tipo_doc, dni, cargo, agrupador, correo, es_supervisor)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Para INSERT OR REPLACE necesitamos mantener el ID si ya existe
    const getExisting = db.prepare('SELECT id FROM maestro_personal WHERE dni = ?');

    let insertados = 0;
    let actualizados = 0;

    const todos = [...supervisores, ...trabajadores];
    for (const p of todos) {
      const existing = getExisting.get(p.dni);
      const idFinal = existing ? existing.id : p.id;
      const wasNew = !existing;

      insert.run(idFinal, p.nombre, p.tipo_doc, p.dni, p.cargo, p.agrupador, p.correo, p.es_supervisor);
      if (wasNew) insertados++; else actualizados++;
    }

    console.log(`   ✅ Insertados:   ${insertados}`);
    console.log(`   🔄 Actualizados: ${actualizados}`);
  });

  tx();

  // ─── VERIFICACIÓN ─────────────────────────────────────
  const totales = db.prepare('SELECT COUNT(*) as n FROM maestro_personal').get();
  const sups    = db.prepare("SELECT COUNT(*) as n FROM maestro_personal WHERE es_supervisor = 1 AND correo IS NOT NULL").get();
  const trabs   = db.prepare("SELECT COUNT(*) as n FROM maestro_personal WHERE es_supervisor = 0").get();

  console.log('\n✔ Verificación final en base de datos:');
  console.log(`   Total personal:    ${totales.n}`);
  console.log(`   Supervisores:      ${sups.n} (pueden hacer login)`);
  console.log(`   Trabajadores:      ${trabs.n} (solo aparecen en búsquedas)`);

  // Exportar lista de accesos para referencia
  const accesosPath = path.join(__dirname, 'data', 'accesos_supervisores.txt');
  const lineas = ['ACCESOS AppRC — SUPERVISORES\n' + '='.repeat(60)];
  lineas.push('CORREO'.padEnd(45) + 'CONTRASEÑA (DNI)');
  lineas.push('-'.repeat(60));
  supervisores.filter(s => s.correo).forEach(s => {
    lineas.push(s.correo.padEnd(45) + s.dni);
  });
  if (!PREVIEW) {
    fs.mkdirSync(path.dirname(accesosPath), { recursive: true });
    fs.writeFileSync(accesosPath, lineas.join('\n') + '\n');
    console.log(`\n📄 Lista de accesos guardada en: data/accesos_supervisores.txt`);
  }

  console.log('\n🎉 Importación completada exitosamente.\n');
  console.log('   Para iniciar el servidor: npm start\n');

  db.close();
}

importar().catch(err => {
  console.error('\n❌ Error durante la importación:', err.message);
  console.error(err.stack);
  process.exit(1);
});
