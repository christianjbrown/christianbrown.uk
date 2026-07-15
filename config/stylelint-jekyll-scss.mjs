import postcssScss from 'postcss-scss';

/**
 * Custom Stylelint syntax for the Jekyll-processed stylesheets in `assets/css/`.
 *
 * Those files begin with an (empty) YAML front matter block (`---\n---`) that
 * Jekyll strips at build time so it will process the file as a template. That
 * block is not valid SCSS. On `parse` we blank it out — replacing every
 * non-newline character with a space so line numbers and byte offsets stay
 * accurate — before handing the source to postcss-scss, and stash the original
 * text on the AST. On `stringify` (used by `stylelint --fix`) we restore the
 * real front matter, so autofixing these files never corrupts the template.
 *
 * This mirrors the `stripJekyllFrontMatter` plugin in `vitest.config.js`, which
 * does the same for `config/global.const.js`.
 */
const FRONT_MATTER = /^---\r?\n[\s\S]*?\r?\n?---\r?\n/;

function blank(frontMatter) {
    return frontMatter.replace(/[^\r\n]/g, ' ');
}

export function parse(css, opts) {
    const match = FRONT_MATTER.exec(css);
    const frontMatter = match ? match[0] : '';
    const stripped = frontMatter ? blank(frontMatter) + css.slice(frontMatter.length) : css;
    const root = postcssScss.parse(stripped, opts);
    root.raws.jekyllFrontMatter = frontMatter;
    return root;
}

export function stringify(node, builder) {
    const frontMatter = node.type === 'root' ? node.raws.jekyllFrontMatter : null;
    if (frontMatter && node.first && typeof node.first.raws.before === 'string') {
        // The blanked front matter is parsed as leading whitespace on the first
        // node's `before` raw. Swap that blanked prefix back for the real text so
        // the emitted file still starts with `---\n---`.
        const blankPrefix = blank(frontMatter);
        const before = node.first.raws.before;
        node.first.raws.before = before.startsWith(blankPrefix)
            ? frontMatter + before.slice(blankPrefix.length)
            : frontMatter + before;
        // Guard against a second application if stringify runs again on this AST.
        node.raws.jekyllFrontMatter = '';
    }
    postcssScss.stringify(node, builder);
}
