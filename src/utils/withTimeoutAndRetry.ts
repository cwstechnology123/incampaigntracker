// utils/withTimeoutAndRetry.ts
export const withTimeoutAndRetry = async (
  fn: (ctx?: { signal?: AbortSignal }) => Promise<any>,
  retries = 3,
  timeout = 5000
): Promise<any> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const result = await fn({ signal: controller.signal });

      clearTimeout(timer);
      return result;
    } catch (err: any) {
      if (attempt === retries) throw err;
      console.warn(`Attempt ${attempt} failed, retrying...`, err.message);
    }
  }
};