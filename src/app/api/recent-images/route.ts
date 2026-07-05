import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const dir = path.join(process.cwd(), 'public/images/oils');
  const files = fs.readdirSync(dir);
  const now = Date.now();
  const recent = files.filter(f => {
    if (!f.endsWith('.png')) return false;
    const stat = fs.statSync(path.join(dir, f));
    // Modified in last 24 hours
    return (now - stat.mtimeMs) < 24 * 60 * 60 * 1000;
  });
  return NextResponse.json({ images: recent });
}
