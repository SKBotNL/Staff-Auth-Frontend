import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";
import ErrorIcon from "~icons/mdi/error-outline";
import { useI18n } from "../providers/I18nProvider";

export default function ErrorComponent(props: {
  text: string;
  fillScreen: boolean;
  reset?: () => void;
}) {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div
      class={`flex flex-col ${props.fillScreen ? "min-h-screen" : ""} items-center justify-center`}
    >
      <ErrorIcon class="h-16 w-full mb-4" />
      <p class="text-lg text-center">{props.text}</p>
      <div class="flex flex-row gap-2">
        <Show when={props.reset}>
          {(reset) => (
            <button
              type="button"
              onClick={() => reset()()}
              class="btn btn-soft mt-4"
            >
              {t("panel.tryAgain")}
            </button>
          )}
        </Show>
        <button
          type="button"
          onClick={() => navigate(-1)}
          class="btn btn-soft mt-4"
        >
          {t("panel.goBack")}
        </button>
      </div>
    </div>
  );
}
