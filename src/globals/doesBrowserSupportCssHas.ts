function doesBrowserSupportCssHas(): boolean {
  // if env is not browser:
  if (typeof window === 'undefined' || typeof window.CSS === 'undefined') {
    return false;
  }

  try {
    return CSS.supports('selector(:has(*))');
  } catch (e) {
    return false;
  }
}

const browserSupportsCssHas = doesBrowserSupportCssHas();

export default browserSupportsCssHas;
