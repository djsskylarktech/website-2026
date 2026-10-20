import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    files: ["components/3d/FlightRig.tsx"],
    rules: { "react-hooks/immutability": "off" },
  },
  {
    rules: { "@next/next/no-img-element": "off" },
  },
  {
    files: ["app/layout.tsx"],
    rules: { "@next/next/no-page-custom-font": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
