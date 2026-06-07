import { useNavigate } from "@solidjs/router";
import { FiXCircle } from "solid-icons/fi";
import { Show } from "solid-js";
import { t } from "../lib/i18n";

export default function ErrorComponent(props: {
  text: string;
  fillScreen: boolean;
  reset?: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div
      class={`flex flex-col ${props.fillScreen ? "min-h-screen" : ""} items-center justify-center`}
    >
      <FiXCircle class="h-16 w-full mb-4" />
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
