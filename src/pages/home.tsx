import { t } from "../lib/i18n";

export default function HomePage() {
  return (
    <section class="flex flex-col items-center justify-center min-h-[50vh] gap-8 p-8">
      <img class="w-lg" src="/logo.webp" alt="TrueOG logo"></img>
      <h1 class="text-4xl font-bold">{t("panel.welcome")}</h1>
    </section>
  );
}
