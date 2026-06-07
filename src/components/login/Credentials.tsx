import { createSignal } from "solid-js";
import { throwIfFatal } from "../../lib/error";
import { t } from "../../lib/i18n";
import { loginApi } from "../../lib/login";
import { AppError } from "../../types/api";

export default function CredentialsComponent(props: {
  loginChallenge: string;
  done: () => void;
}) {
  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [fatalError, setFatalError] = createSignal<Error | null>(null);

  async function submit() {
    try {
      await loginApi.credentials(
        {
          username: username(),
          password: password(),
        },
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
    props.done();
  }

  return (
    <>
      {throwIfFatal(fatalError, () => setFatalError(null))()}

      <div class="flex flex-col items-center">
        <h1 class="text-2xl text-center font-bold">
          {t("login.credentials.title")}
        </h1>
        <form
          class="w-full"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <fieldset class="fieldset">
            <label for="username" class="label">
              {t("login.credentials.username")}
            </label>
            <input
              id="username"
              type="text"
              class="input w-full"
              placeholder={t("login.credentials.username")}
              value={username()}
              onInput={(e) => setUsername(e.target.value)}
              required
            />
            <label for="password" class="label">
              {t("login.credentials.password")}
            </label>
            <input
              id="password"
              type="password"
              class="input w-full"
              placeholder={t("login.credentials.password")}
              value={password()}
              onInput={(e) => setPassword(e.target.value)}
              required
            />
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
