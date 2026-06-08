import { createAsync, revalidate } from "@solidjs/router";
import { createSignal, For, Show, Suspense } from "solid-js";
import ReactivateIcon from "~icons/mdi/account-reactivate-outline";
import CloseIcon from "~icons/mdi/close";
import DeactivateIcon from "~icons/mdi/denied";
import EditIcon from "~icons/mdi/edit-outline";
import ErrorIcon from "~icons/mdi/error-outline";
import ResetIcon from "~icons/mdi/lock-reset";
import PlusIcon from "~icons/mdi/plus";
import TrashIcon from "~icons/mdi/trash-outline";
import AppErrorBoundary from "../../../components/AppErrorBoundary";
import ConfirmDialog, {
  type ConfirmDialogRef,
} from "../../../components/ConfirmDialog";
import Loader from "../../../components/Loader";
import UserDialog, { type UserDialogRef } from "../../../components/UserDialog";
import { throwIfFatal } from "../../../lib/error";
import { t } from "../../../lib/i18n";
import { userApi } from "../../../lib/user";
import { useUser } from "../../../store/user";
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

  async function deactivateUser(user: UserData, deactivate: boolean) {
    setError(null);
    setModifying(true);
    try {
      await userApi.update({
        id: user.id,
        deactivated: deactivate,
      });
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
      revalidate("users");
    }
  }

  /**
   * @returns error, if there is one
   */
  async function deleteUser(user: UserData): Promise<string | null> {
    setError(null);
    setModifying(true);
    try {
      await userApi.delete(user.id.toString());
    } catch (err) {
      if (!(err instanceof AppError)) {
        setFatalError(err as Error);
        return null;
      }
      if (err.kind === "fatal") {
        setFatalError(err);
        return null;
      }
      return err.message;
    } finally {
      setModifying(false);
    }
    return null;
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
              <th>{t("panel.actions")}</th>
            </tr>
          </thead>
          <tbody>
            <For each={users()}>
              {(user) => (
                <tr class={user.deactivated ? "opacity-80" : ""}>
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
                              class={`rounded h-12 w-12 hidden md:block${user.deactivated ? " grayscale" : ""}`}
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
                  <td class="whitespace-nowrap flex flex-row gap-1">
                    <div class="tooltip" data-tip={t("panel.users.edit")}>
                      <button
                        class="btn btn-ghost btn-sm btn-square btn-accent"
                        type="button"
                        onClick={() => props.userDialogRef?.open(user.id)}
                        disabled={modifying()}
                      >
                        <EditIcon class="text-lg" />
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
                        class={`btn btn-ghost btn-sm btn-square ${user.deactivated ? "btn-success" : "btn-warning"}`}
                        type="button"
                        onClick={() => deactivateUser(user, !user.deactivated)}
                        disabled={
                          user?.uuid.toString() === authUser.user()?.sub ||
                          modifying()
                        }
                      >
                        {user.deactivated ? (
                          <ReactivateIcon class="text-lg" />
                        ) : (
                          <DeactivateIcon class="text-lg" />
                        )}
                      </button>
                    </div>

                    <div
                      class="tooltip"
                      data-tip={t("panel.users.resetUsersLogin")}
                    >
                      <button
                        class="btn btn-ghost btn-sm btn-square btn-warning"
                        type="button"
                        // onClick={() =>
                        //   confirmDialogRef.open(
                        //     t("panel.users.willBeDeleted", {
                        //       username:
                        //         user.username ??
                        //         t("panel.users.unknownUsername"),
                        //     }),
                        //     async () => {
                        //       return await deleteUser(user);
                        //     },
                        //     () => {
                        //       revalidate("users");
                        //     },
                        //   )
                        // }
                        disabled={modifying()}
                      >
                        <ResetIcon class="text-lg" />
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
                        class="btn btn-ghost btn-sm btn-square btn-error"
                        type="button"
                        onClick={() =>
                          confirmDialogRef.open(
                            t("panel.users.willBeDeleted", {
                              username:
                                user.username ??
                                t("panel.users.unknownUsername"),
                            }),
                            async () => {
                              return await deleteUser(user);
                            },
                            () => {
                              revalidate("users");
                            },
                          )
                        }
                        disabled={
                          user?.uuid.toString() === authUser.user()?.sub ||
                          modifying()
                        }
                      >
                        <TrashIcon class="text-xl" />
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
            <ErrorIcon class="text-2xl" />
            <span>{e()}</span>
            <button
              type="button"
              class="btn btn-ghost btn-xs w-6"
              onClick={() => setError(null)}
            >
              <CloseIcon class="text-lg" />{" "}
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
            <PlusIcon class="text-lg" />
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
