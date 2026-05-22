import { For, Suspense } from "solid-js";
import { t } from "../lib/i18n";
import { createAsync, useSearchParams } from "@solidjs/router";
import { consentApi } from "../lib/consent";
import { getConsentData } from "./consent.data";
import Loader from "../components/Loader";

const scopeMap = new Map<string, () => string>([
  ["email", () => t("consent.scopes.emailRead")],
  ["profile", () => t("consent.scopes.profileRead")],
  ["roles", () => t("consent.scopes.rolesRead")],
]);

export default function ConsentPage() {
  const [params] = useSearchParams();
  const consentData = createAsync(() =>
    getConsentData(params.consent_challenge),
  );

  async function consent(consent: boolean, consentChallenge: string) {
    const redirectUrl = await consentApi.consent(consent, consentChallenge);
    window.location.href = redirectUrl!;
  }

  return (
    <Suspense
      fallback={<Loader text={t("consent.loading")} fillScreen={true} />}
    >
      <div class="flex min-h-screen items-center justify-center">
        <div class="card bg-base-200 border-2 border-base-300 w-full max-w-md shrink-0 shadow-2xl">
          <div class="card-body">
            <img src="/logo.webp"></img>
            <div class="flex flex-col items-center gap-4">
              <h1 class="text-2xl font-bold">{t("consent.title")}</h1>

              <h2 class="text-lg">
                {t("consent.clientWouldLikeTo", {
                  client: consentData()?.clientName ?? "",
                })}
              </h2>
              <ul class="list-disc">
                <For each={consentData()?.scopes}>
                  {(scope) => (
                    <li>
                      {scopeMap.has(scope)
                        ? scopeMap.get(scope)!()
                        : t("consent.scopes.default", { scope: scope })}
                    </li>
                  )}
                </For>
              </ul>
              <div class="w-full py-2 flex flex-col gap-2">
                <button
                  onClick={() =>
                    consent(true, params.consent_challenge as string)
                  }
                  class="btn btn-success"
                >
                  {t("consent.allow")}
                </button>
                <button
                  onClick={() =>
                    consent(false, params.consent_challenge as string)
                  }
                  class="btn btn-error"
                >
                  {t("consent.deny")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
