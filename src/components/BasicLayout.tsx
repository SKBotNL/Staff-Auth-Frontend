import { ErrorBoundary, ParentProps, Show } from "solid-js";
import { AppError } from "../types/api";
import { dict, t } from "../lib/i18n";
import Error from "./Error";

export default function BasicLayout(props: ParentProps) {
  return (
    <Show when={dict()}>
      <ErrorBoundary
        fallback={(e, reset) => {
          let text;
          let canReset = true;
          if (e instanceof TypeError) {
            text = t("error.networkError");
          } else if (e instanceof AppError) {
            text = e.message;
            canReset = e.kind !== "fatal";
          } else {
            text = t("error.unknownError");
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
    </Show>
  );
}
