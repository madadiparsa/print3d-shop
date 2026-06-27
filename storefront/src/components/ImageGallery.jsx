// =============================================================
//  storefront/src/components/ImageGallery.jsx
//  Reusable product image gallery with lightbox.
//  Used in ProductDetailPage and can be reused anywhere.
// =============================================================

import { useEffect, useState } from "react";

function ImageGallery({ thumbnail, images = [], name = "" }) {
  // Combine thumbnail + gallery images into one unified array
  const allImages = [
    ...(thumbnail
      ? [{ id: "thumb", image: thumbnail, alt_text: name }]
      : []),
    ...images,
  ];

  const [active, setActive]       = useState(0);
  const [lightbox, setLightbox]   = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  // ── Keyboard navigation for lightbox ─────────────────────
  useEffect(() => {
    if (!lightbox) return;

    const handleKey = (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        setLightboxIdx((i) => (i + 1) % allImages.length);
      }
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        setLightboxIdx((i) =>
          i === 0 ? allImages.length - 1 : i - 1
        );
      }
      if (e.key === "Escape") {
        setLightbox(false);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightbox, allImages.length]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  // ── Open lightbox ─────────────────────────────────────────
  const openLightbox = (idx) => {
    setLightboxIdx(idx);
    setLightbox(true);
  };

  // ── No images fallback ────────────────────────────────────
  if (allImages.length === 0) {
    return (
      <div
        className="d-flex align-items-center justify-content-center rounded"
        style={{
          height: 380,
          backgroundColor: "var(--color-border)",
          borderRadius: "var(--radius-md)",
          fontSize: "5rem",
        }}
      >
        🖨️
      </div>
    );
  }

  return (
    <>
      {/* ── Main image ──────────────────────────────────── */}
      <div
        style={{
          height: 380,
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          backgroundColor: "var(--color-border)",
          marginBottom: "0.75rem",
          cursor: "zoom-in",
          position: "relative",
        }}
        onClick={() => openLightbox(active)}
        title="برای بزرگنمایی کلیک کنید"
      >
        <img
          src={allImages[active].image}
          alt={allImages[active].alt_text || name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform var(--transition-base)",
          }}
        />

        {/* Zoom hint */}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            background: "rgba(0,0,0,0.45)",
            color: "#fff",
            borderRadius: "var(--radius-sm)",
            padding: "2px 8px",
            fontSize: "0.75rem",
          }}
        >
          🔍 بزرگنمایی
        </div>

        {/* Image counter */}
        {allImages.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              background: "rgba(0,0,0,0.45)",
              color: "#fff",
              borderRadius: "var(--radius-sm)",
              padding: "2px 8px",
              fontSize: "0.75rem",
            }}
          >
            {(active + 1).toLocaleString("fa-IR")} /{" "}
            {allImages.length.toLocaleString("fa-IR")}
          </div>
        )}
      </div>

      {/* ── Thumbnails ───────────────────────────────────── */}
      {allImages.length > 1 && (
        <div className="d-flex gap-2 flex-wrap">
          {allImages.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setActive(idx)}
              style={{
                width: 72,
                height: 72,
                padding: 0,
                border: `2px solid ${
                  active === idx
                    ? "var(--color-primary)"
                    : "var(--color-border)"
                }`,
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                cursor: "pointer",
                background: "none",
                flexShrink: 0,
                transition: "border-color var(--transition-fast)",
              }}
              aria-label={`تصویر ${idx + 1}`}
            >
              <img
                src={img.image}
                alt={img.alt_text || name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox ─────────────────────────────────────── */}
      {lightbox && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            backgroundColor: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setLightbox(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightbox(false)}
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              borderRadius: "50%",
              width: 40,
              height: 40,
              fontSize: "1.2rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="بستن"
          >
            ✕
          </button>

          {/* Previous button (RTL: right side = previous) */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx((i) =>
                  i === 0 ? allImages.length - 1 : i - 1
                );
              }}
              style={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "#fff",
                borderRadius: "50%",
                width: 48,
                height: 48,
                fontSize: "1.4rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="تصویر قبلی"
            >
              ›
            </button>
          )}

          {/* Main lightbox image */}
          <img
            src={allImages[lightboxIdx].image}
            alt={allImages[lightboxIdx].alt_text || name}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: "var(--radius-md)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next button (RTL: left side = next) */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx((i) => (i + 1) % allImages.length);
              }}
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "#fff",
                borderRadius: "50%",
                width: 48,
                height: 48,
                fontSize: "1.4rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="تصویر بعدی"
            >
              ‹
            </button>
          )}

          {/* Counter */}
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              borderRadius: "var(--radius-sm)",
              padding: "4px 12px",
              fontSize: "0.85rem",
            }}
          >
            {(lightboxIdx + 1).toLocaleString("fa-IR")} /{" "}
            {allImages.length.toLocaleString("fa-IR")}
          </div>
        </div>
      )}
    </>
  );
}

export default ImageGallery;