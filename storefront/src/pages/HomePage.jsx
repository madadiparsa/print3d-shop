// =============================================================
//  storefront/src/pages/HomePage.jsx
// =============================================================

function HomePage() {
  return (
    <div className="container py-5">
      <div className="text-center py-5">
        <h1 className="text-primary-brand mb-3">
          به فروشگاه پرینت سه‌بعدی خوش آمدید
        </h1>
        <p className="text-muted fs-5">
          محصولات آماده و سفارشی با کیفیت بالا
        </p>
        <a href="/catalog" className="btn btn-primary mt-3 px-4">
          مشاهده محصولات
        </a>
      </div>
    </div>
  );
}

export default HomePage;