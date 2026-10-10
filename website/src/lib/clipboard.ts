// Clipboard write with a legacy fallback. The async Clipboard API rejects
// outside secure contexts (plain http, file:// previews, some embedded
// browsers), so fall back to the classic hidden-textarea execCommand path
// before reporting failure.
export function writeToClipboard(content: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard
      .writeText(content)
      .catch(() => legacyCopy(content));
  }
  return legacyCopy(content);
}

export function legacyCopy(content: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const area = document.createElement('textarea');
    area.value = content;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '0';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, area.value.length);
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    document.body.removeChild(area);
    if (ok) resolve();
    else reject(new Error('Copy unavailable'));
  });
}
