import type { IconName } from "../components/Icon";

export interface Feature {
  title: string;
  text: string;
  icon: IconName;
}

export interface PageSeo {
  path: string;
  title: string;
  description: string;
}

export interface TitledList {
  title: string;
  items: string[];
}
