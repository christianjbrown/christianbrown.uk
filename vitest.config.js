import { defineConfig } from 'vitest/config';

/**
 * `config/global.const.js` is a Jekyll-processed source file: it begins with an
 * (empty) YAML front matter block (`---\n---`) that Jekyll strips at build time.
 * That front matter is not valid JavaScript, so strip it here too before Vitest
 * tries to parse the module. Everything else in the file is already valid JS
 * (the `{{ site.google_analytics_id }}` token lives inside a string literal).
 */
function stripJekyllFrontMatter() {
    const FRONT_MATTER = /^---\r?\n[\s\S]*?\r?\n?---\r?\n/;
    return {
        name: 'strip-jekyll-front-matter',
        enforce: 'pre',
        transform(code, id) {
            if (id.replace(/\\/g, '/').endsWith('/config/global.const.js') && FRONT_MATTER.test(code)) {
                return { code: code.replace(FRONT_MATTER, ''), map: null };
            }
            return null;
        },
    };
}

export default defineConfig({
    plugins: [stripJekyllFrontMatter()],
    test: {
        environment: 'jsdom',
        // Serve the jsdom document from an https origin so cookies written with
        // the `Secure` flag (see Cookie.set) are retained and readable in tests.
        environmentOptions: {
            jsdom: {
                url: 'https://localhost:3000/',
            },
        },
        globals: true,
        include: ['assets/js/**/*.test.js', 'config/**/*.test.js'],
        coverage: {
            provider: 'v8',
            all: true,
            include: ['assets/js/**/*.js', 'config/global.const.js'],
            // theme-init.js is a classic (non-module) pre-paint shim loaded
            // directly by the page <head>; it can't be imported, so it's tested
            // via Theme.js (which it mirrors) rather than in isolation.
            exclude: ['**/*.test.js', 'assets/data/**', 'assets/js/theme-init.js', 'assets/js/vendor/**'],
            reporter: ['text', 'html'],
            reportsDirectory: 'coverage',
            thresholds: {
                lines: 100,
                functions: 100,
                branches: 100,
                statements: 100,
            },
        },
    },
});
