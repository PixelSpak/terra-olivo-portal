import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const { oil2026_slug } = await request.json();
  if (typeof oil2026_slug !== 'string') {
    return NextResponse.json({ error: 'Invalid suggestion' }, { status: 400 });
  }

  const sugPath = path.join(process.cwd(), 'src/data/suggestions.json');
  if (fs.existsSync(sugPath)) {
    const sugs = JSON.parse(fs.readFileSync(sugPath, 'utf8'));
    const newSugs = sugs.filter((s: any) => s.oil2026_slug !== oil2026_slug);
    fs.writeFileSync(sugPath, JSON.stringify(newSugs, null, 2), 'utf8');
  }
  return NextResponse.json({ success: true });
}
