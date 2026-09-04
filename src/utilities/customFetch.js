const originalFetch = window.fetch;

const customFetch = (input, options = {}) => {
  try {
    new URL(input);
    return originalFetch(input, options);
  } catch {
    const correctedPath = input.startsWith("/") ? input : `/${input}`;
    const href = window.location.href;
    const correctedHref = href.endsWith("/") ? href.slice(0, -1) : href;
    return originalFetch(`${correctedHref}${correctedPath}`, options);
  }
};

window.fetch = customFetch;
