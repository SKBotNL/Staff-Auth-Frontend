import { FiPlus, FiX, FiCopy } from "solid-icons/fi";
import { createAsync, revalidate } from "@solidjs/router";
import { getInvites } from "./invites.data";
import { createSignal, For, Suspense } from "solid-js";
import { t } from "../lib/i18n";
import Loader from "../components/Loader";
import { inviteApi } from "../lib/invite";
import { AppError } from "../types/api";
import { getUsers } from "./user/users.data";
import { userApi } from "../lib/user";
import { InviteData } from "../types/invite";
import { throwIfFatal } from "../lib/error";
import AppErrorBoundary from "../components/AppErrorBoundary";

function InviteRow({ invite }: { invite: InviteData }) {
  const user = createAsync(() => userApi.get(invite.invitedUserId));
  const link = `${window.location.origin}/setup?token=${invite.token}`;
  const [copied, setCopied] = createSignal(false);
  const [deleting, setDeleting] = createSignal(false);

  return (
    <tr>
      <td>
        <div class="flex flex-row items-center">
          <span>{link}</span>
          <div
            class="tooltip"
            data-tip={
              copied() ? t("panel.invites.copied") : t("panel.invites.copy")
            }
          >
            <button
              class="btn btn-ghost"
              onClick={() => {
                navigator.clipboard.writeText(link);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 1000);
              }}
            >
              <FiCopy />
            </button>
          </div>
        </div>
      </td>
      <td>
        <div class="flex items-center gap-3">
          <img
            class="rounded h-12 w-12 hidden md:block"
            src={`https://minotar.net/helm/${user()?.minecraftUuid.replaceAll("-", "")}.png`}
            alt={`${user()?.username}'s head`}
          />
          <div class="font-bold">{user()?.username}</div>
        </div>
      </td>
      <th>
        <button
          onClick={async () => {
            setDeleting(true);
            await inviteApi.delete(invite.id.toString());
            revalidate("invites");
          }}
          class="btn btn-soft btn-error btn-xs"
          disabled={deleting()}
        >
          {t("panel.invites.delete")}
        </button>
      </th>
    </tr>
  );
}

function Invites() {
  const invites = createAsync(() => getInvites());

  return (
    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>{t("panel.invites.link")}</th>
            <th>{t("panel.invites.user")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <For each={invites()}>
            {(invite) => <InviteRow invite={invite} />}
          </For>
        </tbody>
      </table>
    </div>
  );
}

export default function InvitesPage() {
  const users = createAsync(() => getUsers());
  const [loading, setUpdating] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [userId, setUserId] = createSignal<string>();
  const [fatalError, setFatalError] = createSignal<Error | null>(null);

  let modalRef: HTMLDialogElement;

  async function create() {
    setError(null);

    setUpdating(true);
    try {
      await inviteApi.create({
        invitedUserId: userId()!,
      });
      modalRef!.close();
      revalidate("invites");
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
      <section class="p-8">
        <div class="flex justify-between">
          <h1 class="text-2xl font-bold mb-4">{t("panel.invites.title")}</h1>
          <button onClick={() => modalRef!.showModal()} class="btn btn-soft">
            <FiPlus class="text-lg" />
            {t("panel.invites.createNew")}
          </button>
        </div>

        <AppErrorBoundary fallbackError={t("panel.invites.error.failedToLoad")}>
          <>
            {throwIfFatal(fatalError, () => setFatalError(null))()}

            <Suspense
              fallback={
                <Loader text={t("panel.invites.loading")} fillScreen={true} />
              }
            >
              <Invites />
            </Suspense>
          </>
        </AppErrorBoundary>
      </section>

      <dialog
        onTransitionEnd={(e) => {
          if (e.propertyName === "opacity" && !modalRef!.open) {
            setUserId(undefined);
            setError(null);
          }
        }}
        ref={modalRef!}
        id="create_invite_modal"
        class="modal"
      >
        <div class="modal-box">
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              <FiX class="text-lg" />
            </button>
          </form>
          <h3 class="text-lg font-bold mb-2">{t("panel.invites.createNew")}</h3>
          <form
            class="w-full"
            onSubmit={(e) => {
              e.preventDefault();
              create();
            }}
          >
            <fieldset class="fieldset">
              <label class="label">{t("panel.invites.user")}</label>
              <select
                value={userId() ?? ""}
                onChange={(e) => setUserId(e.target.value as string)}
                class="select w-full"
                required
              >
                <option value="" disabled selected>
                  {t("panel.invites.pickUser")}
                </option>
                <For each={users()}>
                  {(user) => <option value={user.id}>{user.username}</option>}
                </For>
              </select>
              {error() && <p class="text-error mt-2">{error()}</p>}
              <button
                type="submit"
                class="btn btn-primary flex-1 mt-2"
                disabled={loading()}
              >
                {t("panel.invites.create")}
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
