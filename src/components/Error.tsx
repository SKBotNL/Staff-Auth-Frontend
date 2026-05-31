import { FiXCircle } from "solid-icons/fi";
import { t } from "../lib/i18n";
import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";

export default function ErrorComponent({
  text,
  fillScreen,
  reset,
}: {
  text: string;
  fillScreen: boolean;
  reset?: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div
      class={`flex flex-col ${fillScreen ? "min-h-screen" : ""} items-center justify-center`}
    >
      <FiXCircle class="h-16 w-full mb-4" />
      <p class="text-lg text-center">{text}</p>
      <div class="flex flex-row gap-2">
        <Show when={reset}>
          {(reset) => (
            <button onClick={() => reset()()} class="btn btn-soft mt-4">
              {t("panel.tryAgain")}
            </button>
          )}
        </Show>
        <button onClick={() => navigate(-1)} class="btn btn-soft mt-4">
          {t("panel.goBack")}
        </button>
      </div>
    </div>
  );
}
