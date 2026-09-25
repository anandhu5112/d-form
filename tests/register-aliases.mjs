// Lets `node --test` run the TypeScript sources directly (Node strips types)
// by resolving the "@/..." path alias and extension-less imports like Next does.
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const src = fileURLToPath(new URL("../src/", import.meta.url));
const EXTENSIONS = [".ts", ".tsx", "/index.ts"];

function withExtension(file) {
  if (existsSync(file) && path.extname(file)) return file;
  for (const ext of EXTENSIONS) if (existsSync(file + ext)) return file + ext;
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const file = withExtension(path.join(src, specifier.slice(2)));
      if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
    }
    if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
      const file = withExtension(path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier));
      if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
