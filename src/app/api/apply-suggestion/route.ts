import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const { oil2026_slug, image } = await request.json();
  
  const jsonPath = path.join(process.cwd(), 'src/data/oils.json');
  const oils = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let updated = false;
  for (const oil of oils) {
    if (oil.slug === oil2026_slug) {
      oil.image = image;
      oil.format = "good";
      updated = true;
      break;
    }
  }
  
  if (updated) {
    fs.writeFileSync(jsonPath, JSON.stringify(oils, null, 2), 'utf8');
  }

  const sugPath = path.join(process.cwd(), 'src/data/suggestions.json');
  if (fs.existsSync(sugPath)) {
    const sugs = JSON.parse(fs.readFileSync(sugPath, 'utf8'));
    const newSugs = sugs.filter((s: any) => s.oil2026_slug !== oil2026_slug);
    fs.writeFileSync(sugPath, JSON.stringify(newSugs, null, 2), 'utf8');
  }

  return NextResponse.json({ success: true });
}
