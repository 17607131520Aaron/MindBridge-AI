import { http } from "@/lib/request";

export interface Module {
  key: string;
  name: string;
  description: string;
  href: string;
  kind: "site" | "cms" | "tool";
  tags: string[];
  openInNewTab?: boolean;
}

export function getModules() {
  return http.get<Module[]>("/api/modules");
}
