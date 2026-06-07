import { revalidate } from "@solidjs/router";
import { FiX } from "solid-icons/fi";
import {
  type Accessor,
  createEffect,
  createResource,
  createSignal,
  onMount,
  Suspense,
} from "solid-js";
import { t } from "../lib/i18n";
import { userApi } from "../lib/user";
import { AppError } from "../types/api";
import type { Role } from "../types/user";
import Loader from "./Loader";
import RolePicker from "./user/RolePicker";

function UserDialog(props: {
  userId: Accessor<number | null | undefined>;
  close: () => void;
  reset: (r: () => void) => void;
  onFatalError: (error: Error) => void;
}) {
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [email, setEmail] = createSignal<string>("");
  const [minecraftUuid, setMinecraftUuid] = createSignal<string>("");
  const [role, setRole] = createSignal<Role>();

  const [user] = createResource(props.userId, (id) => {
    return userApi.get(id.toString());
  });

  let fieldSet!: HTMLFieldSetElement;
  props.reset(() => {
    if (props.userId()) return;
    setEmail("");
    setMinecraftUuid("");
    setRole();
    fieldSet.form?.reset();
  });

  createEffect(async () => {
    setEmail(user()?.email ?? "");
    setMinecraftUuid(user()?.minecraftUuid ?? "");
    setRole(user()?.role);
  });

  createEffect(async () => {
    if (!props.userId()) {
      setEmail("");
      setMinecraftUuid("");
      setRole();
    }
  });

  async function apiCall(fn: () => Promise<void>): Promise<boolean> {
    setError(null);
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      if (!(err instanceof AppError)) {
        props.onFatalError(err as Error);
        return false;
      }
      if (err.kind === "fatal") {
        props.onFatalError(err);
        return false;
      }
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
    return true;
  }

  async function update(): Promise<boolean> {
    return apiCall(async () => {
      await userApi.update({
        id: user()?.id as number,
        email: email(),
        role: role(),
        minecraftUuid: minecraftUuid(),
      });
      revalidate("users");
    });
  }

  async function create(): Promise<boolean> {
    return apiCall(async () => {
      await userApi.create({
        email: email(),
        role: role() as Role,
        minecraftUuid: minecraftUuid(),
      });
      revalidate("users");
    });
  }

  return (
    <>
      <form method="dialog">
        <button
          type="submit"
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <FiX class="text-lg" />
        </button>
      </form>
      <h3 class="text-lg font-bold mb-2">
        {props.userId()
          ? t("panel.users.editUser", {
              username: user()?.username ?? t("panel.users.unknownUsername"),
            })
          : t("panel.users.createNewUser")}
      </h3>
      <form
        class="w-full"
        onSubmit={async (e) => {
          e.preventDefault();
          const success = props.userId() ? await update() : await create();
          if (success) close();
        }}
      >
        <fieldset ref={fieldSet} class="fieldset">
          <label for="email" class="label">
            {t("panel.users.email")}
          </label>
          <input
            id="email"
            type="text"
            class="input w-full"
            placeholder={t("panel.users.email")}
            value={email()}
            onInput={(e) => setEmail(e.target.value)}
            required
          />

          <label for="minecraftUuid" class="label">
            {t("panel.users.minecraftUuid")}
          </label>
          <input
            id="minecraftUuid"
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

          <RolePicker role={role()} setRole={setRole} />

          {error() && <p class="text-error mt-2">{error()}</p>}

          <button
            type="submit"
            class="btn btn-primary flex-1 mt-2"
            disabled={loading()}
          >
            {props.userId() ? t("panel.users.update") : t("panel.users.create")}
          </button>
        </fieldset>
      </form>
    </>
  );
}

export type UserDialogRef = {
  open: (userId: number | null) => void;
  close: () => void;
};

export default function UserDialogComponent(props: {
  ref: (r: UserDialogRef) => void;
  onFatalError: (error: Error) => void;
}) {
  const [userId, setUserId] = createSignal<number | null>(null);

  let dialogRef!: HTMLDialogElement;
  let resetUserDialog!: () => void;

  onMount(() => {
    props.ref({
      open: (userId: number | null) => {
        setUserId(userId);
        dialogRef.showModal();
      },
      close: () => dialogRef.close(),
    });
  });

  return (
    <dialog
      ref={dialogRef}
      class="modal"
      onTransitionEnd={(e) => {
        if (e.propertyName === "opacity" && !dialogRef.open) {
          resetUserDialog();
        }
      }}
    >
      <div class="modal-box">
        <Suspense
          fallback={
            <Loader text={t("panel.users.loadingUser")} fillScreen={false} />
          }
        >
          <UserDialog
            userId={userId}
            close={() => dialogRef.close()}
            reset={(r) => (resetUserDialog = r)}
            onFatalError={props.onFatalError}
          />
        </Suspense>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="submit">Close</button>
      </form>
    </dialog>
  );
}
