import csvParse from 'csv-parse';
import fs from 'fs';

export default async function loadCSV(filePath: string): Promise<string[][]> {
  const readCSVStream = fs.createReadStream(filePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines = [] as Array<string[]>;

  parseCSV.on('data', line => {
    lines.push(line as string[]);
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}
