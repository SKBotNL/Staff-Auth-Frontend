import { createSignal, onMount } from "solid-js";
import AlertIcon from "~icons/mdi/alert-outline";
import { useI18n } from "../providers/I18nProvider";

export type ConfirmDialogRef = {
  open: (
    text: string,
    confirmCallback: () => Promise<string | null>,
    closeCallback: () => void,
  ) => void;
  close: () => void;
};

export default function ConfirmDialogComponent(props: {
  ref: (r: ConfirmDialogRef) => void;
}) {
  const { t } = useI18n();

  const [text, setText] = createSignal<string>("");
  const [error, setError] = createSignal<string | null>(null);
  const [confirming, setConfirming] = createSignal(false);
  const [confirmCallback, setConfirmCallback] =
    createSignal<() => Promise<string | null>>();
  const [closeCallback, setCloseCallback] = createSignal<() => void>();

  let dialogRef!: HTMLDialogElement;

  onMount(() => {
    props.ref({
      open: (
        text: string,
        confirmCallback: () => Promise<string | null>,
        closeCallback: () => void,
      ) => {
        setText(text);
        setConfirmCallback(() => confirmCallback);
        setCloseCallback(() => closeCallback);
        dialogRef.showModal();
      },
      close: () => dialogRef.close(),
    });
  });

  return (
    <dialog
      class="modal"
      ref={dialogRef}
      onTransitionEnd={(e) => {
        if (e.propertyName === "opacity" && !dialogRef.open) {
          setError(null);
        }
      }}
    >
      <div class="modal-box flex flex-col items-center gap-6">
        <AlertIcon class="text-5xl text-warning" />
        <div class="flex flex-col items-center">
          <h3 class="text-xl font-bold">{t("panel.areYouSure")}</h3>
          <p class="text-base text-base-content/80">{text()}</p>
        </div>
        <form method="dialog" class="modal-backdrop">
          {error() && <p class="text-error">{error()}</p>}
          <div class="w-full py-2 flex flex-row gap-2">
            <button
              type="submit"
              onClick={async () => {
                setConfirming(true);
                const error = await confirmCallback()?.();
                setConfirming(false);
                if (!error) {
                  dialogRef.close();
                  closeCallback()?.();
                  return;
                }
                setError(error);
              }}
              class="btn btn-error flex-1"
              disabled={confirming()}
            >
              {t("panel.yes")}
            </button>
            <button
              type="submit"
              class="btn btn-primary flex-1"
              disabled={confirming()}
            >
              {t("panel.no")}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
