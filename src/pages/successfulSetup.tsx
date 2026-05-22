import { FiCheck } from "solid-icons/fi";
import { t } from "../lib/i18n";

export default function SuccessfulSetupPage() {
  return (
    <div class="flex flex-col min-h-screen items-center justify-center">
      <FiCheck class="h-16 w-full mb-8" />
      <p class="text-xl text-center">{t("setup.success")}</p>
    </div>
  );
}
