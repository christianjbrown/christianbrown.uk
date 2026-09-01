#!/usr/bin/env node
'use strict';

/**
 * Keeps the third-party assets under assets/**\/vendor/ honest.
 *
 *   node bin/sync-vendor.mjs           re-fetch every file from its `source`
 *   node bin/sync-vendor.mjs --check   verify the committed files, no network
 *
 * The manifest is config/vendor.json. Vendored files are committed (they're
 * served from 'self' so the strict script-src CSP holds), which historically
 * meant nobody could tell what version was in the tree — bootstrap.min.js sat
 * there for years identified only by the version in its banner comment. The
 * manifest records version, provenance and SHA-256 for each one, and --check
 * re-hashes what's committed so CI fails on a hand-edited or drifted file.
 */

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = resolve(ROOT, 'config/vendor.json');

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

/**
 * @param {String} source a manifest `source`: an https URL or a repo-relative path.
 *
 * @return {Promise<Buffer>}
 */
async function read(source) {
    if (source.startsWith('https://')) {
        const response = await fetch(source);
        if (!response.ok) {
            throw new Error(`GET ${source} returned ${response.status} ${response.statusText}`);
        }

        return Buffer.from(await response.arrayBuffer());
    }

    return readFile(resolve(ROOT, source));
}

async function main() {
    const check = process.argv.includes('--check');
    const { files } = JSON.parse(await readFile(MANIFEST, 'utf8'));
    const problems = [];

    for (const file of files) {
        const target = resolve(ROOT, file.target);

        if (check) {
            let actual;
            try {
                actual = sha256(await readFile(target));
            } catch {
                problems.push(`${file.target} is missing`);
                continue;
            }
            if (actual !== file.sha256) {
                problems.push(`${file.target} does not match config/vendor.json (expected ${file.sha256}, got ${actual})`);
                continue;
            }
            console.log(`ok   ${file.name} ${file.version}  ${file.target}`);
            continue;
        }

        const buffer = await read(file.source);
        await writeFile(target, buffer);
        const actual = sha256(buffer);
        const status = actual === file.sha256 ? 'unchanged' : 'CHANGED — update sha256 in config/vendor.json';
        console.log(`sync ${file.name} ${file.version}  ${file.target}\n     sha256 ${actual}  (${status})`);
    }

    if (problems.length > 0) {
        console.error('\nVendored assets are out of sync with config/vendor.json:');
        problems.forEach(problem => console.error(`  - ${problem}`));
        console.error('\nRun `npm run vendor:sync` to restore them from source.');
        process.exitCode = 1;
    }
}

await main();
