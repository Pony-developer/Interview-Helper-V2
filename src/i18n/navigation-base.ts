import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link: BaseLink, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
