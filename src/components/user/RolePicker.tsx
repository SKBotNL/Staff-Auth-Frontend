import type { Setter } from "solid-js";
import { useI18n } from "../../providers/I18nProvider";
import type { Role } from "../../types/user";

export default function RolePickerComponent(props: {
  role: Role | undefined;
  setRole: Setter<Role | undefined>;
}) {
  const { t } = useI18n();

  return (
    <>
      <label for="role" class="label">
        {t("panel.users.role")}
      </label>
      <select
        id="role"
        value={props.role ?? ""}
        onChange={(e) => props.setRole(e.target.value as Role)}
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
