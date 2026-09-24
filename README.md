# deepopo.github.io

Personal academic homepage of Xingbo Du. Plain static HTML/CSS/JS, no build step (`.nojekyll` tells GitHub Pages to serve files as-is).

## Preview locally

```bash
python3 -m http.server 4000
```

Then open <http://localhost:4000>.

## Layout

- `index.html`: all content (bio, research, publications, patents, news, experience, service)
- `assets/css/site.css`: styles, including light and dark themes
- `assets/js/site.js`: theme toggle, publication filters, news expand, scroll effects
- `about/`, `news/`, `publication/`: redirects from the old URLs to sections of the homepage

## Updating

- **News**: add an `<li>` at the top of `#newsList`. The first 6 items are shown by default.
- **Publications**: add an `<li class="pub">` to the matching year group. `data-tags` takes
  `agents`, `opt`, or `interp` (space-separated). Set `data-first="1"` for first or co-first author papers.
