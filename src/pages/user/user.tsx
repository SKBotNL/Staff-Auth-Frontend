import { FiChevronLeft } from "solid-icons/fi";
import {
  createAsync,
  revalidate,
  useNavigate,
  useParams,
} from "@solidjs/router";
import { createEffect, createSignal, ErrorBoundary, Suspense } from "solid-js";
import { getUser } from "./user.data";
import { t } from "../../lib/i18n";
import { userApi } from "../../lib/user";
import { Role } from "../../types/user";
import Loader from "../../components/Loader";
import Error from "../../components/Error";
import { AppError } from "../../types/api";
import { throwIfFatal } from "../../lib/error";
import { useUser } from "../../store/auth";

function User() {
  const authUser = useUser();
  const params = useParams();
  const navigate = useNavigate();
  const user = createAsync(() => getUser(params.id));
  const [loading, setUpdating] = createSignal(false);
  const [success, setSuccess] = createSignal<string | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [email, setEmail] = createSignal<string>();
  const [minecraftUuid, setMinecraftUuid] = createSignal<string>();
  const [role, setRole] = createSignal<Role>();
  const [fatalError, setFatalError] = createSignal<Error | null>(null);

  createEffect(() => {
    setEmail(user()?.email);
    setMinecraftUuid(user()?.minecraftUuid);
    setRole(user()?.role);
  });

  async function update() {
    setSuccess(null);
    setError(null);

    setUpdating(true);
    try {
      const u = user();
      if (u) {
        await userApi.update({
          id: u.id,
          email: email(),
          role: role(),
          minecraftUuid: minecraftUuid(),
        });
        setSuccess(t("panel.users.updated"));
        revalidate("user");
        revalidate("users");
      } else {
        setError(t("panel.error.couldNotUpdate"));
      }
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
    } finally {
      setUpdating(false);
    }
  }

  async function activate(activate: boolean) {
    setSuccess(null);
    setError(null);

    setUpdating(true);
    try {
      const u = user();
      if (u) {
        await userApi.update({
          id: u.id,
          deactivated: !activate,
        });
        setSuccess(
          activate
            ? t("panel.users.reactivated")
            : t("panel.users.deactivated"),
        );
        revalidate("user");
        revalidate("users");
      } else {
        setError(t("panel.error.couldNotUpdate"));
      }
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
    } finally {
      setUpdating(false);
    }
  }

  async function deleteUser() {
    setSuccess(null);
    setError(null);

    setUpdating(true);
    try {
      const u = user();
      if (u) {
        const success = await userApi.delete(u.id.toString());
        if (!success) {
          setError(t("panel.error.couldNotDelete"));
          return;
        }
        revalidate("user");
        revalidate("users");
        navigate("/users");
      }
    } finally {
      setUpdating(false);
    }
  }

  return (
    <>
      {throwIfFatal(fatalError, () => setFatalError(null))()}

      <div class="flex flex-col w-full xl:w-1/2">
        <div class="flex flex-row items-center mb-4">
          <button onClick={() => navigate(-1)} class="btn btn-ghost mr-2">
            <FiChevronLeft class="text-2xl" />
          </button>
          <img
            class="rounded h-12 w-12 mr-4"
            src={`https://minotar.net/helm/${user()?.minecraftUuid.replaceAll("-", "")}.png`}
            alt={`${user()?.username}'s head`}
          />
          <h1 class="text-2xl font-bold">{user()?.username}</h1>
        </div>
        <form
          class="w-full"
          onSubmit={(e) => {
            e.preventDefault();
            update();
          }}
        >
          <fieldset class="fieldset">
            <label class="label">{t("panel.users.email")}</label>
            <input
              type="text"
              class="input w-full"
              placeholder={t("panel.users.email")}
              value={email()}
              onInput={(e) => setEmail(e.target.value)}
              required
            />
            <label class="label">{t("panel.users.minecraftUuid")}</label>
            <input
              type="text"
              class="input validator w-full"
              placeholder={t("panel.users.minecraftUuid")}
              value={minecraftUuid()}
              onInput={(e) => setMinecraftUuid(e.target.value)}
              required
              pattern="^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$"
              title={t("panel.users.error.enterValidUuid")}
            />
            <div class="validator-hint hidden">
              {t("panel.users.error.enterValidUuid")}
            </div>
            <div
              class="tooltip flex-1"
              data-tip={
                user()?.id.toString() === authUser.user()?.sub
                  ? t("panel.users.error.changeOwnRole")
                  : ""
              }
            >
              <label class="label">{t("panel.users.role")}</label>
              <select
                value={role()}
                onChange={(e) => setRole(e.target.value as Role)}
                class="select w-full"
                disabled={
                  loading() || user()?.id.toString() === authUser.user()?.sub
                }
                required
              >
                <option value="HELPER">{t("panel.users.roles.helper")}</option>
                <option value="MODERATOR">
                  {t("panel.users.roles.moderator")}
                </option>
                <option value="ADMIN">{t("panel.users.roles.admin")}</option>
              </select>
            </div>
            <label class="label">{t("panel.users.setUp")}</label>
            <input
              type="text"
              class="input w-full"
              placeholder={t("panel.users.setUp")}
              value={user()?.setUp ? "Yes" : "No"}
              disabled
            />
            {success() && <p class="text-success mt-2">{success()}</p>}
            {error() && <p class="text-error mt-2">{error()}</p>}
            <div class="flex flex-col sm:flex-row mt-4 gap-2 h-22">
              <button
                type="submit"
                class="btn btn-primary flex-1"
                disabled={loading()}
              >
                {t("panel.users.update")}
              </button>
              <div
                class="tooltip flex-1"
                data-tip={
                  user()?.id.toString() === authUser.user()?.sub
                    ? t("panel.users.error.deactivateSelf")
                    : ""
                }
              >
                <button
                  onClick={() => {
                    const deactivated = user()?.deactivated;
                    if (deactivated == null) return;
                    activate(deactivated);
                  }}
                  class="btn btn-warning w-full"
                  disabled={
                    loading() || user()?.id.toString() === authUser.user()?.sub
                  }
                >
                  {user()?.deactivated
                    ? t("panel.users.reactivate")
                    : t("panel.users.deactivate")}
                </button>
              </div>
              <button
                onClick={deleteUser}
                class="btn btn-error flex-1"
                disabled={loading()}
              >
                {t("panel.users.delete")}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </>
  );
}

export default function UserPage() {
  return (
    <section class="p-8">
      <ErrorBoundary
        fallback={(_, reset) => (
          <Error
            text={t("panel.users.error.failedToLoadUser")}
            fillScreen={true}
            reset={reset}
          />
        )}
      >
        <Suspense
          fallback={
            <Loader text={t("panel.users.loadingUser")} fillScreen={true} />
          }
        >
          <User />
        </Suspense>
      </ErrorBoundary>
    </section>
  );
}
