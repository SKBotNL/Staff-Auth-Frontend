import * as i18n from "@solid-primitives/i18n";
import { createContext } from "solid-js";

/*
Assuming the dictionaries are in the following structure:
./i18n
  en.ts
  fr.ts
  es.ts
And all exports a `dict` object
*/

// use `type` to not include the actual dictionary in the bundle
import type * as en from "../i18n/en.ts";

export type Locale = "en"; // | "nl"
export type RawDictionary = typeof en.dict;
export type Dictionary = i18n.Flatten<RawDictionary>;
export type TranslationKey = {
  [K in keyof Dictionary]: Dictionary[K] extends string ? K : never;
}[keyof Dictionary];

export async function fetchDictionary(locale: Locale): Promise<Dictionary> {
  const dict: RawDictionary = (await import(`../i18n/${locale}.ts`)).dict;
  return i18n.flatten(dict);
}

export const I18nContext = createContext<{
  locale: () => Locale;
  setLocale: (locale: Locale) => void;
  t: i18n.Translator<Dictionary>;
}>();
