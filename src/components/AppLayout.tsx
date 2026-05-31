import { A } from "@solidjs/router";
import type { IconTypes } from "solid-icons";
import { FiHome, FiLogOut, FiMenu, FiUserPlus, FiUsers } from "solid-icons/fi";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  type ParentProps,
  Show,
  Suspense,
} from "solid-js";
import { BASE_URL } from "../lib/api";
import { throwIfFatal } from "../lib/error";
import { dict, t } from "../lib/i18n";
import { useUser } from "../store/auth";
import AppErrorBoundary from "./AppErrorBoundary";
import Loader from "./Loader";

function App(props: ParentProps) {
  const { user, error } = useUser();
  const [isDrawerOpen, setDrawerOpen] = createSignal(false);
  const toggleDrawer = () => {
    if (window.matchMedia("(max-width: 64rem)").matches)
      setDrawerOpen(!isDrawerOpen());
  };
  const [fatalError, setFatalError] = createSignal<Error | null>(null);

  createEffect(() => {
    const err = error();
    if (err) {
      setFatalError(err);
      return;
    }
  });

  type MenuItem = { name: string; link: string; icon: IconTypes };
  const menuItems = createMemo(() =>
    [
      {
        name: t("panel.menu.home"),
        link: "/",
        icon: FiHome,
      },
      user()?.roles.includes("ADMIN") && {
        name: t("panel.menu.users"),
        link: "/users",
        icon: FiUsers,
      },
      user()?.roles.includes("ADMIN") && {
        name: t("panel.menu.invites"),
        link: "/invites",
        icon: FiUserPlus,
      },
    ].filter((item): item is MenuItem => Boolean(item)),
  );

  return (
    <>
      {throwIfFatal(fatalError, () => setFatalError(null))()}

      <Show when={user()}>
        <div class="drawer lg:drawer-open">
          <input
            id="drawer"
            type="checkbox"
            class="drawer-toggle"
            checked={isDrawerOpen()}
            ref={(el) => {
              el.addEventListener("change", () => setDrawerOpen(el.checked));
            }}
          />
          <div class="drawer-content flex flex-col">
            <nav class="navbar items-center gap-4 lg:hidden">
              <label for="drawer" class="btn btn-ghost drawer-button">
                <FiMenu class="text-xl" />
              </label>
              <span>Staff-Auth</span>
            </nav>
            {props.children}
          </div>
          <div class="drawer-side">
            <label
              for="drawer"
              aria-label="close sidebar"
              class="drawer-overlay"
            ></label>
            <ul class="menu menu-lg bg-base-200 min-h-full gap-1 w-60">
              <li class="menu-title">Staff-Auth</li>
              <For each={menuItems()}>
                {(menuItem) => (
                  <li>
                    <A
                      onClick={toggleDrawer}
                      href={menuItem.link}
                      activeClass="menu-active"
                      end
                    >
                      <menuItem.icon class="text-lg" />
                      {menuItem.name}
                    </A>
                  </li>
                )}
              </For>

              <div class="mt-auto">
                <Show when={user()}>
                  {(u) => (
                    <li class="dropdown dropdown-top dropdown-center w-full">
                      <button
                        type="button"
                        tabindex="0"
                        class="flex flex-row items-center gap-2 max-w-full"
                      >
                        <img
                          src={u()["picture"]}
                          alt={u().name}
                          class="w-6 h-6 rounded"
                        ></img>
                        <span class="truncate max-w-xs">{u().name}</span>
                      </button>
                      <ul
                        tabindex="-1"
                        class="dropdown-content menu bg-base-100 rounded-box z-1 w-full p-2 shadow-sm"
                      >
                        <li>
                          <button
                            type="button"
                            onClick={() =>
                              (window.location.href = `${BASE_URL}/logout`)
                            }
                            class="text-red-400"
                          >
                            <FiLogOut class="text-lg" />
                            {t("panel.menu.logOut")}
                          </button>
                        </li>
                      </ul>
                    </li>
                  )}
                </Show>
              </div>
            </ul>
          </div>
        </div>
      </Show>
    </>
  );
}

export default function AppLayout(props: ParentProps) {
  return (
    <Show when={dict()}>
      <AppErrorBoundary fallbackError={t("error.unknownError")}>
        <Suspense
          fallback={<Loader text={t("panel.loading")} fillScreen={true} />}
        >
          <App {...props} />
        </Suspense>
      </AppErrorBoundary>
    </Show>
  );
}
