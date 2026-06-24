import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { guessCategory, AY_MAP, parseDateStr } from './dateHelpers';

function autoMapColumns(normHeader) {
  const map = { tarih: -1, ad: -1, ay: -1, yil: -1, yer: -1, kat: -1, topluluk: -1 };
  normHeader.forEach((h, i) => {
    if (map.tarih < 0 && /tarih|date|gun|day/.test(h)) map.tarih = i;
    if (map.ad < 0 && /^(ad|isim|etkinlik|name|baslik|title|konu)/.test(h)) map.ad = i;
    if (map.ay < 0 && /^ay$|^month$/.test(h)) map.ay = i;
    if (map.yil < 0 && /yil|year|sene/.test(h)) map.yil = i;
    if (map.yer < 0 && /yer|konum|location|mekan|venue|adres|salon/.test(h)) map.yer = i;
    if (map.kat < 0 && /kategori|category|alan|tur$|type/.test(h)) map.kat = i;
    if (map.topluluk < 0 && /topluluk|community|grup/.test(h)) map.topluluk = i;
  });
  return map;
}

function rowsToEventList(rows, headerIdx, colMap) {
  const nowYear = new Date().getFullYear();
  const results = [];
  for (let ri = headerIdx + 1; ri < rows.length; ri++) {
    const row = rows[ri];
    if (row.every((c) => String(c).trim() === '')) continue;

    let name = colMap.ad >= 0 ? String(row[colMap.ad] || '').trim() : '';
    if (!name) {
      for (let j = 0; j < row.length; j++) {
        const v = String(row[j] || '').trim();
        if (v && j !== colMap.tarih && j !== colMap.yil && j !== colMap.ay && !/^\d+$/.test(v)) { name = v; break; }
      }
    }
    if (!name || name.length < 2) continue;

    let d = 1, ay = null, yil = null;
    if (colMap.tarih >= 0) {
      const ps = parseDateStr(row[colMap.tarih]);
      if (ps) { d = ps.d; ay = ps.mo; yil = ps.y; }
      else { const n = parseInt(row[colMap.tarih]); if (!isNaN(n) && n >= 1 && n <= 31) d = n; }
    }
    if (colMap.ay >= 0 && !ay) {
      const rawAy = String(row[colMap.ay] || '').trim();
      const an = parseInt(rawAy);
      ay = !isNaN(an) && an >= 1 && an <= 12 ? an : AY_MAP[rawAy.toLowerCase()] || null;
    }
    if (colMap.yil >= 0 && !yil) { const ry = parseInt(row[colMap.yil]); if (!isNaN(ry) && ry > 2000) yil = ry; }
    yil = yil || nowYear;

    const yer = colMap.yer >= 0 ? String(row[colMap.yer] || '').trim() : '';
    const topluluk = colMap.topluluk >= 0 ? String(row[colMap.topluluk] || '').trim() : '';
    let cat = 'sosyal';
    if (colMap.kat >= 0) {
      const rk = String(row[colMap.kat] || '').toLowerCase().trim();
      cat = ['teknik', 'sanat', 'spor', 'sosyal'].includes(rk) ? rk : guessCategory(rk + ' ' + name);
    } else cat = guessCategory(name);

    results.push({ d, t: name, c: cat, yil, ay, yer, topluluk, tarihStr: colMap.tarih >= 0 ? String(row[colMap.tarih] || '').trim() : '' });
  }
  return results;
}

export function importFromRows(rows) {
  if (!rows || rows.length < 2) return { error: 'Dosyada veri bulunamadı.' };
  let headerIdx = 0;
  for (let i = 0; i < Math.min(rows.length, 6); i++) {
    if (rows[i].some((c) => String(c).trim() !== '')) { headerIdx = i; break; }
  }
  const rawHeader = rows[headerIdx].map((h) => String(h || ''));
  const normHeader = rawHeader.map((h) =>
    h.toLowerCase().replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]/g, '')
  );
  const colMap = autoMapColumns(normHeader);
  if (colMap.ad >= 0 || colMap.tarih >= 0) {
    return { events: rowsToEventList(rows, headerIdx, colMap) };
  }
  return { needsMapping: true, rawHeader, rows, headerIdx };
}

export function importFromText(text) {
  const nowYear = new Date().getFullYear();
  const results = [];
  text.split(/\n/).forEach((line) => {
    line = line.trim();
    if (line.length < 3) return;
    let d = 1, ay = null, yil = null, remaining = line;
    const dm = line.match(/\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/);
    if (dm) {
      const ps = parseDateStr(dm[0]);
      if (ps) { d = ps.d; ay = ps.mo; yil = ps.y; }
      remaining = line.replace(dm[0], '').trim().replace(/^[-–:,\s]+|[-–:,\s]+$/g, '');
    }
    let yer = '';
    const ym = remaining.match(/[([]([^)\]]+)[)\]]/);
    if (ym) { yer = ym[1].trim(); remaining = remaining.replace(ym[0], '').trim().replace(/^[-–:,\s]+|[-–:,\s]+$/g, ''); }
    const name = remaining.replace(/\s+/g, ' ').trim();
    if (!name || name.length < 2) return;
    results.push({ d, t: name, c: guessCategory(name), yil: yil || nowYear, ay, yer, topluluk: '', tarihStr: dm ? dm[0] : '' });
  });
  return results;
}

export async function handleImportFile(file) {
  const isExcel = /\.(xlsx|xls)$/i.test(file.name) || ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(file.type);
  const isWord = /\.(docx|doc)$/i.test(file.name) || ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'].includes(file.type);
  const isCSV = /\.csv$/i.test(file.name) || file.type === 'text/csv';

  if (!isExcel && !isWord && !isCSV) {
    return { error: 'Desteklenen formatlar: Excel (.xlsx/.xls), Word (.docx), CSV' };
  }
  if (file.size > 20 * 1024 * 1024) return { error: "Dosya 20 MB'ı geçemez." };

  if (isExcel || isCSV) {
    const buf = isCSV ? await file.text() : await file.arrayBuffer();
    const wb = isCSV ? XLSX.read(buf, { type: 'string' }) : XLSX.read(buf, { type: 'array', cellDates: true });
    let rows = [];
    wb.SheetNames.forEach((sn) => {
      const ws = wb.Sheets[sn];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false, dateNF: 'DD.MM.YYYY' });
      if (data.length > 1) rows = rows.concat(data);
    });
    return importFromRows(rows);
  }

  if (isWord) {
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return { events: importFromText(result.value) };
  }
}
