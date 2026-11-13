# t3a1.github.io

Source of my portfolio, <https://t3a1.github.io>, written as a Unix manual page.

Built by GitHub Pages with Jekyll: no build step to run.

| Path | Content |
|------|---------|
| `_layouts/man.html` | The only template: header and footer lines, status bar, help screen |
| `_data/projects.yml` | Project list shown on the home page |
| `_data/i18n.yml` | Interface labels in French and English |
| `fr/`, `en/` | Home page and one page per project, in each language |
| `assets/css/man.css` | Styles (light and dark follow the system setting) |
| `assets/js/keys.js` | `less`-style keys: `j` `k` `/` `n` `g` `G` `h` `l` `q` |

To add the résumé, put the PDF in `assets/cv/` and set `cv_fr` / `cv_en` in `_config.yml`.

Preview locally:

```sh
docker run --rm -p 4000:4000 -v "$PWD":/srv/jekyll jekyll/jekyll jekyll serve
```
