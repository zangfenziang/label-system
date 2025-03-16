export const isProd = () =>
  !location.href.startsWith('https://127.0.0.1') && !location.href.startsWith('https://localhost')
