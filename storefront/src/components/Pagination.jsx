// =============================================================
//  storefront/src/components/Pagination.jsx
//  Reusable pagination component — works with DRF PageNumber
//  pagination responses (count, next, previous, results).
// =============================================================

function Pagination({ count, pageSize = 12, currentPage, onPageChange }) {
  if (!count || count <= pageSize) return null;

  const totalPages = Math.ceil(count / pageSize);

  // Build page number array with ellipsis for large page counts
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2; // pages to show on each side of current

    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd   = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);

    if (rangeStart > 2) pages.push("...");

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    if (rangeEnd < totalPages - 1) pages.push("...");

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav aria-label="صفحه‌بندی" className="mt-4">
      <ul className="pagination justify-content-center flex-wrap gap-1">

        {/* Previous button */}
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="صفحه قبل"
            style={{ fontFamily: "var(--font-primary)" }}
          >
            قبلی
          </button>
        </li>

        {/* Page numbers */}
        {pages.map((page, index) =>
          page === "..." ? (
            <li key={`ellipsis-${index}`} className="page-item disabled">
              <span
                className="page-link"
                style={{ fontFamily: "var(--font-primary)" }}
              >
                ...
              </span>
            </li>
          ) : (
            <li
              key={page}
              className={`page-item ${currentPage === page ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(page)}
                style={{ fontFamily: "var(--font-primary)" }}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page.toLocaleString("fa-IR")}
              </button>
            </li>
          )
        )}

        {/* Next button */}
        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="صفحه بعد"
            style={{ fontFamily: "var(--font-primary)" }}
          >
            بعدی
          </button>
        </li>

      </ul>

      {/* Result count */}
      <p
        className="text-center text-muted mt-2"
        style={{ fontSize: "0.85rem", fontFamily: "var(--font-primary)" }}
      >
        {count.toLocaleString("fa-IR")} محصول یافت شد
      </p>
    </nav>
  );
}

export default Pagination;