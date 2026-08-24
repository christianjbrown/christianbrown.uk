# Keeping LinkedIn in sync with this repo

The markdown in this repo is the **source of truth**. LinkedIn is a downstream copy.

LinkedIn has no public write API for profile experience, so a sync always ends in a
copy-paste by hand. These rules exist so the paste-ready text comes out identical
every time, whoever renders it. **Render the text and paste it manually — never
drive a browser to edit the profile.**

Source files:

| Path | Feeds |
| --- | --- |
| `_professional_experience/*.md` | Experience (11 roles) |
| `_education/*.md` | Education (1 entry) |
| `_config.yml` → `header_job_title` | Headline |
| `index.html` → the `#cv-lead` paragraph | About |

## 1. Body → LinkedIn description box

Take everything after the closing `---` of the front matter and apply these in order.

1. **Normalise the bullet marker to `- `.** The source is inconsistent — `* ` in nine
   files, `- ` in `_professional_experience/2020-11-rv-lead.md` and
   `_education/2000-2003-uwa-bcompsci.md`. LinkedIn description boxes are plain text,
   so the hyphen renders literally. That is what the live profile already shows.

2. **Drop the tech-stack trailer.** Delete the final body paragraph when it is wrapped
   in `_…_` and begins `Tech stack:`. Four files have one:
   `2016-04-viacomcbs-lead.md`, `2020-11-rv-lead.md`, `2021-08-rv-eng-mgr.md`,
   `2022-08-ebay-snr-eng-mgr.md`. Nothing replaces it — the LinkedIn description ends
   at the last bullet.

3. **Keep technology that is named inside a bullet.** Only the trailer goes. The Red
   Ventures Engineering Manager bullet naming Bitmovin, AWS Elemental, Fastly,
   Video.js, Rev and Mux stays exactly as written, as do the brand names in the CNET
   and Red Ventures migration bullets. These are part of the achievement, not a stack
   list, and the live profile already carries them.

4. **Unwrap kramdown links.** `[text](url)` becomes `text`. Then strip every inline
   attribute list `{:…}`. Strip *all* of them, not just the first — links here carry up
   to two (`{:target="_blank" rel="noopener noreferrer"}{:title="…"}`), and that first
   one is malformed but tolerated by kramdown, so do not pattern-match on a well-formed
   IAL.

5. **Strip any emphasis markers left over** (`_`, `*`, `**`).

6. **Preserve Unicode verbatim.** Curly apostrophes (`’`), en dashes (`–`), curly quotes
   (`“ ”`), `~`, `US$`. LinkedIn stores UTF-8 and the live profile already has them.
   Do not "straighten" anything.

7. **One bullet per physical line.** Never rewrap. The site depends on this too:
   `_includes/cv-experience.html` injects the body through
   `replace: "\n", ""`, so a wrapped bullet would be silently joined there as well.

8. **Order newest-first**, matching `index.html`'s
   `{% for experience in site.professional_experience reversed %}`.

9. **Cap each description at 2,000 characters** — LinkedIn's limit. The current worst
   case is `2022-08-ebay-snr-eng-mgr.md` at 1,137, so there is headroom, but check
   after adding bullets.

## 2. Front matter → LinkedIn form fields

| Front matter | LinkedIn field | Direction |
| --- | --- | --- |
| `position` | Title | md → LinkedIn |
| `organisation` | Company | md → LinkedIn, but pick the matching company page from LinkedIn's typeahead rather than typing the string |
| `start` / `end` | Start / End date | md → LinkedIn. A bare `YYYY` means January for `start` and December for `end`, per `_includes/cv-date-range.html` |
| `location` | Location | **Not verbatim.** The md value is the canonical city; leave LinkedIn's own typeahead string alone (`"London, UK"` ↔ `"Greater London, England, United Kingdom"`) |
| `organisation_extra`, `organisation_logo`, `organisation_logo_dark`, `organisation_link` | — | Site-only. Never exported |
| — | Employment type, Location type (On-site / Hybrid / Remote), Skills, Media | **LinkedIn-only.** No md equivalent exists, so a sync never touches them |

**Headline** ← `_config.yml`'s `header_job_title`.

**About** ← the `#cv-lead` paragraph in `index.html`. It is the `&description` YAML
anchor, reused in the page `<meta>` description and the `schema.org` block, so edit it
in one place.

**Education** ← `_education/2000-2003-uwa-bcompsci.md`: `position` → Degree,
`organisation` → School, the single bullet → Description.

## 3. What a sync must never do

- **Never delete or overwrite a LinkedIn position with no md file behind it.** The sync
  is additive and per-role. If LinkedIn carries a position this repo has no file for,
  leave it untouched and say out loud that it is being skipped, rather than silently
  omitting it. (ITV was such a role until it was added here in Aug 2026.)
- **Never merge the roles at a company that appears twice.** iiNet (×2) and Red Ventures
  (×2) are separate LinkedIn positions grouped under one company block. The site groups
  them the same way, via the `previous.organisation != experience.organisation`
  comparison in `_includes/cv-experience.html`. Each keeps its own description.
