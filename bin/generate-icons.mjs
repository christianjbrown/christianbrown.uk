'use strict';

/**
 * Regenerates every image derived from the portrait photo, from one source file:
 *
 *   assets/images/avatar.jpg                  the header photo (square; CSS rounds it)
 *   assets/images/favicon/favicon-16x16.png   circular crops with transparent corners
 *   assets/images/favicon/favicon-32x32.png
 *   assets/images/favicon/apple-touch-icon.png
 *   assets/images/favicon/android-chrome-192x192.png
 *   assets/images/favicon/android-chrome-512x512.png
 *   favicon.ico                               48, 32 and 16px, 32-bit BMP entries
 *
 *   npm run icons -- path/to/photo.png
 *
 * The source should be square and at least 512px on a side; a non-square photo
 * is centre-cropped. Run `npm run og:image` afterwards, since the share card
 * draws the avatar this writes.
 *
 * Rendered with the Chromium that Playwright already installs for the OG card
 * and the CV PDF, rather than adding an image library: a canvas with a circular
 * clip and high-quality smoothing is all the job needs, and it keeps the set of
 * tools a contributor has to install at the two the repo already uses.
 */

import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';

const AVATAR = { path: 'assets/images/avatar.jpg', size: 240 };

const CIRCULAR_PNGS = [
    { path: 'assets/images/favicon/favicon-16x16.png', size: 16 },
    { path: 'assets/images/favicon/favicon-32x32.png', size: 32 },
    { path: 'assets/images/favicon/apple-touch-icon.png', size: 180 },
    { path: 'assets/images/favicon/android-chrome-192x192.png', size: 192 },
    { path: 'assets/images/favicon/android-chrome-512x512.png', size: 512 },
];

const ICO = { path: 'favicon.ico', sizes: [48, 32, 16] };

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };

/**
 * Packs square 32-bit RGBA bitmaps into an ICO container.
 *
 * Each entry is a BITMAPINFOHEADER followed by bottom-up BGRA rows and an
 * all-zero AND mask, which is the layout the previous favicon.ico used and the
 * one every browser and Windows shell reads. PNG-in-ICO is also valid but older
 * Windows builds ignore those entries, and the file is small enough either way.
 *
 * @param {{ size: Number, rgba: Uint8Array }[]} images
 *
 * @returns {Buffer}
 */
function packIco(images) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(images.length, 4);

    const directory = [];
    const bodies = [];
    let offset = 6 + 16 * images.length;

    for (const { size, rgba } of images) {
        const rowBytes = size * 4;
        const maskRowBytes = Math.ceil(size / 32) * 4;
        const pixels = Buffer.alloc(rowBytes * size);
        for (let y = 0; y < size; y++) {
            const srcRow = (size - 1 - y) * rowBytes;
            const dstRow = y * rowBytes;
            for (let x = 0; x < size; x++) {
                const s = srcRow + x * 4;
                const d = dstRow + x * 4;
                pixels[d] = rgba[s + 2];
                pixels[d + 1] = rgba[s + 1];
                pixels[d + 2] = rgba[s];
                pixels[d + 3] = rgba[s + 3];
            }
        }
        const mask = Buffer.alloc(maskRowBytes * size);

        const info = Buffer.alloc(40);
        info.writeUInt32LE(40, 0);
        info.writeInt32LE(size, 4);
        info.writeInt32LE(size * 2, 8);
        info.writeUInt16LE(1, 12);
        info.writeUInt16LE(32, 14);
        info.writeUInt32LE(0, 16);
        info.writeUInt32LE(pixels.length + mask.length, 20);

        const body = Buffer.concat([info, pixels, mask]);
        const entry = Buffer.alloc(16);
        entry.writeUInt8(size === 256 ? 0 : size, 0);
        entry.writeUInt8(size === 256 ? 0 : size, 1);
        entry.writeUInt8(0, 2);
        entry.writeUInt8(0, 3);
        entry.writeUInt16LE(1, 4);
        entry.writeUInt16LE(32, 6);
        entry.writeUInt32LE(body.length, 8);
        entry.writeUInt32LE(offset, 12);

        directory.push(entry);
        bodies.push(body);
        offset += body.length;
    }

    return Buffer.concat([header, ...directory, ...bodies]);
}

/**
 * Runs inside the page: draws the photo into a square canvas of the given size,
 * optionally clipped to a circle, and returns it as a data URL or raw RGBA.
 *
 * Large reductions go through halving steps because a single drawImage from
 * 500px to 16px throws away most of the source and comes out aliased, even
 * with smoothing on.
 */
const RENDER = `
    (async ({ src, size, circular, format, quality }) => {
        const img = await new Promise((resolve, reject) => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.onerror = () => reject(new Error('Could not decode the source photo'));
            i.src = src;
        });

        const side = Math.min(img.naturalWidth, img.naturalHeight);
        const sx = (img.naturalWidth - side) / 2;
        const sy = (img.naturalHeight - side) / 2;

        let current = document.createElement('canvas');
        current.width = side;
        current.height = side;
        current.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, side, side);

        while (current.width / 2 >= size) {
            const next = document.createElement('canvas');
            next.width = current.width / 2;
            next.height = current.height / 2;
            const ctx = next.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(current, 0, 0, next.width, next.height);
            current = next;
        }

        const out = document.createElement('canvas');
        out.width = size;
        out.height = size;
        const ctx = out.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        if (circular) {
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
        }
        ctx.drawImage(current, 0, 0, size, size);

        if (format === 'rgba') {
            return Array.from(ctx.getImageData(0, 0, size, size).data);
        }
        return out.toDataURL(format, quality);
    })
`;

/**
 * @param {String} dataUrl
 *
 * @returns {Buffer}
 */
function decodeDataUrl(dataUrl) {
    return Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
}

async function main() {
    const source = process.argv[2];
    if (!source) {
        throw new Error('Usage: npm run icons -- path/to/photo.png');
    }
    const mime = MIME[extname(source).toLowerCase()];
    if (!mime) {
        throw new Error(`Unsupported source type ${extname(source)}; use png, jpg or webp`);
    }

    const src = `data:${mime};base64,${(await readFile(source)).toString('base64')}`;
    const browser = await chromium.launch();

    try {
        const page = await browser.newPage();
        await page.setContent('<!doctype html><html><body></body></html>');

        const render = (args) => page.evaluate(`(${RENDER})(${JSON.stringify(args)})`, undefined);

        const avatar = await render({ src, size: AVATAR.size, circular: false, format: 'image/jpeg', quality: 0.86 });
        await writeFile(AVATAR.path, decodeDataUrl(avatar));
        console.log(`Wrote ${AVATAR.path} (${AVATAR.size}x${AVATAR.size})`);

        for (const { path, size } of CIRCULAR_PNGS) {
            const png = await render({ src, size, circular: true, format: 'image/png' });
            await writeFile(path, decodeDataUrl(png));
            console.log(`Wrote ${path} (${size}x${size})`);
        }

        const entries = [];
        for (const size of ICO.sizes) {
            const rgba = await render({ src, size, circular: true, format: 'rgba' });
            entries.push({ size, rgba: Uint8Array.from(rgba) });
        }
        await writeFile(ICO.path, packIco(entries));
        console.log(`Wrote ${ICO.path} (${ICO.sizes.join(', ')}px)`);
    } finally {
        await browser.close();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
