# Javier Romero — personal research website

A dependency-free static portfolio built from Javier's July 2025 CV and Google Scholar profile. It includes selected visual highlights plus 74 reviewed, non-patent Scholar records in reverse chronological order.

## Preview locally

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy

The folder can be published directly with GitHub Pages, Netlify, Vercel, or any static host. The site has no build step.

Publication previews are rendered from the corresponding paper PDFs. Records whose PDFs are not publicly retrievable are marked as unavailable instead of receiving synthetic artwork. Each publication includes PDF, Scholar, and downloadable BibTeX links where available.

The Scholar source snapshots can be parsed again with `scripts/parse_scholar.py` when the bibliography needs refreshing. Titles in `excluded-publications.txt` are omitted when `scripts/build_publication_data.py` regenerates the site data.
