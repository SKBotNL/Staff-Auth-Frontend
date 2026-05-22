import { FiMenu, FiHome, FiUsers, FiUserPlus, FiLogOut } from "solid-icons/fi";
import {
  createEffect,
  createSignal,
  ErrorBoundary,
  ParentProps,
  Show,
  Suspense,
} from "solid-js";
import { A } from "@solidjs/router";
import { BASE_URL } from "../lib/api";
import { useUser } from "../store/auth";
import { dict, t } from "../lib/i18n";
import { AppError } from "../types/api";
import Loader from "./Loader";
import Error from "./Error";
import { throwIfFatal } from "../lib/error";

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
    const u = user();
    if (u) {
      if (!u["roles"].includes("ADMIN")) {
        throw new AppError("fatal", t("panel.error.unauthorized"), null);
      }
    }
  });

  return (
    <>
      {throwIfFatal(fatalError, () => setFatalError(null))()}
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
            <li>
              <A onClick={toggleDrawer} href="/" activeClass="menu-active" end>
                <FiHome class="text-lg" />
                {t("panel.menu.home")}
              </A>
            </li>
            <li>
              <A
                onClick={toggleDrawer}
                href="/users"
                activeClass="menu-active"
                end
              >
                <FiUsers class="text-lg" />
                {t("panel.menu.users")}
              </A>
            </li>
            <li>
              <A
                onClick={toggleDrawer}
                href="/invites"
                activeClass="menu-active"
                end
              >
                <FiUserPlus class="text-lg" />
                {t("panel.menu.invites")}
              </A>
            </li>

            <div class="mt-auto">
              <Show when={user()}>
                {(u) => (
                  <li class="dropdown dropdown-top dropdown-center w-full">
                    <div
                      tabindex="0"
                      role="button"
                      class="flex flex-row items-center gap-2"
                    >
                      <img
                        src={u()["picture"]}
                        alt="Picture"
                        class="w-6 h-6 rounded"
                      ></img>
                      <span>{u()["name"]}</span>
                    </div>
                    <ul
                      tabindex="-1"
                      class="dropdown-content menu bg-base-100 rounded-box z-1 w-full p-2 shadow-sm"
                    >
                      <li>
                        <button
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
      ;
    </>
  );
}

export default function AppLayout(props: ParentProps) {
  return (
    <Show when={dict()}>
      <ErrorBoundary
        fallback={(e, reset) => {
          let text;
          let canReset = true;
          if (e instanceof TypeError) {
            text = t("error.networkError");
          } else if (e instanceof AppError) {
            text = e.message;
            canReset = e.kind !== "fatal";
          } else {
            text = t("error.unknownError");
          }

          return (
            <Error
              text={text}
              fillScreen={true}
              reset={canReset ? reset : undefined}
            />
          );
        }}
      >
        <>
          <Suspense
            fallback={<Loader text={t("panel.loading")} fillScreen={true} />}
          >
            <App {...props} />
          </Suspense>
        </>
      </ErrorBoundary>
    </Show>
  );
}
