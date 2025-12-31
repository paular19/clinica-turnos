export function isISODateTime(value: string) {
  // basic ISO8601 datetime check (YYYY-MM-DDTHH:MM[:SS]Z or with offset)
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
  return isoRegex.test(value);
}
