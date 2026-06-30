// =============================================================
//  admin-panel/src/pages/MessagesPage.jsx
//  Contact messages inbox — list, read/unread toggle, delete.
// =============================================================

import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

function MessagesPage() {
  const [messages, setMessages]   = useState([]);
  const [count, setCount]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [filterRead, setFilterRead] = useState("all");
  const [expanded, setExpanded]   = useState(null); // expanded message id

  // ── Fetch messages ────────────────────────────────────────
  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/orders/contact/");
      const all = res.data.results || res.data;
      setMessages(all);
      setCount(res.data.count || all.length);
    } catch {
      setError("خطا در بارگذاری پیام‌ها.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // ── Toggle read/unread ────────────────────────────────────
  const handleToggleRead = async (msg) => {
    try {
      await api.patch(`/orders/contact/${msg.id}/read/`);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id ? { ...m, is_read: !m.is_read } : m
        )
      );
    } catch {
      alert("خطا در تغییر وضعیت پیام.");
    }
  };

  // ── Filtered messages ─────────────────────────────────────
  const filtered = messages.filter((m) => {
    if (filterRead === "unread") return !m.is_read;
    if (filterRead === "read")   return m.is_read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <AdminLayout title="صندوق پیام‌ها">

      {/* ── Toolbar ───────────────────────────────────────── */}
      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-4">
        <div className="d-flex gap-2 align-items-center">
          <h6 className="mb-0 fw-bold">
            {count.toLocaleString("fa-IR")} پیام
          </h6>
          {unreadCount > 0 && (
            <span className="badge bg-danger">
              {unreadCount.toLocaleString("fa-IR")} خوانده نشده
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div className="btn-group">
          {[
            { value: "all",    label: "همه"           },
            { value: "unread", label: "خوانده نشده"   },
            { value: "read",   label: "خوانده شده"    },
          ].map((opt) => (
            <button
              key={opt.value}
              className={`btn btn-sm ${
                filterRead === opt.value
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setFilterRead(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">{error}</div>
      )}

      {/* ── Loading skeletons ──────────────────────────────── */}
      {loading && (
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton mb-3" style={{ height: 80 }} />
          ))}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────── */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-5">
          <div style={{ fontSize: "3rem" }}>✉️</div>
          <h5 className="mt-3 mb-1">
            {filterRead === "unread"
              ? "پیام خوانده نشده‌ای وجود ندارد"
              : "پیامی یافت نشد"}
          </h5>
          <p className="text-muted" style={{ fontSize: "0.9rem" }}>
            {filterRead !== "all" && (
              <button
                className="btn btn-link p-0"
                onClick={() => setFilterRead("all")}
              >
                مشاهده همه پیام‌ها
              </button>
            )}
          </p>
        </div>
      )}

      {/* ── Messages list ─────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div className="d-flex flex-column gap-3">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className="card"
              style={{
                borderRight: `4px solid ${
                  msg.is_read
                    ? "var(--color-border)"
                    : "var(--color-primary)"
                }`,
                opacity: msg.is_read ? 0.85 : 1,
                transition: "opacity var(--transition-base)",
              }}
            >
              {/* ── Message header ─────────────────────── */}
              <div
                className="p-3 d-flex align-items-start justify-content-between gap-3"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setExpanded(expanded === msg.id ? null : msg.id)
                }
              >
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                    {!msg.is_read && (
                      <span
                        className="badge bg-primary"
                        style={{ fontSize: "0.65rem" }}
                      >
                        جدید
                      </span>
                    )}
                    <strong style={{ fontSize: "0.95rem" }}>
                      {msg.full_name}
                    </strong>
                    <span
                      className="text-muted"
                      style={{ fontSize: "0.8rem" }}
                      dir="ltr"
                    >
                      {msg.phone}
                    </span>
                  </div>

                  {/* Message preview */}
                  <p
                    className="mb-0 text-muted"
                    style={{
                      fontSize: "0.85rem",
                      display: "-webkit-box",
                      WebkitLineClamp: expanded === msg.id ? "unset" : 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.6,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {msg.message}
                  </p>
                </div>

                {/* Date + expand indicator */}
                <div
                  className="text-end flex-shrink-0"
                  style={{ minWidth: 80 }}
                >
                  <p
                    className="text-muted mb-1"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {new Date(msg.created_at).toLocaleDateString("fa-IR")}
                  </p>
                  <p
                    className="text-muted mb-0"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {new Date(msg.created_at).toLocaleTimeString("fa-IR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {expanded === msg.id ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* ── Expanded content ───────────────────── */}
              {expanded === msg.id && (
                <div
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    padding: "1rem",
                    backgroundColor: "var(--color-bg)",
                  }}
                >
                  {/* Full message */}
                  <p
                    style={{
                      fontSize: "0.9rem",
                      lineHeight: 1.8,
                      whiteSpace: "pre-line",
                      marginBottom: "1rem",
                    }}
                  >
                    {msg.message}
                  </p>

                  {/* Actions */}
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className={`btn btn-sm ${
                        msg.is_read
                          ? "btn-outline-secondary"
                          : "btn-outline-primary"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleRead(msg);
                      }}
                    >
                      {msg.is_read
                        ? "✉️ علامت‌گذاری به عنوان خوانده نشده"
                        : "✅ علامت‌گذاری به عنوان خوانده شده"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Stats footer ──────────────────────────────────── */}
      {!loading && messages.length > 0 && (
        <div
          className="mt-4 p-3 card"
          style={{ fontSize: "0.85rem" }}
        >
          <div className="row text-center g-2">
            <div className="col-4">
              <div className="fw-bold" style={{ color: "var(--color-primary)" }}>
                {count.toLocaleString("fa-IR")}
              </div>
              <div className="text-muted">کل پیام‌ها</div>
            </div>
            <div className="col-4">
              <div className="fw-bold text-danger">
                {unreadCount.toLocaleString("fa-IR")}
              </div>
              <div className="text-muted">خوانده نشده</div>
            </div>
            <div className="col-4">
              <div className="fw-bold text-success">
                {(count - unreadCount).toLocaleString("fa-IR")}
              </div>
              <div className="text-muted">خوانده شده</div>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

export default MessagesPage;