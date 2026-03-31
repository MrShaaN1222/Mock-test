import ApiError from "./ApiError.js";

export function parsePagination(query, defaults = { page: 1, limit: 20, maxLimit: 100 }) {
  const page = Number.parseInt(query?.page, 10) || defaults.page;
  const limit = Number.parseInt(query?.limit, 10) || defaults.limit;

  if (page < 1 || limit < 1) {
    throw new ApiError(400, "Pagination values must be positive integers");
  }

  return {
    page,
    limit: Math.min(limit, defaults.maxLimit),
    skip: (page - 1) * Math.min(limit, defaults.maxLimit)
  };
}

export function sanitizeText(value, { maxLen = 200 } = {}) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\$|\./g, "").slice(0, maxLen);
}

export function parseBooleanQuery(value) {
  if (typeof value === "undefined") return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new ApiError(400, "Boolean query params must be true or false");
}
