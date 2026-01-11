export function renderYamlTable(data: Record<string, unknown>): string {
  // Check if data is an array of objects or has array properties
  const arrayData = findArrayOfObjects(data);

  if (arrayData) {
    return renderArrayTable(arrayData);
  }

  // Fallback to simple key-value table for flat objects
  return renderSimpleTable(data);
}

function findArrayOfObjects(data: Record<string, unknown>): Record<string, unknown>[] | null {
  // If the data itself is structured as a single-key object with array value
  const keys = Object.keys(data);

  for (const key of keys) {
    const value = data[key];
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      return value as Record<string, unknown>[];
    }
  }

  return null;
}

function renderArrayTable(items: Record<string, unknown>[]): string {
  if (items.length === 0) {
    return '<div class="yaml-table-empty">Empty array</div>';
  }

  // Collect all unique keys from all items
  const allKeys = new Set<string>();
  items.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });
  const headers = Array.from(allKeys);

  // Build header row
  const headerCells = headers
    .map(h => `<th>${escapeHtml(h)}</th>`)
    .join('');

  // Build data rows
  const dataRows = items
    .map(item => {
      const cells = headers
        .map(h => {
          const value = item[h];
          return `<td>${escapeHtml(formatValue(value))}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `
    <table class="yaml-table">
      <thead>
        <tr>${headerCells}</tr>
      </thead>
      <tbody>
        ${dataRows}
      </tbody>
    </table>
  `;
}

function renderSimpleTable(data: Record<string, unknown>): string {
  const rows = flattenObject(data);

  if (rows.length === 0) {
    return '<div class="yaml-table-empty">Empty YAML</div>';
  }

  const tableRows = rows
    .map(({ key, value }) => {
      const escapedKey = escapeHtml(key);
      const escapedValue = escapeHtml(formatValue(value));
      return `<tr><td class="yaml-key">${escapedKey}</td><td class="yaml-value">${escapedValue}</td></tr>`;
    })
    .join('');

  return `
    <table class="yaml-table">
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;
}

interface FlattenedRow {
  key: string;
  value: unknown;
}

function flattenObject(obj: Record<string, unknown>, prefix = ''): FlattenedRow[] {
  const rows: FlattenedRow[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      rows.push(...flattenObject(value as Record<string, unknown>, fullKey));
    } else {
      rows.push({ key: fullKey, value });
    }
  }

  return rows;
}

function formatValue(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.map(item => formatValue(item)).join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderError(message: string): string {
  return `<div class="yaml-error">YAML Parse Error: ${escapeHtml(message)}</div>`;
}
