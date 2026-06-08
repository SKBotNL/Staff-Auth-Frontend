import { createAsync, useNavigate } from "@solidjs/router";
import { createSignal, Suspense } from "solid-js";
import { throwIfFatal } from "../../lib/error";
import { setupApi } from "../../lib/setup";
import { useI18n } from "../../providers/I18nProvider";
import { AppError } from "../../types/api";
import Loader from "../Loader";

function TotpSetup(props: { token: string }) {
  const { t } = useI18n();

  const navigate = useNavigate();
  const totpData = createAsync(() => setupApi.totpSetup(props.token));
  const [code, setCode] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [fatalError, setFatalError] = createSignal<Error | null>(null);

  async function submit() {
    try {
      await setupApi.totpVerify(code(), props.token);
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
    navigate("/successful-setup");
  }

  return (
    <>
      {throwIfFatal(fatalError, () => setFatalError(null))()}

      <h2 class="text-lg text-center">
        {t("setup.totpSetup.addToAuthenticator")}
      </h2>
      <img
        class="w-72"
        src={totpData()?.qrCode}
        alt={t("setup.totpSetup.totpQrCode")}
      ></img>
      <div class="collapse bg-base-100 border border-base-300">
        <input type="checkbox" />
        <div class="collapse-title font-semibold">
          {t("setup.totpSetup.showSecret")}
        </div>
        <div class="collapse-content text-sm">{totpData()?.secret}</div>
      </div>
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
          {error() && <p class="text-error mt-2">{error()}</p>}
          <button type="submit" class="btn btn-primary mt-4">
            {t("setup.continue")}
          </button>
        </fieldset>
      </form>
    </>
  );
}

export default function TotpSetupComponent(props: { token: string }) {
  const { t } = useI18n();

  return (
    <Suspense
      fallback={
        <Loader text={t("setup.totpSetup.loading")} fillScreen={false} />
      }
    >
      <div class="flex flex-col items-center gap-6">
        <h1 class="text-2xl text-center font-bold">
          {t("setup.totpSetup.title")}
        </h1>
        <TotpSetup token={props.token} />
      </div>
    </Suspense>
  );
}
