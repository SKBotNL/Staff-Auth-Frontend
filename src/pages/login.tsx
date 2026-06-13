import { createAsync, revalidate, useSearchParams } from "@solidjs/router";
import {
  createEffect,
  createMemo,
  Match,
  Show,
  Suspense,
  Switch,
} from "solid-js";
import Loader from "../components/Loader";
import Credentials from "../components/login/Credentials";
import MinecraftCheck from "../components/login/MinecraftCheck";
import Totp from "../components/login/Totp";
import { getStage } from "../lib/login";
import { useI18n } from "../providers/I18nProvider";
import { AppError } from "../types/api";
import { getLoginData } from "./login.data";

export default function LoginPage() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const loginData = createAsync(() => getLoginData(params.login_challenge));
  createEffect(() => {
    const data = loginData();
    if (!data) return;
    if (data.skip) {
      window.location.href = data.redirectUrl as string;
    }
  });

  const stage = createMemo(() => {
    const data = loginData();
    if (!data || data.skip) return;
    const stage = getStage(data.currentStage as string);
    if (stage instanceof AppError) throw stage;
    return stage;
  });

  return (
    <Suspense
      fallback={<Loader text={t("login.loading")} fillScreen={false} />}
    >
      <Show when={stage()}>
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="card bg-base-200 border-2 border-base-300 w-full max-w-md shrink-0 shadow-2xl">
            <div class="card-body">
              <img src="/logo.webp" alt="TrueOG logo"></img>
              <Suspense
                fallback={
                  <Loader text={t("login.loading")} fillScreen={false} />
                }
              >
                <Switch>
                  <Match when={stage()?.type === "credentials"}>
                    <Credentials
                      loginChallenge={params.login_challenge as string}
                      done={() => revalidate("loginData")}
                    />
                  </Match>
                  <Match when={stage()?.type === "minecraftCheck"}>
                    <MinecraftCheck
                      loginChallenge={params.login_challenge as string}
                      done={() => revalidate("loginData")}
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
      </Show>
    </Suspense>
  );
}
