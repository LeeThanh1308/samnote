import { TOKEN, USER } from "./constant";

export const handleLogOut = () => {
  localStorage.removeItem(USER);
  localStorage.removeItem(TOKEN);
  window.location.href = "/";
};
