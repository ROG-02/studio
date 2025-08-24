// Inspired by https://github.com/JohannesKlauss/react-hotkeys-hook

'use client';

import { useEffect, useCallback } from 'react';

type Hotkey = [string, (event: KeyboardEvent) => void, any?];

const map: Record<string, string> = {
  alt: 'Alt',
  ctrl: 'Control',
  meta: 'Meta',
  shift: 'Shift',
};

const a = (key: string, fn: (event: KeyboardEvent) => void, options: any) => [key, fn, options];

function parseHotkey(hotkey: string) {
  return hotkey.split('+').reduce(
    (acc, k) => {
      k = k.toLowerCase();
      if (map[k]) {
        acc.meta.push(map[k]);
      } else {
        acc.key = k;
      }
      return acc;
    },
    { meta: [] as string[], key: '' }
  );
}

export function useHotkeys(hotkeys: Hotkey[]) {
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      hotkeys.forEach(([hotkey, handler]) => {
        const { key, meta } = parseHotkey(hotkey);

        if (event.key.toLowerCase() === key) {
          const allMetaPressed = meta.every(
            (metaKey) => event.getModifierState(metaKey)
          );
          if (allMetaPressed) {
            event.preventDefault();
            handler(event);
          }
        }
      });
    },
    [hotkeys]
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);
}
