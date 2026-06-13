'use client';

import { useTranslations } from '@agentrepo/ui';
import { webDictionary, type WebDictionaryKey } from './dictionary';

export function useT(): (key: WebDictionaryKey) => string {
  return useTranslations(webDictionary);
}
