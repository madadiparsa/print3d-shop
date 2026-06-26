// =============================================================
//  storefront/src/pages/NotFoundPage.jsx
// =============================================================

import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="container py-5">
      <div className="text-center py-5">
        <h1 className="display-1 text-primary-brand fw-bold">۴۰۴</h1>
        <h2 className="mb-3">صفحه پیدا نشد</h2>
        <p className="text-muted mb-4">
          صفحه‌ای که دنبالش می‌گردید وجود ندارد یا حذف شده است.
        </p>
        <Link to="/" className="btn btn-primary px-4">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;