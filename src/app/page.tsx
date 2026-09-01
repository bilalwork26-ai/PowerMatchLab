import { getAllProducts } from "@/data/products";
import { scoreCatalog } from "@/lib/score";
import {
  FinalCalculatorCta,
  Hero,
  ToolsSection,
  TopProducts,
  TrustBand,
  UseCaseCards,
} from "@/components/home/HomeSections";

export default function HomePage() {
  const products = getAllProducts();
  const scores = scoreCatalog(products);

  const ranked = [...products]
    .map((product) => ({ product, score: scores.get(product.id)! }))
    .sort((a, b) => (b.score.overall ?? -1) - (a.score.overall ?? -1));

  return (
    <>
      <Hero />
      <ToolsSection />
      <TopProducts items={ranked} />
      <UseCaseCards />
      <TrustBand />
      <FinalCalculatorCta />
    </>
  );
}
