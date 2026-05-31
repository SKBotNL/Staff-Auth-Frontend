import { ErrorBoundary, type JSX } from "solid-js";
import { t } from "../lib/i18n";
import { AppError } from "../types/api";
import Error from "./Error";

export default function AppErrorBoundaryComponent(props: {
  children: JSX.Element;
  fallbackError: string;
}) {
  return (
    <ErrorBoundary
      fallback={(e, reset) => {
        let text;
        let canReset = true;
        if (e instanceof TypeError) {
          text = t("error.networkError");
        } else if (e instanceof AppError) {
          if (e.message === t("error.unknownError")) {
            text = props.fallbackError;
          } else {
            text = e.message;
          }
          canReset = e.kind !== "fatal";
        } else {
          text = props.fallbackError;
        }

        return (
          <Error
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
