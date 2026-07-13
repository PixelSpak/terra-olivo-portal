import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function isSafeImageFilename(filename: unknown): filename is string {
  return (
    typeof filename === 'string' &&
    filename === path.basename(filename) &&
    /^[a-zA-Z0-9._-]+\.png$/.test(filename)
  );
}

export async function POST(request: Request) {
  const { filename } = await request.json();
  if (!isSafeImageFilename(filename)) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'public/images/oils', filename);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  const jsonPath = path.join(process.cwd(), 'src/data/oils.json');
  const oils = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let updated = false;
  for (const oil of oils) {
    if (oil.image === `/images/oils/${filename}`) {
      delete oil.image;
      delete oil.format;
      updated = true;
    }
  }
  if (updated) {
    fs.writeFileSync(jsonPath, JSON.stringify(oils, null, 2), 'utf8');
  }

  return NextResponse.json({ success: true });
}
