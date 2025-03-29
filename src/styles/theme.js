import { Montserrat } from "next/font/google";

export const ScreenSizes = {
  xs: "480px",
  sm: "576px",
  md: "768px",
  lg: "992px",
  xl: "1200px",
  xxl: "1600px",
};

export const ScreenSize = {
  xs: `@media screen and (min-width: ${ScreenSizes.xs})`,
  sm: `@media screen and (min-width: ${ScreenSizes.sm})`,
  md: `@media screen and (min-width: ${ScreenSizes.md})`,
  lg: `@media screen and (min-width: ${ScreenSizes.lg})`,
  xl: `@media screen and (min-width: ${ScreenSizes.xl})`,
  xxl: `@media screen and (min-width: ${ScreenSizes.xxl})`,
};

export const Screens = {
  mobile: 320,
  tablet: 768,
  desktop: 1280,
};

export const DeviceScreen = {
  mobile: `@media screen and (min-width: ${Screens.mobile}px) and (max-width: ${
    Screens.tablet - 0.5
  }px)`,
  tablet: `@media screen and (min-width: ${Screens.tablet}px) and (max-width: ${
    Screens.desktop - 0.5
  }px)`,
  desktop: `@media screen and (min-width: ${Screens.desktop}px)`,
};

export const FontMontserrat = Montserrat({ subsets: ["latin"] });

export const sharedIconCss = `
opacity: 0.7;
&:hover {
  opacity: 1;
}
&:active {
  opacity: 0.7;
}
`;
