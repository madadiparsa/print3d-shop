// =============================================================
//  storefront/src/pages/ProductDetailPage.jsx
//  Filled in Phase 9
// =============================================================

import { useParams } from "react-router-dom";

function ProductDetailPage() {
  const { slug } = useParams();

  return (
    <div className="container py-5">
      <h2 className="text-primary-brand mb-4">جزئیات محصول</h2>
      <p className="text-muted">
        صفحه محصول <strong>{slug}</strong> در فاز ۹ تکمیل می‌شود.
      </p>
    </div>
  );
}

export default ProductDetailPage;