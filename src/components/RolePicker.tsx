import type { Accessor, Setter } from "solid-js";
import { t } from "../lib/i18n";
import type { Role } from "../types/user";

export default function RolePickerComponent({
  role,
  setRole,
}: {
  role: Accessor<Role | undefined>;
  setRole: Setter<Role | undefined>;
}) {
  return (
    <>
      <label class="label">{t("panel.users.role")}</label>
      <select
        value={role() ?? ""}
        onChange={(e) => setRole(e.target.value as Role)}
        class="select w-full"
        required
      >
        <option value="" disabled selected>
          {t("panel.users.roles.pick")}
        </option>
        <option value="HELPER">{t("panel.users.roles.helper")}</option>
        <option value="MODERATOR">{t("panel.users.roles.moderator")}</option>
        <option value="DEVELOPER">{t("panel.users.roles.developer")}</option>
        <option value="ADMIN">{t("panel.users.roles.admin")}</option>
      </select>
    </>
  );
}
