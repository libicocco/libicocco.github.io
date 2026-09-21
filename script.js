const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px' }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const filters = document.querySelectorAll('.filter');
const publications = document.querySelectorAll('.publication');

filters.forEach((button) => {
  button.addEventListener('click', () => {
    const selected = button.dataset.filter;

    filters.forEach((filter) => {
      const isSelected = filter === button;
      filter.classList.toggle('is-active', isSelected);
      filter.setAttribute('aria-pressed', String(isSelected));
    });

    publications.forEach((publication) => {
      const categories = publication.dataset.category.split(' ');
      publication.classList.toggle('is-hidden', selected !== 'all' && !categories.includes(selected));
    });
  });
});

const publicationList = document.getElementById('publication-list');
const publicationQuery = document.getElementById('publication-query');
const publicationCount = document.getElementById('publication-count');
const publicationEmpty = document.getElementById('publication-empty');
let activePublicationYear = null;

function createPublicationCard(publication) {
  const item = document.createElement('li');
  const content = document.createElement('div');
  content.className = 'bibliography-card-body';
  const title = document.createElement('h4');
  const link = document.createElement('a');
  const details = document.createElement('p');

  link.href = publication.paper_url || publication.url;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = publication.title;
  title.appendChild(link);

  details.textContent = [publication.authors, publication.venue].filter(Boolean).join(' · ');
  content.append(title, details);

  const preview = document.createElement(publication.teaser ? 'a' : 'div');
  preview.className = `bibliography-teaser${publication.teaser ? '' : ' is-missing'}`;
  if (publication.teaser) {
    preview.href = publication.pdf_url || publication.paper_url || publication.url;
    preview.target = '_blank';
    preview.rel = 'noopener';
    const image = document.createElement('img');
    image.src = publication.teaser;
    image.alt = `Figure preview from ${publication.title}`;
    image.loading = 'lazy';
    image.width = 640;
    image.height = 360;
    preview.appendChild(image);
  } else {
    const unavailable = document.createElement('span');
    unavailable.textContent = 'Open PDF preview unavailable';
    preview.appendChild(unavailable);
  }

  const footer = document.createElement('div');
  footer.className = 'bibliography-card-footer';
  if (publication.pdf_url) {
    const pdf = document.createElement('a');
    pdf.href = publication.pdf_url;
    pdf.target = '_blank';
    pdf.rel = 'noopener';
    pdf.textContent = 'PDF';
    footer.appendChild(pdf);
  }
  const bib = document.createElement('a');
  bib.href = publication.bib;
  bib.download = '';
  bib.textContent = 'BibTeX';
  footer.appendChild(bib);
  const scholar = document.createElement('a');
  scholar.href = publication.url;
  scholar.target = '_blank';
  scholar.rel = 'noopener';
  scholar.textContent = 'Scholar';
  footer.appendChild(scholar);

  if (publication.citations) {
    const citations = document.createElement('span');
    citations.className = 'citation-count';
    citations.textContent = `${publication.citations} citation${publication.citations === '1' ? '' : 's'}`;
    footer.appendChild(citations);
  }

  item.append(preview, content, footer);
  return item;
}

function renderPublications(query = '') {
  if (!publicationList || !Array.isArray(window.PUBLICATIONS)) return;

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matches = window.PUBLICATIONS.filter((publication) => {
    const searchable = [publication.title, publication.authors, publication.venue, publication.year]
      .join(' ')
      .toLocaleLowerCase();
    return searchable.includes(normalizedQuery);
  });

  const grouped = new Map();
  matches.forEach((publication) => {
    const year = String(publication.year || 'Undated');
    if (!grouped.has(year)) grouped.set(year, []);
    grouped.get(year).push(publication);
  });
  const fragment = document.createDocumentFragment();
  const yearGrid = document.createElement('div');
  yearGrid.className = 'publication-year-grid';
  yearGrid.setAttribute('aria-label', 'Publication years');

  if (activePublicationYear && !grouped.has(activePublicationYear)) {
    activePublicationYear = null;
  }

  grouped.forEach((items, year) => {
    const button = document.createElement('button');
    button.className = 'publication-year-button';
    button.type = 'button';
    button.setAttribute('aria-controls', 'publication-year-results');
    button.setAttribute('aria-expanded', String(activePublicationYear === year));
    button.classList.toggle('is-active', activePublicationYear === year);

    const teaserPublication = items.find((publication) => publication.teaser);
    if (teaserPublication) {
      const teaser = document.createElement('img');
      teaser.src = teaserPublication.teaser;
      teaser.alt = '';
      teaser.loading = 'lazy';
      teaser.setAttribute('aria-hidden', 'true');
      button.appendChild(teaser);
    }

    const label = document.createElement('span');
    label.className = 'publication-year-label';
    label.textContent = year;
    const yearCount = document.createElement('span');
    yearCount.className = 'publication-year-count';
    yearCount.textContent = `${items.length} publication${items.length === 1 ? '' : 's'}`;
    button.append(label, yearCount);
    button.addEventListener('click', () => {
      const willOpen = activePublicationYear !== year;
      activePublicationYear = willOpen ? year : null;
      renderPublications(publicationQuery?.value || '');
      if (willOpen) {
        requestAnimationFrame(() => {
          document.getElementById('publication-year-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    });
    yearGrid.appendChild(button);
  });
  fragment.appendChild(yearGrid);

  if (activePublicationYear && grouped.has(activePublicationYear)) {
    const items = grouped.get(activePublicationYear);
    const section = document.createElement('section');
    section.id = 'publication-year-results';
    section.className = 'publication-year-panel';

    const panelHeading = document.createElement('div');
    panelHeading.className = 'publication-year-panel-heading';
    const title = document.createElement('h3');
    title.textContent = activePublicationYear;
    const summary = document.createElement('p');
    summary.textContent = `${items.length} publication${items.length === 1 ? '' : 's'}`;
    const close = document.createElement('button');
    close.className = 'publication-year-close';
    close.type = 'button';
    close.textContent = 'Close';
    close.addEventListener('click', () => {
      activePublicationYear = null;
      renderPublications(publicationQuery?.value || '');
    });
    panelHeading.append(title, summary, close);

    const list = document.createElement('ol');
    list.className = 'bibliography';
    items.forEach((publication) => list.appendChild(createPublicationCard(publication)));
    section.append(panelHeading, list);
    fragment.appendChild(section);
  }

  publicationList.replaceChildren(fragment);
  publicationCount.textContent = matches.length;
  publicationEmpty.hidden = matches.length !== 0;
}

renderPublications();
publicationQuery?.addEventListener('input', (event) => {
  activePublicationYear = null;
  renderPublications(event.target.value);
});

document.getElementById('year').textContent = new Date().getFullYear();
