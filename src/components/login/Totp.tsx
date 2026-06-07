import { createSignal } from "solid-js";
import { throwIfFatal } from "../../lib/error";
import { t } from "../../lib/i18n";
import { loginApi } from "../../lib/login";
import { AppError } from "../../types/api";

export default function TotpComponent(props: { loginChallenge: string }) {
  const [code, setCode] = createSignal("");
  const [rememberMe, setRememberMe] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [fatalError, setFatalError] = createSignal<Error | null>(null);

  async function submit() {
    let redirectUrl: string;
    try {
      redirectUrl = await loginApi.totp(
        code(),
        rememberMe(),
        props.loginChallenge,
      );
    } catch (err) {
      if (!(err instanceof AppError)) {
        setFatalError(err as Error);
        return;
      }
      if (err.kind === "fatal") {
        setFatalError(err);
        return;
      }
      setError(err.message);
      return;
    }
    window.location.href = redirectUrl;
  }

  return (
    <>
      {throwIfFatal(fatalError, () => setFatalError(null))()}

      <div class="flex flex-col items-center">
        <h1 class="text-2xl text-center font-bold">{t("totp.title")}</h1>
        <form
          class="w-full"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <fieldset class="fieldset">
            <label for="code" class="label">
              {t("totp.code")}
            </label>
            <input
              id="code"
              type="text"
              class="input validator w-full"
              placeholder={t("totp.code")}
              value={code()}
              onInput={(e) => setCode(e.target.value)}
              required
              pattern="\d{6}"
              title={t("totp.error.enterValidCode")}
            />
            <div class="validator-hint hidden">
              {t("totp.error.enterValidCode")}
            </div>
            <label class="label">
              <input
                type="checkbox"
                checked={rememberMe()}
                onChange={(e) => setRememberMe(e.target.checked)}
                class="toggle"
              />
              {t("login.rememberMe")}
            </label>
            {error() && <p class="text-error mt-2">{error()}</p>}
            <button type="submit" class="btn btn-primary mt-4">
              {t("login.continue")}
            </button>
          </fieldset>
        </form>
      </div>
    </>
  );
}
