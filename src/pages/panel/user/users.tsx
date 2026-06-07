import { createAsync, revalidate } from "@solidjs/router";
import {
  FiCheckCircle,
  FiEdit,
  FiPlus,
  FiSlash,
  FiTrash2,
  FiX,
  FiXCircle,
} from "solid-icons/fi";
import { createSignal, For, Show, Suspense } from "solid-js";
import AppErrorBoundary from "../../../components/AppErrorBoundary";
import ConfirmDialog, {
  type ConfirmDialogRef,
} from "../../../components/ConfirmDialog";
import Loader from "../../../components/Loader";
import UserDialog, { type UserDialogRef } from "../../../components/UserDialog";
import { throwIfFatal } from "../../../lib/error";
import { t } from "../../../lib/i18n";
import { userApi } from "../../../lib/user";
import { useUser } from "../../../store/auth";
import { AppError } from "../../../types/api";
import type { UserData } from "../../../types/user";
import { getUsers } from "./users.data";

function Users(props: { userDialogRef: UserDialogRef | undefined }) {
  const authUser = useUser();
  const users = createAsync(() => getUsers());

  const [error, setError] = createSignal<string | null>(null);
  const [fatalError, setFatalError] = createSignal<Error | null>(null);

  const [modifying, setModifying] = createSignal<boolean>(false);

  let confirmDialogRef!: ConfirmDialogRef;

  async function apiCall(fn: () => Promise<void>) {
    setError(null);
    setModifying(true);
    try {
      await fn();
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
    } finally {
      setModifying(false);
    }
  }

  async function deactivateUser(user: UserData, deactivate: boolean) {
    await apiCall(async () => {
      await userApi.update({
        id: user.id,
        deactivated: deactivate,
      });
      revalidate("users");
    });
  }

  async function deleteUser(user: UserData) {
    await apiCall(async () => {
      await userApi.delete(user.id.toString());
      revalidate("users");
    });
  }

  return (
    <>
      {throwIfFatal(fatalError, () => setFatalError(null))()}

      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>{t("panel.users.username")}</th>
              <th>{t("panel.users.email")}</th>
              <th>{t("panel.users.minecraftUuid")}</th>
              <th>{t("panel.users.role")}</th>
              <th>{t("panel.users.setUp")}</th>
              <th>{t("panel.users.actions")}</th>
            </tr>
          </thead>
          <tbody>
            <For each={users()}>
              {(user) => (
                <tr class={user.deactivated ? "grayscale opacity-80" : ""}>
                  <td>
                    <div class="flex items-center gap-3">
                      <Show
                        when={user.username}
                        fallback={
                          <div class="font-bold text-error">
                            {t("panel.users.unknownUsername")}
                          </div>
                        }
                      >
                        {(username) => (
                          <>
                            <img
                              class="rounded h-12 w-12 hidden md:block"
                              src={`https://minotar.net/helm/${user.minecraftUuid.replaceAll("-", "")}.png`}
                              alt={`${username()}'s head`}
                            />
                            <div class="font-bold">{username()}</div>
                          </>
                        )}
                      </Show>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.minecraftUuid}</td>
                  <td>
                    {user.role[0].toUpperCase() +
                      user.role.slice(1).toLowerCase()}
                  </td>
                  <td>{user.setUp ? t("panel.yes") : t("panel.no")}</td>
                  <td class="whitespace-nowrap">
                    <div class="tooltip" data-tip={t("panel.users.edit")}>
                      <button
                        class="btn btn-ghost h-8 w-4"
                        type="button"
                        onClick={() => props.userDialogRef?.open(user.id)}
                        disabled={modifying()}
                      >
                        <FiEdit class="text-base" />
                      </button>
                    </div>

                    <div
                      class="tooltip"
                      data-tip={
                        user?.uuid.toString() === authUser.user()?.sub
                          ? t("panel.users.error.deactivateSelf")
                          : user.deactivated
                            ? t("panel.users.reactivateUser")
                            : t("panel.users.deactivateUser")
                      }
                    >
                      <button
                        class="btn btn-ghost h-8 w-4"
                        type="button"
                        onClick={() => deactivateUser(user, !user.deactivated)}
                        disabled={
                          user?.uuid.toString() === authUser.user()?.sub ||
                          modifying()
                        }
                      >
                        {user.deactivated ? (
                          <FiCheckCircle class="text-base" />
                        ) : (
                          <FiSlash class="text-base" />
                        )}
                      </button>
                    </div>

                    <div
                      class="tooltip"
                      data-tip={
                        user.uuid.toString() === authUser.user()?.sub
                          ? t("panel.users.error.deleteSelf")
                          : t("panel.users.deleteUser")
                      }
                    >
                      <button
                        class="btn btn-ghost h-8 w-4"
                        type="button"
                        onClick={() =>
                          confirmDialogRef.open(
                            t("panel.users.willBeDeleted", {
                              username:
                                user.username ??
                                t("panel.users.unknownUsername"),
                            }),
                            () => {
                              deleteUser(user);
                            },
                          )
                        }
                        disabled={
                          user?.uuid.toString() === authUser.user()?.sub ||
                          modifying()
                        }
                      >
                        <FiTrash2 class="text-base" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>

      <Show when={error()}>
        {(e) => (
          <div
            role="alert"
            class="alert alert-error fixed bottom-4 left-1/2 -translate-x-1/2"
          >
            <FiXCircle class="text-2xl" />
            <span>{e()}</span>
            <button
              type="button"
              class="btn btn-ghost btn-xs w-6"
              onClick={() => setError(null)}
            >
              <FiX class="text-lg" />{" "}
            </button>
          </div>
        )}
      </Show>

      <ConfirmDialog ref={(r) => (confirmDialogRef = r)} />
    </>
  );
}

export default function UsersPage() {
  const [fatalError, setFatalError] = createSignal<Error | null>(null);
  const [userDialogRef, setUserDialogRef] = createSignal<UserDialogRef>();

  return (
    <>
      {throwIfFatal(fatalError, () => setFatalError(null))()}

      <section class="p-8">
        <div class="flex justify-between">
          <h1 class="text-2xl font-bold mb-4">{t("panel.users.title")}</h1>
          <button
            type="button"
            onClick={() => userDialogRef()?.open(null)}
            class="btn btn-soft"
          >
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
            <Users userDialogRef={userDialogRef()} />
          </Suspense>
        </AppErrorBoundary>
      </section>

      <UserDialog
        ref={(r) => setUserDialogRef(r)}
        onFatalError={(e) => setFatalError(e)}
      />
    </>
  );
}
