
# Overview

[![CI](https://github.com/christianjbrown/christianbrown.uk/actions/workflows/ci.yml/badge.svg)](https://github.com/christianjbrown/christianbrown.uk/actions/workflows/ci.yml)

This is the personal website of Christian Brown, created with static website generator [Jekyll](https://jekyllrb.com/), which itself is based on Ruby.

# :construction: Installation

Follow Jekyll's [installation guide](https://jekyllrb.com/docs/installation/).

# :computer: Local development

To run the site locally, use:

```shell
npm run serve:local
```
then open your browser to [http://127.0.0.1:4000/](http://127.0.0.1:4000/). This is a shortcut for `bundle exec jekyll serve`, which watches for changes and rebuilds automatically — refresh the browser to see them. To reach it from another device on your network, append a host: `npm run serve:local -- --host 0.0.0.0`.

## Live data

The smart-home page (and the CV's indoor-temperature link) pull from two live APIs. By default — including locally — they use the production endpoints behind the Fastly CDN, so no extra setup is needed.

To point one at a function running on your own machine, flip its flag in `_config.yml` and restart the server:

| Flag in `_config.yml` | API |
| --- | --- |
| `smart_home_smart_things_climate_use_local` | SmartThings indoor climate |
| `smart_home_met_office_weather_use_local` | Met Office outdoor weather |

The dev and production URLs live alongside the flags (`smart_home_*_url_dev` / `_url_prod`). Each flag is independent, so one API can run locally while the other stays on the CDN; when a flag is on, the layout also whitelists that dev origin in the page's `connect-src` CSP.

# :test_tube: Testing

CI runs on every push and pull request (see the badge above). To run the checks locally:

| Command | What it checks |
| --- | --- |
| `npm run coverage` | JavaScript unit tests (Vitest) at 100% coverage |
| `npm run lint:css` | Authored SCSS lint (Stylelint); `npm run lint:css:fix` auto-fixes |
| `bundle exec jekyll build --strict_front_matter` | The site builds with no Liquid/front-matter/SCSS errors |
| `bundle exec htmlproofer ./_site --disable-external --checks Links,Images,Scripts --allow-hash-href` | Rendered HTML: internal links, images and scripts (run after a build) |
| `npm run serve:site` + `npm run test:a11y` | Accessibility (pa11y, WCAG2AA) against the built site; advisory only |
| `npm run test:visual` | Percy visual regression across browsers/widths (needs `PERCY_TOKEN`); advisory only |

Install dependencies first with `bundle install` and `npm ci`.

## Visual regression

Cross-browser visual snapshots of the homepage and the smart-home page are captured with [Percy](https://percy.io) (BrowserStack) on every push and pull request, so CSS and layout changes are diffed against a baseline before they ship. Each page is rendered in **Chrome, Firefox, Edge and Safari** at **mobile, tablet and desktop widths** (390 / 768 / 1280px).

Percy re-renders a captured DOM without running the page's JavaScript, so a small [Playwright](https://playwright.dev) driver (`percy/snapshot.mjs`) first makes each page deterministic — it stubs the live climate/weather feeds with fixtures, pins the clock and timezone, and hides the one-time cookie prompt and the time-series history canvas — then hands the finished DOM to Percy.

The check is **advisory**: it is not a required status check, it never blocks a merge, and it no-ops when the monthly free-tier screenshot budget is exhausted or when `PERCY_TOKEN` is unset (so forks and local runs stay green). This project is tested with BrowserStack.


