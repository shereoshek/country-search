import { CountrySearchController, } from './services/country-search-controller.js';
const searchRoot = document.createElement('div');
searchRoot.className = 'app-shell';
document.body.append(searchRoot);
function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}
function createIcon(name) {
    const paths = {
        search: 'M21 21l-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z',
        close: 'M18 6 6 18M6 6l12 12',
        arrow: 'M5 12h14m-6-6 6 6-6 6',
    };
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('stroke-width', '1.7');
    icon.setAttribute('stroke-linecap', 'round');
    icon.setAttribute('stroke-linejoin', 'round');
    icon.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', paths[name]);
    icon.append(path);
    return icon;
}
const main = createElement('main', 'main-content');
const hero = createElement('section', 'hero-section');
const heroEyebrow = createElement('div', 'eyebrow', 'THE WORLD, AT YOUR FINGERTIPS');
const title = createElement('h1', 'hero-title');
title.append(document.createTextNode('Find a place '), createElement('span', 'hero-title-accent', 'to belong.'));
const description = createElement('p', 'hero-description', 'A thoughtful guide to the countries of our world. Search by name and explore the details that make each place unique.');
const searchForm = createElement('form', 'search-form');
searchForm.setAttribute('role', 'search');
const searchIcon = createElement('span', 'search-icon');
searchIcon.append(createIcon('search'));
const searchInput = createElement('input', 'search-input');
searchInput.type = 'search';
searchInput.name = 'country';
searchInput.placeholder = 'Try “Japan”, “New Zealand”, “Brazil”…';
searchInput.autocomplete = 'off';
searchInput.spellcheck = false;
searchInput.setAttribute('aria-label', 'Search countries by name');
searchInput.setAttribute('aria-describedby', 'search-hint');
const clearButton = createElement('button', 'clear-button');
clearButton.type = 'button';
clearButton.setAttribute('aria-label', 'Clear search');
clearButton.append(createIcon('close'));
clearButton.hidden = true;
const submitButton = createElement('button', 'search-button', 'Explore');
submitButton.type = 'submit';
submitButton.append(createIcon('arrow'));
searchForm.append(searchIcon, searchInput, clearButton, submitButton);
const searchHint = createElement('div', 'search-hint', 'Search updates as you type');
searchHint.id = 'search-hint';
const quickSearches = createElement('div', 'quick-searches');
quickSearches.append(createElement('span', 'quick-label', 'A place to start'));
const resultsSection = createElement('section', 'results-section');
resultsSection.setAttribute('aria-live', 'polite');
resultsSection.setAttribute('aria-busy', 'false');
const resultsHeader = createElement('div', 'results-header');
const resultsHeadingGroup = createElement('div', 'results-heading-group');
const resultsEyebrow = createElement('div', 'section-eyebrow', 'YOUR DISCOVERIES');
const resultsTitle = createElement('h2', 'results-title', 'Explore the world');
const resultsSubtitle = createElement('p', 'results-subtitle', 'A world of places, one search away.');
resultsHeadingGroup.append(resultsEyebrow, resultsTitle, resultsSubtitle);
const resultsCount = createElement('span', 'results-count');
resultsHeader.append(resultsHeadingGroup, resultsCount);
const resultsContent = createElement('div', 'results-content');
resultsSection.append(resultsHeader, resultsContent);
const footer = createElement('footer', 'site-footer');
footer.append(createElement('span', 'footer-note', 'Made for the curious.'));
const footerSource = createElement('a', 'footer-source', 'Country data by countries.dev');
footerSource.href = 'https://countries.dev/docs';
footerSource.target = '_blank';
footerSource.rel = 'noreferrer';
footer.append(footerSource);
hero.append(heroEyebrow, title, description, searchForm, searchHint, quickSearches);
main.append(hero, resultsSection);
searchRoot.append(main, footer);
const detailsDialog = createElement('dialog', 'country-dialog');
detailsDialog.setAttribute('aria-labelledby', 'dialog-country-name');
const dialogContent = createElement('div', 'dialog-content');
detailsDialog.append(dialogContent);
searchRoot.append(detailsDialog);
function formatNumber(value) {
    if (value === null || !Number.isFinite(value)) {
        return 'Not available';
    }
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}
function createFlag(country, className) {
    const wrapper = createElement('span', className);
    if (/^https?:\/\//i.test(country.flag)) {
        const image = createElement('img');
        image.src = country.flag;
        image.alt = `${country.name} flag`;
        image.loading = 'lazy';
        image.decoding = 'async';
        image.addEventListener('error', () => wrapper.replaceChildren(document.createTextNode('🌐')), {
            once: true,
        });
        wrapper.append(image);
    }
    else {
        wrapper.textContent = country.flag || '🌐';
    }
    return wrapper;
}
function createMetaItem(label, value) {
    const item = createElement('div', 'meta-item');
    item.append(createElement('span', 'meta-label', label), createElement('span', 'meta-value', value));
    return item;
}
function showCountryDetails(country) {
    dialogContent.replaceChildren();
    const dialogHeader = createElement('div', 'dialog-header');
    const identity = createElement('div', 'dialog-identity');
    identity.append(createFlag(country, 'dialog-flag'), createElement('span', 'dialog-kicker', 'COUNTRY PROFILE'));
    const countryName = createElement('h2', 'dialog-country-name', country.name);
    countryName.id = 'dialog-country-name';
    identity.append(countryName);
    const closeButton = createElement('button', 'dialog-close');
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close country details');
    closeButton.append(createIcon('close'));
    closeButton.addEventListener('click', () => detailsDialog.close());
    dialogHeader.append(identity, closeButton);
    const overview = createElement('p', 'dialog-overview');
    const overviewParts = [];
    if (country.region) {
        overviewParts.push(`${country.name} is located in ${country.region}`);
    }
    else {
        overviewParts.push(`Explore key facts about ${country.name}`);
    }
    if (country.capital) {
        overviewParts.push(`its capital is ${country.capital}`);
    }
    overview.textContent = `${overviewParts.join(' and ')}.`;
    const statGrid = createElement('div', 'dialog-stat-grid');
    const populationStat = createElement('div', 'dialog-stat');
    populationStat.append(createElement('span', 'dialog-stat-label', 'POPULATION'), createElement('strong', 'dialog-stat-value', formatNumber(country.population)));
    const areaStat = createElement('div', 'dialog-stat');
    areaStat.append(createElement('span', 'dialog-stat-label', 'AREA'), createElement('strong', 'dialog-stat-value', country.area === null ? 'Not available' : `${formatNumber(country.area)} km²`));
    statGrid.append(populationStat, areaStat);
    const infoGrid = createElement('div', 'dialog-info-grid');
    infoGrid.append(createMetaItem('Capital', country.capital ?? 'Not available'), createMetaItem('Region', country.region ?? 'Not available'));
    const createTagSection = (titleText, values, emptyText) => {
        const section = createElement('section', 'dialog-list-section');
        section.append(createElement('h3', 'dialog-section-title', titleText));
        const list = createElement('div', 'tag-list');
        if (values.length === 0) {
            list.append(createElement('span', 'detail-muted', emptyText));
        }
        else {
            values.forEach((value) => list.append(createElement('span', 'detail-tag', value)));
        }
        section.append(list);
        return section;
    };
    const currencyNames = country.currencies.map((currency) => {
        const code = currency.code ? ` (${currency.code})` : '';
        const symbol = currency.symbol ? ` ${currency.symbol}` : '';
        return `${currency.name}${code}${symbol}`;
    });
    const detailsLists = createElement('div', 'dialog-lists');
    detailsLists.append(createTagSection('Languages', country.languages, 'No language data available'), createTagSection('Currencies', currencyNames, 'No currency data available'), createTagSection('Bordering countries', country.borders, 'No land borders listed'));
    dialogContent.append(dialogHeader, overview, statGrid, infoGrid, detailsLists);
    detailsDialog.showModal();
}
function createCountryCard(country) {
    const button = createElement('button', 'country-card');
    button.type = 'button';
    button.setAttribute('aria-label', `View details for ${country.name}`);
    const cardTop = createElement('div', 'country-card-top');
    cardTop.append(createFlag(country, 'country-flag'), createIcon('arrow'));
    const countryName = createElement('h3', 'country-name', country.name);
    const countrySubtitle = createElement('p', 'country-native-name', country.region ?? 'Country profile');
    const divider = createElement('span', 'card-divider');
    const details = createElement('div', 'country-card-meta');
    details.append(createMetaItem('Capital', country.capital ?? 'Not available'), createMetaItem('Region', country.region ?? 'Not available'));
    const population = createElement('div', 'country-population');
    population.append(createElement('span', 'population-label', 'POPULATION'), createElement('span', 'population-value', formatNumber(country.population)));
    button.append(cardTop, countryName, countrySubtitle, divider, details, population);
    button.addEventListener('click', () => showCountryDetails(country));
    return button;
}
function createEmptyState(icon, heading, message, variant = '') {
    const state = createElement('div', `empty-state ${variant}`.trim());
    const titleText = createElement('h3', 'empty-state-title', heading);
    const descriptionText = createElement('p', 'empty-state-description', message);
    if (icon !== null) {
        state.append(createElement('div', 'empty-state-mark', icon));
    }
    else {
        state.classList.add('empty-state-no-mark');
    }
    state.append(titleText, descriptionText);
    return state;
}
function renderState(state) {
    resultsContent.replaceChildren();
    resultsSection.setAttribute('aria-busy', state.status === 'loading' ? 'true' : 'false');
    resultsCount.textContent = '';
    if (state.status === 'idle') {
        resultsTitle.textContent = 'Explore the world';
        resultsSubtitle.textContent = 'A world of places, one search away.';
        resultsContent.append(createEmptyState(null, 'Your next discovery starts here', 'Choose a suggestion above or type a country name to begin.'));
        return;
    }
    if (state.status === 'loading') {
        resultsTitle.textContent = 'Finding places';
        resultsSubtitle.textContent = `Looking for “${state.query}”…`;
        const loading = createElement('div', 'loading-state');
        const spinner = createElement('span', 'loading-spinner');
        spinner.setAttribute('aria-hidden', 'true');
        loading.append(spinner, createElement('span', '', 'Gathering country details'));
        resultsContent.append(loading);
        return;
    }
    if (state.status === 'empty') {
        resultsTitle.textContent = 'No matches this time';
        resultsSubtitle.textContent = `We could not find a country matching “${state.query}”.`;
        resultsContent.append(createEmptyState('⌕', 'No country found', 'Check the spelling or try another country name.', 'empty-state-compact'));
        return;
    }
    if (state.status === 'error') {
        resultsTitle.textContent = 'The connection took a detour';
        resultsSubtitle.textContent = `We could not complete the search for “${state.query}”.`;
        const errorPanel = createElement('div', 'error-panel');
        errorPanel.append(createElement('span', 'error-mark', '!'), createElement('h3', 'empty-state-title', 'Something went wrong'), createElement('p', 'empty-state-description', 'Check your connection and try the search again.'));
        const retryButton = createElement('button', 'retry-button', 'Try again');
        retryButton.type = 'button';
        retryButton.append(createIcon('arrow'));
        retryButton.addEventListener('click', () => controller.retryLastSearch());
        errorPanel.append(retryButton);
        resultsContent.append(errorPanel);
        return;
    }
    resultsTitle.textContent = 'Search results';
    resultsSubtitle.textContent = `Showing countries matching “${state.query}”.`;
    resultsCount.textContent = `${state.countries.length} ${state.countries.length === 1 ? 'COUNTRY' : 'COUNTRIES'}`;
    const grid = createElement('div', 'country-grid');
    state.countries.forEach((country) => grid.append(createCountryCard(country)));
    resultsContent.append(grid);
}
const controller = new CountrySearchController(renderState, 300);
['Japan', 'Spain', 'Canada', 'New Zealand'].forEach((query) => {
    const button = createElement('button', 'quick-chip', query);
    button.type = 'button';
    button.addEventListener('click', () => {
        searchInput.value = query;
        clearButton.hidden = false;
        controller.handleInput(query);
    });
    quickSearches.append(button);
});
searchInput.addEventListener('input', () => {
    clearButton.hidden = searchInput.value.length === 0;
    controller.handleInput(searchInput.value);
});
searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    controller.handleInput(searchInput.value);
});
clearButton.addEventListener('click', () => {
    searchInput.value = '';
    clearButton.hidden = true;
    controller.handleInput('');
    searchInput.focus();
});
detailsDialog.addEventListener('click', (event) => {
    if (event.target === detailsDialog) {
        detailsDialog.close();
    }
});
renderState({ status: 'idle' });
