import * as i18n from "@solid-primitives/i18n";
import { createAsync } from "@solidjs/router";
import { createSignal, type ParentProps, Show, useContext } from "solid-js";
import Loader from "../components/Loader";
import {
  type Dictionary,
  fetchDictionary,
  I18nContext,
  type Locale,
} from "../contexts/I18nContext";

export function I18nProvider(props: ParentProps) {
  const [locale, setLocale] = createSignal<Locale>("en");
  const dict = createAsync(() => fetchDictionary(locale()));
  const t = i18n.translator(
    () => dict() ?? ({} as Dictionary),
    i18n.resolveTemplate,
  );

  return (
    <I18nContext.Provider
      value={{ locale, setLocale: (l: Locale) => setLocale(l), t }}
    >
      <Show
        when={dict()}
        fallback={<Loader text={undefined} fillScreen={true} />}
      >
        {props.children}
      </Show>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
