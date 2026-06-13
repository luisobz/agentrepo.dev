'use client';

import { useTranslations } from '@agentrepo/ui';
import { adminDictionary, type AdminDictionaryKey } from './dictionary';

export function useT(): (key: AdminDictionaryKey) => string {
  return useTranslations(adminDictionary);
}
