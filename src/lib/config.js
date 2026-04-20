// Базовый URL платформы — меняется в одном месте
export const SITE_URL = typeof window !== 'undefined'
  ? `${window.location.origin}/mama-marketplace`
  : 'https://cursorgenesis.github.io/mama-marketplace';

export const BASE_PATH = '/mama-marketplace';
