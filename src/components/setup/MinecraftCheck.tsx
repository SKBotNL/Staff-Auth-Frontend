import { createSignal, onMount } from "solid-js";
import { throwIfFatal } from "../../lib/error";
import { setupApi } from "../../lib/setup";
import { useI18n } from "../../providers/I18nProvider";
import { AppError } from "../../types/api";

export default function MinecraftCheckComponent(props: {
  token: string;
  done: () => void;
}) {
  const { t } = useI18n();

  const [error, setError] = createSignal<string | null>(null);
  const [fatalError, setFatalError] = createSignal<Error | null>(null);

  async function check() {
    let valid: boolean;
    try {
      valid = await setupApi.minecraftCheck(props.token);
    } catch (err) {
      if (!(err instanceof AppError)) {
        setFatalError(err as Error);
        return;
      }
      if (err.kind === "fatal") {
        setFatalError(err);
        return;
      }
      setError(t(err.message));
      return;
    }
    if (!valid) {
      setError(t("minecraftCheck.error.differentIp"));
      return;
    }
    props.done();
  }

  onMount(check);

  return (
    <>
      {throwIfFatal(fatalError, () => setFatalError(null))()}

      <div class="flex flex-col items-center gap-6">
        <h1 class="text-2xl text-center font-bold">
          {t("minecraftCheck.title")}
        </h1>
        {!error() && <span class="loading loading-ring w-24"></span>}
        {!error() && <p class="text-lg">{t("minecraftCheck.logIn")}</p>}
        {error() && <p class="text-error">{error()}</p>}
        {error() && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              check();
            }}
            class="btn btn-primary w-full"
          >
            Retry
          </button>
        )}
      </div>
    </>
  );
}
