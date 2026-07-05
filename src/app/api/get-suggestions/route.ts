import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const sugPath = path.join(process.cwd(), 'src/data/suggestions.json');
  if (fs.existsSync(sugPath)) {
    const sugs = JSON.parse(fs.readFileSync(sugPath, 'utf8'));
    return NextResponse.json({ suggestions: sugs });
  }
  return NextResponse.json({ suggestions: [] });
}
