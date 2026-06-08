import type { ParentProps } from "solid-js";
import { useI18n } from "../providers/I18nProvider";
import AppErrorBoundary from "./AppErrorBoundary";

export default function BasicLayout(props: ParentProps) {
  const { t } = useI18n();

  return (
    <AppErrorBoundary fallbackError={t("error.unknownError")}>
      {props.children}
    </AppErrorBoundary>
  );
}
