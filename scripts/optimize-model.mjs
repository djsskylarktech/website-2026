import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const input = resolve(root, process.argv[2] || "reg final proto2.glb");
const modelDir = join(root, "public", "models");
const temporary = join(modelDir, ".skylark-build.glb");
const manifest = join(root, "components", "elevate", "model-asset.json");
const cli = join(root, "node_modules", "@gltf-transform", "cli", "bin", "cli.js");

if (!existsSync(input)) throw new Error(`Model source not found: ${input}`);
if (!existsSync(cli)) throw new Error("Run npm ci before optimizing the model.");
mkdirSync(modelDir, { recursive: true });

try {
  const result = spawnSync(process.execPath, [
    cli, "optimize", input, temporary,
    "--compress", "meshopt", "--simplify", "true",
    "--simplify-ratio", "0.2", "--simplify-error", "0.005",
    "--palette", "false",
  ], { stdio: "inherit", cwd: root });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Model optimization failed (${result.status}).`);

  const hash = createHash("sha256").update(readFileSync(temporary)).digest("hex").slice(0, 12);
  const name = `skylark-rover-${hash}.glb`;
  copyFileSync(temporary, join(modelDir, name));
  writeFileSync(manifest, `${JSON.stringify({ url: `/models/${name}` }, null, 2)}\n`);
  for (const old of readdirSync(modelDir)) {
    if (old !== name && /^skylark-rover.*\.glb$/.test(old)) unlinkSync(join(modelDir, old));
  }
  console.log(`Ready: ${name}`);
} finally {
  if (existsSync(temporary)) unlinkSync(temporary);
}
