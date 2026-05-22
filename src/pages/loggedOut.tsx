import { FiCheck } from "solid-icons/fi";
import { LOGIN_URL } from "../lib/api";
import { t } from "../lib/i18n";

export default function LoggedOutPage() {
  return (
    <div class="flex flex-col min-h-screen items-center justify-center">
      <FiCheck class="h-16 w-full mb-8" />
      <p class="text-xl text-center">{t("logout.loggedOut")}</p>
      <button
        onClick={() => (window.location.href = LOGIN_URL)}
        class="btn btn-soft mt-4"
      >
        {t("logout.logBackIn")}
      </button>
    </div>
  );
}
