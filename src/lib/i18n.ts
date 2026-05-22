import { createSignal } from "solid-js";
import { createAsync } from "@solidjs/router";
import * as i18n from "@solid-primitives/i18n";

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

async function fetchDictionary(locale: Locale): Promise<Dictionary> {
  const dict: RawDictionary = (await import(`../i18n/${locale}.ts`)).dict;
  return i18n.flatten(dict); // flatten the dictionary to make all nested keys available top-level
}

export const [locale, setLocale] = createSignal<Locale>("en");
export const dict = createAsync(() => fetchDictionary(locale()));
export const t = i18n.translator(
  () => dict() ?? ({} as Dictionary),
  i18n.resolveTemplate,
);
