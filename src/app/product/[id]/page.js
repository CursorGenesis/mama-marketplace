import ProductPageClient from './ProductPageClient';

export async function generateStaticParams() {
  return [{ id: '_' }];
}

export default function Page() {
  return <ProductPageClient />;
}
