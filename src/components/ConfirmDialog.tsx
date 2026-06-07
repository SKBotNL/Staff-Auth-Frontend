import { FiAlertTriangle } from "solid-icons/fi";
import { createSignal, onMount } from "solid-js";
import { t } from "../lib/i18n";

export type ConfirmDialogRef = {
  open: (text: string, confirmCallback: () => void) => void;
  close: () => void;
};

export default function ConfirmDialogComponent({
  ref,
}: {
  ref: (r: ConfirmDialogRef) => void;
}) {
  const [text, setText] = createSignal<string>("");
  const [confirmCallback, setConfirmCallback] = createSignal<() => void>();

  let dialogRef!: HTMLDialogElement;

  onMount(() => {
    ref({
      open: (text: string, confirmCallback: () => void) => {
        setText(text);
        setConfirmCallback(() => confirmCallback);
        dialogRef.showModal();
      },
      close: () => dialogRef.close(),
    });
  });

  return (
    <dialog class="modal" ref={dialogRef}>
      <div class="modal-box flex flex-col items-center gap-6">
        <FiAlertTriangle class="text-4xl text-warning" />
        <div class="flex flex-col items-center">
          <h3 class="text-xl font-bold">{t("panel.areYouSure")}</h3>
          <p class="text-md text-base-content/80">{text()}</p>
        </div>
        <form method="dialog" class="modal-backdrop">
          <div class="w-full py-2 flex flex-row gap-2">
            <button
              type="submit"
              onClick={() => confirmCallback()?.()}
              class="btn btn-error flex-1"
            >
              {t("panel.yes")}
            </button>
            <button type="submit" class="btn btn-primary flex-1">
              {t("panel.no")}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
