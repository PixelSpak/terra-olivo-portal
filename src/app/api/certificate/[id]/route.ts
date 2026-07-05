import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'Terra_Olivo_Certificate';
  
  if (!id) {
    return new NextResponse('Missing certificate ID', { status: 400 });
  }

  const driveUrl = `https://drive.google.com/uc?export=download&id=${id}`;

  try {
    const response = await fetch(driveUrl, {
      method: 'GET',
      headers: {
        // Some Google Drive endpoints require a user agent to return the file instead of a warning
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch certificate from Drive. Status: ${response.status}`);
      return new NextResponse('Failed to fetch certificate from Drive', { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();

    // Sanitize filename to avoid header issues
    const safeName = name.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '_');

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}.pdf"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error downloading certificate:', error);
    return new NextResponse('Error downloading certificate', { status: 500 });
  }
}
