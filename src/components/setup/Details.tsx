import { createSignal } from "solid-js";
import { throwIfFatal } from "../../lib/error";
import { t } from "../../lib/i18n";
import { setupApi } from "../../lib/setup";
import { AppError } from "../../types/api";

export default function DetailsComponent({
  token,
  done,
}: {
  token: string;
  done: () => void;
}) {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [fatalError, setFatalError] = createSignal<Error | null>(null);

  async function submit() {
    try {
      await setupApi.details({ email: email(), password: password() }, token);
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
    done();
  }

  return (
    <>
      {throwIfFatal(fatalError, () => setFatalError(null))()}

      <div class="flex flex-col items-center">
        <h1 class="text-2xl text-center font-bold">
          {t("setup.details.title")}
        </h1>
        <form
          class="w-full"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <fieldset class="fieldset">
            <label class="label">{t("setup.details.email")}</label>
            <input
              type="email"
              class="input w-full"
              placeholder={t("setup.details.email")}
              value={email()}
              onInput={(e) => setEmail(e.target.value)}
              required
            />
            <label class="label">{t("setup.details.password")}</label>
            <input
              type="password"
              class="input w-full"
              placeholder={t("setup.details.password")}
              value={password()}
              onInput={(e) => setPassword(e.target.value)}
              required
            />
            {error() && <p class="text-error mt-2">{error()}</p>}
            <button type="submit" class="btn btn-primary mt-4">
              {t("setup.continue")}
            </button>
          </fieldset>
        </form>
      </div>
    </>
  );
}
