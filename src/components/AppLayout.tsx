import { A } from "@solidjs/router";
import {
  type Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSX,
  type ParentProps,
  Show,
  Suspense,
} from "solid-js";
import InvitesIcon from "~icons/mdi/account-multiple-add-outline";
import UsersIcon from "~icons/mdi/accounts-outline";
import HomeIcon from "~icons/mdi/home-outline";
import LogOutIcon from "~icons/mdi/logout";
import MenuIcon from "~icons/mdi/menu";
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

  type MenuItem = {
    name: string;
    link: string;
    icon: Component<JSX.SvgSVGAttributes<SVGSVGElement>>;
  };
  const menuItems = createMemo(() =>
    [
      {
        name: t("panel.menu.home"),
        link: "/",
        icon: HomeIcon,
      },
      user()?.roles.includes("ADMIN") && {
        name: t("panel.menu.users"),
        link: "/users",
        icon: UsersIcon,
      },
      user()?.roles.includes("ADMIN") && {
        name: t("panel.menu.invites"),
        link: "/invites",
        icon: InvitesIcon,
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
                <MenuIcon class="text-xl" />
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

              <div class="mt-auto max-w-full">
                <Show when={user()}>
                  {(u) => (
                    <li class="dropdown dropdown-top dropdown-center w-full">
                      <button
                        type="button"
                        tabindex="0"
                        class="flex flex-row items-center gap-2 w-full"
                      >
                        <img
                          src={u().picture}
                          alt={u().name}
                          class="w-6 h-6 rounded"
                        ></img>
                        <span class="truncate">{u().name}</span>
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
                            <LogOutIcon class="text-lg" />
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
