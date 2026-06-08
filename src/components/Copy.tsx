import { createSignal } from "solid-js";
import CopyIcon from "~icons/mdi/content-copy";
import { useI18n } from "../providers/I18nProvider";

export default function CopyComponent(props: { textToCopy: string }) {
  const { t } = useI18n();

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
