import { test, expect } from '@playwright/test';
import { LEAF_URLS } from '../leaf_test_utils/leaf_util_methods';
import { promises as fs } from 'fs';
import { parse } from 'csv-parse/sync';

/**
 * Test for LEAF-5181
 * Nexus API: PDL Export
 * Retrieves Nexus PDL export in JSON and CSV formats and compares them for equality
 */
test('Nexus API: PDL Exports', async ({ page, request }, testInfo) => {
  // Retrieve PDL export in JSON format
  const url = `${LEAF_URLS.NEXUS_HOME}api/export/pdl`;
  const res = await request.get(url);
  expect(res.status()).toBe(200);
  const ct = res.headers()['content-type'] ?? '';
  expect(ct).toMatch('application/json');
  const body = await res.text();
  expect(body.length).toBeGreaterThan(0);
  const jsonArr = (() => {
  try {
    const parsed = JSON.parse(body);
    return Array.isArray(parsed) ? parsed : (parsed.data ?? []);
    } catch (e) {
    return [];
    }
  })();
  expect(jsonArr.length).toBeGreaterThan(0);

  // Retrieve PDL export in CSV format using the UI
  await page.goto(LEAF_URLS.NEXUS_HOME);
  await page.getByText('Export PDL Download the').click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByText('Export PDL (CSV) Download the').click();
  const download = await downloadPromise;
  const filename = download.suggestedFilename() || 'export_pdl.csv';
  const savedPath = testInfo.outputPath(filename);
  await download.saveAs(savedPath);
  const csv = await fs.readFile(savedPath, 'utf8');
  expect(csv.length).toBeGreaterThan(0);
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
  expect(lines.length).toBeGreaterThan(1);
  expect(lines[0].toLowerCase()).toMatch(/pdl|id|name/);

  // Parse CSV robustly using csv-parse (handles quoted commas/newlines)
  const csvContent = lines.join('\n').replace(/^\uFEFF/, '');
  // Sanitize: convert fields that start with ="..." into properly quoted CSV fields ("...") — this preserves commas inside names
  let sanitizedCsvContent = csvContent.replace(/(^|,)\s*=\s*"((?:[^"]|"")*)"(?=,|$)/g, '$1"$2"');
  // Normalize spacing around empty-quote fields so they appear as ,"", not , "" or "" ,
  sanitizedCsvContent = sanitizedCsvContent.replace(/,\s*""\s*,/g, ',"",').replace(/(^|\n)\s*""\s*(?=,|$)/g, '$1""');
  // Remove trailing commas at end of lines (they create extra empty columns when parsed)
  sanitizedCsvContent = sanitizedCsvContent.replace(/,\s*(?=\r?\n|$)/g, '');
  // Ensure sanitizer removed problematic sequences and no line ends with a stray comma
  expect(sanitizedCsvContent).not.toMatch(/(^|,)\s*=\s*"/);
  const allLinesOk = sanitizedCsvContent.split(/\r?\n/).every(l => !/,\s*$/.test(l));
  expect(allLinesOk).toBeTruthy();

  // Parse as raw rows (arrays) so we can detect and fix rows with extra columns (e.g., commas inside an unquoted Employee Name)
  const rawRows: string[][] = parse(sanitizedCsvContent, { columns: false, skip_empty_lines: true, relax_column_count: true });
  if (!rawRows || rawRows.length === 0) throw new Error('CSV parse produced no rows');

  for (let i = 0; i < jsonArr.length; i++) {
    const jsonrow = jsonArr[i];
    if (!jsonrow || jsonrow.length === 0) continue;
    const CSVrow = rawRows[i+1];
    if (!CSVrow || CSVrow.length === 0) continue;
    // Replace HTML-encoded ampersands so comparisons match JSON values
    const normalizedCSVrow = CSVrow.map(v => (typeof v === 'string' ? v.replace(/&amp;/g, '&').trim() : v));
    let jsonEmployeeName = jsonrow['Employee Name'].replace(/\s/g, '');
    //Compare each rows field to ensure they all match
    expect(jsonrow['LEAF Position ID']).toBe(parseInt(normalizedCSVrow[0]));
    expect(jsonrow['HR Smart Position Number']).toBe(normalizedCSVrow[1]);
    expect(jsonrow['Service']).toBe(normalizedCSVrow[2]);
    expect(jsonrow['Position Title']).toBe(normalizedCSVrow[3]);
    expect(jsonrow['Classification Title']).toBe(normalizedCSVrow[4]);
    expect(jsonEmployeeName).toBe(normalizedCSVrow[5]);
    expect(jsonrow['Employee Username']).toBe(normalizedCSVrow[6]);
    expect(jsonrow['Supervisor Name']).toBe(normalizedCSVrow[7]);
    expect(jsonrow['Pay Plan']).toBe(normalizedCSVrow[8]);
    expect(jsonrow['Series']).toBe(normalizedCSVrow[9]);
    expect(jsonrow['Pay Grade']).toBe(normalizedCSVrow[10]);
    expect(jsonrow['FTE Ceiling / Total Headcount']).toBe(parseInt(normalizedCSVrow[11]));
    expect(jsonrow['Current FTE']).toBe(normalizedCSVrow[12]);
    expect(jsonrow['PD Number']).toBe(normalizedCSVrow[13]);
    expect(jsonrow['Note']).toBe(normalizedCSVrow[14]);
  }
});