- **Never propose skills tags.** The site has no skills section; LinkedIn's are its own.
- **Never edit the profile through the browser.** Render the text; the paste is manual.

## 4. When to run this

There is no automated trigger, by design. Run it after any change to:

- a file under `_professional_experience/` or `_education/`
- `header_job_title` in `_config.yml`
- the `#cv-lead` paragraph in `index.html`

## 5. Known divergence

Verified against the live profile on 2026-08-24. Reconcile deliberately — decide
which side is right, fix the md, then paste.

**Header fields.** None outstanding — every role's title, company and dates match.

`2007-09-cnet-soft-eng.md` was reconciled to LinkedIn — `position` is now
"Software Engineer / Web Developer" and `organisation` is "CNET". Its
`organisation_extra` still says "CBS acquired CNET Networks in 2008", which is the
historically correct company name and is site-only, so it is left as written.

Titles and companies must be read from the file, not from a summary of it: an
earlier pass reported `2002-01-mets-it.md` as saying `"METS"` when it has always
read `"Mineral Engineering Technical Services (METS)"` and already matched.

**Ongoing roles.** A current role omits `end` entirely. `_includes/cv-date-range.html`
then renders "– now" with no duration, and the JS layer adds the live duration on load.
Only one role should be ongoing at a time.

**Filenames.** The collections carry no `date:` front matter, so Jekyll orders them by
path — the `YYYY-MM-` prefix drives both the CV sequence and the company grouping in
`_includes/cv-experience.html`. Keep each prefix equal to that file's `start`. A bare
`start: "2001"` means January, so `2001-01-` is the right prefix for it.

**Body text.** In sync — all ten roles match LinkedIn character for character, as of
2026-08-24.

Three differences were found and resolved in favour of LinkedIn's punctuation, since
the site was the inconsistent side: straight `"` → `“ ”` in
`2006-07-iinet-associate.md`, straight `'` → `’` in `2016-04-viacomcbs-lead.md`, and a
stray narrow no-break space (U+202F) → an ordinary space in the same file. That last
one was invisible in an editor and only surfaced because §6 compares character-wise.
Keep doing that.

## 6. Comparing against the live profile

To report drift rather than just render text, read the profile and diff it. **Read
only — never click Edit, Save or any profile control.**

1. Open `https://www.linkedin.com/in/christianjbrown/details/experience/` and use
   `get_page_text`. Do **not** use the main profile URL: it lazy-loads and returns
   only the header, with no experience at all.
2. Slice the text between the leading `Experience` heading and the trailing
   `Profile language` / `Who your viewers also viewed` blocks, then drop the noise
   lines LinkedIn interleaves:
   - skills summaries — `Skills: PostgreSQL, Software Development, +22 skills` and
     the bare `Software Development, Stakeholder Management and +20 skills` form
   - the ` · Full-time` / ` · Freelance` suffix on the company line
   - the ` · 3 yrs 9 mos` duration suffix — LinkedIn computes it, the site computes
     its own, and neither is authored
   - the location / ` · Hybrid` / ` · On-site` / ` · Remote` line
3. Note that a company with two roles (iiNet, Red Ventures) renders as a company
   block with the roles nested beneath it, so the company name appears once, above
   both titles.
4. Apply §1 to each md file, then diff the bullets **per role**, not as one blob.

Compare, and report as drift:

- the bullet text, character for character — including the punctuation in §1.6
- `position` vs LinkedIn's title, `organisation` vs its company
- `start` / `end` vs LinkedIn's month and year

Do **not** report as drift:

- location strings — `["London, UK"]` against `Greater London, England, United
  Kingdom` is expected, per §2
- durations, employment type, location type, or skills — LinkedIn's own, per §2
- a LinkedIn position with no md file, which §3 protects

Report each role as in-sync or differing; for a differing one, show the exact
character delta and the paste-ready replacement. Invisible differences are the
whole point of doing this character-wise — see the U+202F in §5.

## 7. Checking the rendered output

A throwaway pipeline that applies rules 1, 2 and 4, for verifying bullet counts and
lengths. This is a check, not tooling — do not commit a script.

```shell
for f in _professional_experience/*.md _education/*.md; do
  awk 'BEGIN{fm=0} /^---$/{fm++; next} fm>=2' "$f" \
    | grep -v '^_Tech stack:' \
    | sed -E 's/\{:[^}]*\}//g; s/\[([^]]*)\]\([^)]*\)/\1/g; s/^[*-] /- /' \
    | grep '^- ' | awk -v f="$f" '{n++; c+=length($0)} END{print f, "bullets="n, "chars="c}'
done
```

Expected bullet counts, confirmed against the live profile: clix 1, mets 1,
iinet-scsr 2, iinet-associate 1, cnet 2, cbsi 4, viacomcbs 2, rv-lead 3, rv-eng-mgr 3,
itv 4,
ebay 6, uwa 1. Every character count must be under 2,000.

Rendered output should contain no `{:`, no `](`, and no occurrence of `Tech stack`.
