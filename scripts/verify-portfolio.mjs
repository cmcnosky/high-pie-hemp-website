import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const catalogPath = path.join(root, "assets/js/catalog.js");
const sandbox = { window: {} };

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(catalogPath, "utf8"), sandbox, {
  filename: catalogPath,
});

const { BRAND, PRODUCTS } = sandbox.window.HP;
const categories = new Set(PRODUCTS.map((product) => product.category));
const profiles = new Set(PRODUCTS.map((product) => product.profile));
const ids = PRODUCTS.map((product) => product.id);

assert.equal(PRODUCTS.length, 18, "the published catalog should contain 18 products");
assert.equal(categories.size, 6, "the published catalog should contain six formats");
assert.equal(profiles.size, 4, "the published catalog should contain four profile tracks");
assert.equal(new Set(ids).size, ids.length, "product identifiers must be unique");
assert.equal(BRAND.commerceEnabled, false, "commerce must remain disabled in this preview");

for (const product of PRODUCTS) {
  assert.ok(product.id, "each product needs an identifier");
  assert.ok(product.name, `${product.id} needs a display name`);
  assert.ok(product.category, `${product.id} needs a category`);
  assert.ok(product.profile, `${product.id} needs a profile`);
  assert.ok(product.photos.length > 0, `${product.id} needs at least one photo`);
  assert.ok(product.variants.length > 0, `${product.id} needs at least one variant`);
}

const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith(".html"));
const missingReferences = [];
const localReferencePattern = /(?:href|src)="([^"]+)"/g;
const pagesBasePath = "/high-pie-hemp-website/";

for (const htmlFile of htmlFiles) {
  const source = fs.readFileSync(path.join(root, htmlFile), "utf8");

  for (const match of source.matchAll(localReferencePattern)) {
    const reference = match[1];

    if (/^(?:https?:|data:|mailto:|tel:|#|javascript:)/.test(reference)) continue;

    const cleanReference = reference.split(/[?#]/, 1)[0];
    if (!cleanReference) continue;

    const repositoryReference = cleanReference.startsWith(pagesBasePath)
      ? cleanReference.slice(pagesBasePath.length)
      : cleanReference.replace(/^\//, "");
    const target = path.resolve(root, repositoryReference);

    if (!fs.existsSync(target)) {
      missingReferences.push(`${htmlFile}: ${reference}`);
    }
  }
}

assert.deepEqual(
  missingReferences,
  [],
  `static HTML contains missing local references:\n${missingReferences.join("\n")}`,
);

for (const route of ["cart.html", "checkout.html"]) {
  const source = fs.readFileSync(path.join(root, route), "utf8");
  assert.match(source, /Purchasing coming soon/, `${route} must state the commerce boundary`);
}

console.log("High Pie portfolio verification passed");
console.log(`- ${PRODUCTS.length} products, ${categories.size} formats, ${profiles.size} profiles`);
console.log(`- ${htmlFiles.length} HTML routes with valid local href/src targets`);
console.log("- commerce disabled in catalog, cart, and checkout");
