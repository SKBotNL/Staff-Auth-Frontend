import { createAsync, useNavigate, useParams } from "@solidjs/router";
import { FiChevronLeft } from "solid-icons/fi";
import { createSignal, Suspense } from "solid-js";
import AppErrorBoundary from "../../../components/AppErrorBoundary";
import Loader from "../../../components/Loader";
import { throwIfFatal } from "../../../lib/error";
import { t } from "../../../lib/i18n";
import { getUser } from "./user.data";

function User() {
  const params = useParams();
  const navigate = useNavigate();
  const user = createAsync(() => getUser(params.id as string));
  const [fatalError, setFatalError] = createSignal<Error | null>(null);

  return (
    <>
      {throwIfFatal(fatalError, () => setFatalError(null))()}

      <div class="flex flex-col w-full xl:w-1/2">
        <div class="flex flex-row items-center mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            class="btn btn-ghost btn-sm w-8 mr-2"
          >
            <FiChevronLeft class="text-2xl" />
          </button>
          <img
            class="rounded h-12 w-12 ml-2"
            src={`https://minotar.net/helm/${user()?.minecraftUuid.replaceAll("-", "")}.png`}
            alt={`${user()?.username}'s head`}
          />
          <h1 class="text-2xl font-bold ml-4">{user()?.username}</h1>
        </div>
        <div>
          <div class="flex flex-row gap-4">
            <span class="font-bold">{t("panel.users.email")}</span>
            <span>{user()?.email}</span>
          </div>
          <div class="flex flex-row gap-4">
            <span class="font-bold">{t("panel.users.minecraftUuid")}</span>
            <span>{user()?.minecraftUuid}</span>
          </div>
          <div class="flex flex-row gap-4">
            <span class="font-bold">{t("panel.users.role")}</span>
            <span>{user()?.role}</span>
          </div>
          <div class="flex flex-row gap-4">
            <span class="font-bold">{t("panel.users.setUp")}</span>
            <span>{user()?.setUp ? t("panel.yes") : t("panel.no")}</span>
          </div>
          <div class="flex flex-row gap-4">
            <span class="font-bold">{t("panel.users.deactivated")}</span>
            <span>{user()?.deactivated ? t("panel.yes") : t("panel.no")}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default function UserPage() {
  return (
    <section class="p-8">
      <AppErrorBoundary fallbackError={t("panel.users.error.failedToLoadUser")}>
        <Suspense
          fallback={
            <Loader text={t("panel.users.loadingUser")} fillScreen={true} />
          }
        >
          <User />
        </Suspense>
      </AppErrorBoundary>
    </section>
  );
}
