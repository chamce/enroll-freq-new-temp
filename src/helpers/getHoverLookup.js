export const getHoverLookup = (activeDataPoints) =>
  Array.isArray(activeDataPoints) ? activeDataPoints[0]?.lookup ?? null : null;
