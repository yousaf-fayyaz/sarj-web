import type { CSSProperties, ReactElement } from "react";

export type CrystalizedBallLayout = {
  centerX: number;
  centerY: number;
  radius: number;
  roll: number;
  gather: number;
  solidify: number;
};

export type CrystalizedBallProps = {
  preset?: "plasma" | "aurora" | "nebula" | "ember" | "frost" | "solar" | "eclipse" | "abyss";
  color?: string;
  theme?: "dark" | "light";
  size?: number;
  strands?: number;
  crackle?: number;
  flares?: number;
  glow?: number;
  sparks?: number;
  particleCount?: number;
  particleDistribution?: "preset" | "uniform";
  fill?: number;
  motion?: "rise" | "fall" | "drift" | "orbit";
  particleShape?: "square" | "round";
  depth?: number;
  sway?: number;
  twinkle?: number;
  haze?: number;
  speed?: number;
  dustSpeed?: number;
  interactive?: boolean;
  hoverStrength?: number;
  intro?: boolean;
  paused?: boolean;
  scrollProgressRef?: { readonly current: number };
  layoutRef?: { readonly current: CrystalizedBallLayout | null };
  onReady?: () => void;
  onUnavailable?: () => void;
  className?: string;
  style?: CSSProperties;
};

export default function CrystalizedBall(props: CrystalizedBallProps): ReactElement;
