import type { Product } from "@/types/product";
import { productsSchema } from "./product-schema";
import rawProducts from "../../products.json";

/**
 * Loads and validates the canonical catalog once, at module load.
 *
 * `products.json` at the repository root is the single source of truth. If it
 * ever drifts from the expected shape the build fails loudly here rather than
 * rendering misleading UI.
 */
const parsed = productsSchema.safeParse(rawProducts);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
  throw new Error(`products.json failed schema validation:\n${issues}`);
}

export const products: Product[] = parsed.data as Product[];

const byId = new Map(products.map((product) => [product.id, product]));

export function getAllProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return byId.get(id);
}

export function getProductsByIds(ids: string[]): Product[] {
  return ids
    .map((id) => byId.get(id))
    .filter((product): product is Product => Boolean(product));
}

export function productDisplayName(product: Product): string {
  return `${product.brand} ${product.model}`;
}

/** All distinct brands, sorted for stable filter UIs. */
export function getBrands(): string[] {
  return Array.from(new Set(products.map((p) => p.brand))).sort((a, b) =>
    a.localeCompare(b),
  );
}

/** All distinct battery chemistries present in the catalog. */
export function getChemistries(): string[] {
  return Array.from(
    new Set(
      products
        .map((p) => p.battery_chemistry)
        .filter((v): v is string => Boolean(v)),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

/** All distinct `best_for` tags present in the catalog. */
export function getUseCaseTags(): string[] {
  return Array.from(new Set(products.flatMap((p) => p.best_for))).sort((a, b) =>
    a.localeCompare(b),
  );
}
