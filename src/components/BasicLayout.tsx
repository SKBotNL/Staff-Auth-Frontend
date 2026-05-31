import { type ParentProps, Show } from "solid-js";
import { dict, t } from "../lib/i18n";
import AppErrorBoundary from "./AppErrorBoundary";

export default function BasicLayout(props: ParentProps) {
  return (
    <Show when={dict()}>
      <AppErrorBoundary fallbackError={t("error.unknownError")}>
        {props.children}
      </AppErrorBoundary>
    </Show>
  );
}
