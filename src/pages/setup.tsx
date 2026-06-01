import { createAsync, revalidate, useSearchParams } from "@solidjs/router";
import { Match, Suspense, Switch } from "solid-js";
import Loader from "../components/Loader";
import Details from "../components/setup/Details";
import MinecraftCheck from "../components/setup/MinecraftCheck";
import TotpSetup from "../components/setup/TotpSetup";
import { t } from "../lib/i18n";
import { getSetupStage } from "./setup.data";

export default function SetupPage() {
  const [params] = useSearchParams();
  const stage = createAsync(() => getSetupStage(params.token));

  return (
    <div class="flex min-h-screen items-center justify-center p-4">
      <div class="card bg-base-200 border-2 border-base-300 w-full max-w-md shrink-0 shadow-2xl">
        <div class="card-body">
          <img src="/logo.webp" alt="TrueOG logo"></img>
          <Suspense
            fallback={<Loader text={t("setup.loading")} fillScreen={false} />}
          >
            <Switch>
              <Match when={stage()?.type === "details"}>
                <Details
                  token={params.token as string}
                  done={() => revalidate("setupStage")}
                />
              </Match>
              <Match when={stage()?.type === "minecraftCheck"}>
                <MinecraftCheck
                  token={params.token as string}
                  done={() => revalidate("setupStage")}
                />
              </Match>
              <Match when={stage()?.type === "totp"}>
                <TotpSetup token={params.token as string} />
              </Match>
            </Switch>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
