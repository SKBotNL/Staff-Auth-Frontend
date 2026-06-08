import CheckIcon from "~icons/mdi/check";
import { useI18n } from "../providers/I18nProvider";

export default function SuccessfulSetupPage() {
  const { t } = useI18n();

  return (
    <div class="flex flex-col min-h-screen items-center justify-center">
      <CheckIcon class="h-16 w-full mb-8" />
      <p class="text-xl text-center">{t("setup.success")}</p>
    </div>
  );
}
