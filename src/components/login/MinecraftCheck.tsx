import { createSignal, onCleanup, onMount } from "solid-js";
import { throwIfFatal } from "../../lib/error";
import { loginApi } from "../../lib/login";
import { useI18n } from "../../providers/I18nProvider";
import { AppError } from "../../types/api";

/** The plugin drops a pending check after one minute, so the countdown matches that window. */
const CHECK_SECONDS = 60;

export default function MinecraftCheckComponent(props: {
  loginChallenge: string;
  done: () => void;
}) {
  const { t } = useI18n();

  const [error, setError] = createSignal<string | null>(null);
  const [fatalError, setFatalError] = createSignal<Error | null>(null);
  const [secondsLeft, setSecondsLeft] = createSignal(CHECK_SECONDS);

  let interval: ReturnType<typeof setInterval> | undefined;
  function startCountdown() {
    clearInterval(interval);
    setSecondsLeft(CHECK_SECONDS);
    interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) clearInterval(interval);
        return Math.max(0, s - 1);
      });
    }, 1000);
  }
  // the request resolves when the player joins, fails, or the window closes
  function stopCountdown() {
    clearInterval(interval);
  }
  onCleanup(stopCountdown);

  async function check() {
    startCountdown();
    let valid: boolean;
    try {
      valid = await loginApi.minecraftCheck(props.loginChallenge);
    } catch (err) {
      stopCountdown();
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
      stopCountdown();
      setError(t("minecraftCheck.error.differentIp"));
      return;
    }
    stopCountdown();
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
        {!error() && (
          <p class="text-sm opacity-70">
            {t("minecraftCheck.timeRemaining", { seconds: secondsLeft() })}
          </p>
        )}
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
