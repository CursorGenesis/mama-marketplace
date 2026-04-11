import SupplierPageClient from './SupplierPageClient';

export async function generateStaticParams() {
  return [{ id: '_' }];
}

export default function Page() {
  return <SupplierPageClient />;
}
