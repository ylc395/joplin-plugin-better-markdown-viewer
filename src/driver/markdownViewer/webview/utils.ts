import { QuerySettingRequest, MARKDOWN_SCRIPT_ID } from '../../constants';

declare const webviewApi: {
  postMessage: <T>(id: string, payload: QuerySettingRequest) => Promise<T>;
};

export function getLine(el: HTMLElement | null): number | null {
  if (!el) {
    return null;
  }

  if (el.dataset.sourceLine) {
    return Number(el.dataset.sourceLine);
  }

  if (!el.parentElement) {
    return null;
  }

  return getLine(el.parentElement);
}

export function getLineEl(line: number) {
  for (let i = line; i >= 1; i--) {
    const el = document.querySelector(`[data-source-line="${i}"]`);

    if (el) {
      if (el.tagName === 'CODE' && el.parentElement && el.parentElement.tagName === 'PRE') {
        // Fenched code blocks are a special case since the `code-line` can only be marked on
        // the `<code>` element and not the parent `<pre>` element.
        return el.parentElement;
      }

      return el;
    }
  }

  return null;
}

export function getLineOfNode(node: Node | null) {
  if (!node || node.nodeType !== Node.TEXT_NODE) {
    return null;
  }

  const el = node.parentElement;
  const line = getLine(el);

  return line;
}

export async function isDarkTheme() {
  const mainTheme = await webviewApi.postMessage<number>(MARKDOWN_SCRIPT_ID, {
    event: 'querySetting',
    payload: { key: 'theme', isGlobal: true },
  });
  const autoSwitch = await webviewApi.postMessage<boolean>(MARKDOWN_SCRIPT_ID, {
    event: 'querySetting',
    payload: { key: 'themeAutoDetect', isGlobal: true },
  });
  const preferredDarkTheme = await webviewApi.postMessage<number>(MARKDOWN_SCRIPT_ID, {
    event: 'querySetting',
    payload: { key: 'preferredDarkTheme', isGlobal: true },
  });

  // @see https://github.com/laurent22/joplin/blob/8c1a3d0ac1ea27f6dfd34699d3c488ed5ffe8cf7/packages/lib/models/Setting.ts#L188
  const DARK_THEME = [2, 22, 4, 5, 6, 7];
  const isMainThemeDark = DARK_THEME.includes(mainTheme);
  const isPreferredThemeDark = DARK_THEME.includes(preferredDarkTheme);
  const isSystemDark =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (isSystemDark && autoSwitch) {
    return isPreferredThemeDark;
  } else {
    return isMainThemeDark;
  }
}
