import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const { filename } = await request.json();
  const filePath = path.join(process.cwd(), 'public/images/producers', filename);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  const jsonPath = path.join(process.cwd(), 'src/data/producers.json');
  const producers = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let updated = false;
  for (const p of producers) {
    if (p.logo === `/images/producers/${filename}`) {
      delete p.logo;
      updated = true;
    }
  }
  if (updated) {
    fs.writeFileSync(jsonPath, JSON.stringify(producers, null, 2), 'utf8');
  }

  return NextResponse.json({ success: true });
}
