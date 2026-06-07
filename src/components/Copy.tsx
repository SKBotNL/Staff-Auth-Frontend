import { createSignal } from "solid-js";
import CopyIcon from "~icons/mdi/content-copy";
import { t } from "../lib/i18n";

export default function CopyComponent(props: { textToCopy: string }) {
  const [copied, setCopied] = createSignal(false);

  return (
    <div
      class="tooltip"
      data-tip={copied() ? t("panel.copied") : t("panel.copy")}
    >
      <button
        type="button"
        class="btn btn-ghost btn-xs btn-square"
        onClick={() => {
          navigator.clipboard.writeText(props.textToCopy);
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 1000);
        }}
      >
        <CopyIcon class="text-sm" />
      </button>
    </div>
  );
}
