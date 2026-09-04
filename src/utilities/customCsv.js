export default async function csv(url, row = undefined, init = {}) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

  const contentType = response.headers.get("Content-Type");
  if (contentType?.includes("application/json")) {
    const json = await response.json();
    return row ? json.map(row) : json;
  }

  return parseCSV(await response.text(), row);
}

const parseCSVLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

const parseCSV = (text, row) => {
  const lines = text.trim().split("\n");
  const headers = parseCSVLine(lines.shift());

  return lines.map((line) => {
    const values = parseCSVLine(line);
    const object = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
    return row ? row(object, values) : object;
  });
};
