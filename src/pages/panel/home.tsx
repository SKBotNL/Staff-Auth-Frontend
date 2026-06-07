import { createMemo, For } from "solid-js";
import { t } from "../../lib/i18n";
import { useUser } from "../../store/auth";

export default function HomePage() {
  const { user } = useUser();

  type Application = { name: string; link: string; icon: string };
  const applications = createMemo(() =>
    [
      user()?.roles.includes("ADMIN") && {
        name: t("panel.home.application.adminPanel"),
        link: import.meta.env.VITE_ADMIN_PANEL_URL,
        icon: "/application/minecraft.webp",
      },
      {
        name: t("panel.home.application.punishmentPanel"),
        link: import.meta.env.VITE_PUNISHMENT_PANEL_URL,
        icon: "/favicon.webp",
      },
      {
        name: t("panel.home.application.gitea"),
        link: import.meta.env.VITE_GITEA_URL,
        icon: "/application/gitea.svg",
      },
      {
        name: t("panel.home.application.wekan"),
        link: import.meta.env.VITE_WEKAN_URL,
        icon: "/application/wekan.svg",
      },
      {
        name: t("panel.home.application.filebrowser"),
        link: import.meta.env.VITE_FILEBROWSER_URL,
        icon: "/application/filebrowser.svg",
      },
      ["ADMIN", "DEVELOPER"].some((role) => user()?.roles.includes(role)) && {
        name: t("panel.home.application.glitchtip"),
        link: import.meta.env.VITE_GLITCHTIP_URL,
        icon: "/application/glitchtip.webp",
      },
      {
        name: t("panel.home.application.roundcube"),
        link: import.meta.env.VITE_ROUNDCUBE_URL,
        icon: "/application/roundcube.svg",
      },
    ].filter((item): item is Application => Boolean(item)),
  );

  return (
    <section class="flex flex-col items-center justify-center min-h-[50vh] gap-8 p-8">
      <img class="w-lg" src="/logo.webp" alt="TrueOG logo"></img>
      <h1 class="text-4xl font-bold">{t("panel.home.applications")}</h1>

      <div class="grid gap-6 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <For each={applications()}>
          {(app) => (
            <a href={app.link} target="_blank" rel="noopener noreferrer">
              <div class="card bg-base-200 hover:bg-base-300 transition-colors border-2 border-base-300 shadow-2xl">
                <div class="card-body flex items-center justify-center">
                  <img
                    class="w-44 h-44"
                    src={app.icon}
                    alt={`${app.name} ${t("panel.home.icon")}`}
                  ></img>
                  <h2 class="card-title">{app.name}</h2>
                </div>
              </div>
            </a>
          )}
        </For>
      </div>
    </section>
  );
}
