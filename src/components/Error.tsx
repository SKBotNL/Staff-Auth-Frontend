import { FiXCircle } from "solid-icons/fi";
import { t } from "../lib/i18n";
import { Show } from "solid-js";

export default function ErrorComponent({
  text,
  fillScreen,
  reset,
}: {
  text: string;
  fillScreen: boolean;
  reset?: () => void;
}) {
  return (
    <div
      class={`flex flex-col ${fillScreen ? "min-h-screen" : ""} items-center justify-center`}
    >
      <FiXCircle class="h-16 w-full mb-4" />
      <p class="text-lg text-center">{text}</p>
      <Show when={reset}>
        {(reset) => (
          <button onClick={() => reset()()} class="btn btn-soft mt-4">
            {t("panel.tryAgain")}
          </button>
        )}
      </Show>
    </div>
  );
}
