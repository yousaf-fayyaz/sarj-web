import type { ReactElement } from "react";

export type SideRaysProps = {
  speed?: number;
  paused?: boolean;
  onReady?: () => void;
  onUnavailable?: () => void;
  rayColor1?: string;
  rayColor2?: string;
  intensity?: number;
  spread?: number;
  origin?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  tilt?: number;
  saturation?: number;
  blend?: number;
  falloff?: number;
  opacity?: number;
  className?: string;
};

export default function SideRays(props: SideRaysProps): ReactElement;
