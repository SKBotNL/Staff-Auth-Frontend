import { ErrorBoundary, type ParentProps } from "solid-js";
import { LOGIN_URL } from "../lib/api";
import { useI18n } from "../providers/I18nProvider";
import { AppError, NeedToLoginError } from "../types/api";
import ErrorComponent from "./ErrorComponent";

export default function AppErrorBoundaryComponent(
  props: ParentProps<{ fallbackError: string }>,
) {
  const { t } = useI18n();

  return (
    <ErrorBoundary
      fallback={(e, reset) => {
        let text: string;
        let canReset = true;
        if (e instanceof NeedToLoginError) {
          window.location.href = LOGIN_URL;
          return;
        } else if (e instanceof TypeError) {
          text = t("error.networkError");
        } else if (e instanceof AppError) {
          if (e.message === t("error.unknownError")) {
            text = props.fallbackError;
          } else {
            text = t(e.message);
          }
          canReset = e.kind !== "fatal";
        } else {
          text = props.fallbackError;
        }

        return (
          <ErrorComponent
            text={text}
            fillScreen={true}
            reset={canReset ? reset : undefined}
          />
        );
      }}
    >
      {props.children}
    </ErrorBoundary>
  );
}
