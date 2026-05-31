import { A, createAsync, revalidate } from "@solidjs/router";
import { FiPlus, FiX } from "solid-icons/fi";
import { createSignal, For, Suspense } from "solid-js";
import AppErrorBoundary from "../../components/AppErrorBoundary";
import Loader from "../../components/Loader";
import RolePicker from "../../components/RolePicker";
import { throwIfFatal } from "../../lib/error";
import { t } from "../../lib/i18n";
import { userApi } from "../../lib/user";
import { AppError } from "../../types/api";
import { Role } from "../../types/user";
import { getUsers } from "./users.data";

function Users() {
  const users = createAsync(() => getUsers());

  return (
    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>{t("panel.users.username")}</th>
            <th>{t("panel.users.email")}</th>
            <th>{t("panel.users.minecraftUuid")}</th>
            <th>{t("panel.users.role")}</th>
            <th>{t("panel.users.deactivated")}</th>
            <th>{t("panel.users.setUp")}</th>
            <th>{t("panel.users.action")}</th>
          </tr>
        </thead>
        <tbody>
          <For each={users()}>
            {(user) => (
              <tr>
                <td>
                  <div class="flex items-center gap-3">
                    <img
                      class="rounded h-12 w-12 hidden md:block"
                      src={`https://minotar.net/helm/${user.minecraftUuid.replaceAll("-", "")}.png`}
                      alt={`${user.username}'s head`}
                    />
                    <div class="font-bold">{user.username}</div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.minecraftUuid}</td>
                <td>
                  {user.role[0].toUpperCase() +
                    user.role.slice(1).toLowerCase()}
                </td>
                <td>{user.deactivated ? t("panel.yes") : t("panel.no")}</td>
                <td>{user.setUp ? t("panel.yes") : t("panel.no")}</td>
                <th>
                  <A href={`/user/${user.id}`} class="btn btn-soft btn-xs">
                    {t("panel.users.change")}
                  </A>
                </th>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}

export default function UsersPage() {
  const [loading, setUpdating] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [email, setEmail] = createSignal<string>("");
  const [minecraftUuid, setMinecraftUuid] = createSignal<string>("");
  const [role, setRole] = createSignal<Role>();
  const [fatalError, setFatalError] = createSignal<Error | null>(null);

  let modalRef: HTMLDialogElement;

  async function create() {
    setError(null);

    setUpdating(true);
    try {
      await userApi.create({
        email: email(),
        role: role()!,
        minecraftUuid: minecraftUuid()!,
      });
      modalRef!.close();
      revalidate("users");
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

  return (
    <>
      {throwIfFatal(fatalError, () => setFatalError(null))()}

      <section class="p-8">
        <div class="flex justify-between">
          <h1 class="text-2xl font-bold mb-4">{t("panel.users.title")}</h1>
          <button onClick={() => modalRef!.showModal()} class="btn btn-soft">
            <FiPlus class="text-lg" />
            {t("panel.users.createNew")}
          </button>
        </div>

        <AppErrorBoundary
          fallbackError={t("panel.users.error.failedToLoadUsers")}
        >
          <Suspense
            fallback={
              <Loader text={t("panel.users.loadingUsers")} fillScreen={true} />
            }
          >
            <Users />
          </Suspense>
        </AppErrorBoundary>
      </section>

      <dialog
        onTransitionEnd={(e) => {
          if (e.propertyName === "opacity" && !modalRef!.open) {
            setEmail("");
            setMinecraftUuid("");
            setRole();
            setError(null);
          }
        }}
        ref={modalRef!}
        id="create_user_modal"
        class="modal"
      >
        <div class="modal-box">
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              <FiX class="text-lg" />
            </button>
          </form>
          <h3 class="text-lg font-bold mb-2">{t("panel.users.createNew")}</h3>
          <form
            class="w-full"
            onSubmit={(e) => {
              e.preventDefault();
              create();
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

              <RolePicker role={role} setRole={setRole} />

              {error() && <p class="text-error mt-2">{error()}</p>}

              <button
                type="submit"
                class="btn btn-primary flex-1 mt-2"
                disabled={loading()}
              >
                {t("panel.users.create")}
              </button>
            </fieldset>
          </form>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>Close</button>
        </form>
      </dialog>
    </>
  );
}
