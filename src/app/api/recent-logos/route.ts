import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const dir = path.join(process.cwd(), 'public/images/producers');
  if (!fs.existsSync(dir)) return NextResponse.json({ images: [] });
  
  const files = fs.readdirSync(dir);
  const now = Date.now();
  const recent = files.filter(f => {
    if (!f.endsWith('-logo.png')) return false;
    const stat = fs.statSync(path.join(dir, f));
    return (now - stat.mtimeMs) < 24 * 60 * 60 * 1000;
  });
  return NextResponse.json({ images: recent });
}
