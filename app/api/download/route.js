import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const tempDir = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), 'temp');
    const filePath = path.join(tempDir, `${id}.png`);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found or expired' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
        headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': `attachment; filename="id_card_${id}.png"`,
        },
    });
}
