import Credentials from "../components/login/Credentials";
import { Match, Suspense, Switch } from "solid-js";
import { createAsync, revalidate, useSearchParams } from "@solidjs/router";
import MinecraftCheck from "../components/login/MinecraftCheck";
import Totp from "../components/login/Totp";
import { t } from "../lib/i18n";
import { getLoginStage } from "./login.data";
import Loader from "../components/Loader";

export default function LoginPage() {
  const [params] = useSearchParams();
  const stage = createAsync(() => getLoginStage(params.login_challenge));

  return (
    <div class="flex min-h-screen items-center justify-center p-4">
      <div class="card bg-base-200 border-2 border-base-300 w-full max-w-md shrink-0 shadow-2xl">
        <div class="card-body">
          <img src="/logo.webp" alt="TrueOG logo"></img>
          <Suspense
            fallback={<Loader text={t("login.loading")} fillScreen={false} />}
          >
            <Switch>
              <Match when={stage()?.type === "credentials"}>
                <Credentials
                  loginChallenge={params.login_challenge as string}
                  done={() => revalidate("loginStage")}
                />
              </Match>
              <Match when={stage()?.type === "minecraftCheck"}>
                <MinecraftCheck
                  loginChallenge={params.login_challenge as string}
                  done={() => revalidate("loginStage")}
                />
              </Match>
              <Match when={stage()?.type === "totp"}>
                <Totp loginChallenge={params.login_challenge as string} />
              </Match>
            </Switch>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
