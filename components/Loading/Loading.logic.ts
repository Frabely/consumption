import {Language} from "@/constants/types";

export const buildLoadingText = (language: Language): string => `${language.displayLabels.loading}...`;
