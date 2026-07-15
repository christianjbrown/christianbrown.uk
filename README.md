
# Overview

[![CI](https://github.com/christianjbrown/christianbrown.uk/actions/workflows/ci.yml/badge.svg)](https://github.com/christianjbrown/christianbrown.uk/actions/workflows/ci.yml)

This is the personal website of Christian Brown, created with static website generator [Jekyll](https://jekyllrb.com/), which itself is based on Ruby.

# :construction: Installation

Follow Jekyll's [installation guide](https://jekyllrb.com/docs/installation/).

# :computer: Local development

To run the site locally, use the following command:

```shell
bundle exec jekyll serve --host 0.0.0.0
```
then open your browser to [http://0.0.0.0:4000/](http://0.0.0.0:4000/).

# :test_tube: Tests

CI runs on every push and pull request (see the badge above). To run the checks locally:

| Command | What it checks |
| --- | --- |
| `npm run coverage` | JavaScript unit tests (Vitest) at 100% coverage |
| `npm run lint:css` | Authored SCSS lint (Stylelint); `npm run lint:css:fix` auto-fixes |
| `bundle exec jekyll build --strict_front_matter` | The site builds with no Liquid/front-matter/SCSS errors |
| `bundle exec htmlproofer ./_site --disable-external --checks Links,Images,Scripts --allow-hash-href` | Rendered HTML: internal links, images and scripts (run after a build) |
| `npm run serve:site` + `npm run test:a11y` | Accessibility (pa11y, WCAG2AA) against the built site; advisory only |

Install dependencies first with `bundle install` and `npm ci`.


