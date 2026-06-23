import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import "../../styles/checkout.css";

const METHODS = [
  { label: "Credit / Debit Card", icon: "💳" },
  { label: "UPI",                 icon: "📱" },
  { label: "Net Banking",         icon: "🏦" },
  { label: "Wallets",             icon: "💰" },
];

const BANKS    = ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Bank", "PNB"];
const UPI_APPS = ["GPay", "PhonePe", "Paytm", "BHIM", "Amazon Pay"];
const WALLETS  = ["Paytm Wallet", "Amazon Pay", "Mobikwik", "Freecharge"];

function validate(method, form) {
  const errs = {};
  if (method === 0) {
    if (!form.cardNumber || form.cardNumber.replace(/\s/g, "").length < 16)
      errs.cardNumber = "Enter a valid 16-digit card number";
    if (!form.cardName || form.cardName.trim().length < 3)
      errs.cardName = "Enter cardholder name";
    if (!form.expiry || !/^\d{2}\/\d{2}$/.test(form.expiry))
      errs.expiry = "Enter expiry as MM/YY";
    if (!form.cvv || form.cvv.length < 3)
      errs.cvv = "Enter valid CVV";
  }
  if (method === 1) {
    if (!form.upiId || !/^[\w.\-]+@[\w]+$/.test(form.upiId))
      errs.upiId = "Enter a valid UPI ID (e.g. name@upi)";
  }
  if (method === 2) { if (!form.bank)   errs.bank   = "Select a bank";   }
  if (method === 3) { if (!form.wallet) errs.wallet = "Select a wallet"; }
  return errs;
}

export default function Checkout() {
  const { state }  = useLocation();
  const navigate   = useNavigate();

  const [method,  setMethod]  = useState(0);
  const [form,    setForm]    = useState({
    cardNumber: "", cardName: "", expiry: "", cvv: "",
    upiId: "", bank: "", wallet: "",
  });
  const [errors,   setErrors]   = useState({});
  const [phase,    setPhase]    = useState("form"); // form | processing | success | refunding | refunded
  const [booking,  setBooking]  = useState(null);
  const [refundErr, setRefundErr] = useState("");

  if (!state?.selectedSeats) return (
    <div className="page-wrapper" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", flexDirection:"column", gap:16 }}>
      <h2 style={{ fontFamily:"var(--font-head)" }}>No seats selected</h2>
      <button className="btn-primary" onClick={() => navigate("/home")}>Browse Events</button>
    </div>
  );

  const { selectedSeats, total, event, section } = state;

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  const formatCard   = val => val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = val => {
    const d = val.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? d.slice(0,2) + "/" + d.slice(2) : d;
  };

  const handlePay = async () => {
    const errs = validate(method, form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setPhase("processing");
    try {
      const res = await api.post("/bookings", {
        event_id:     event.id,
        seat_ids:     selectedSeats.map(s => s.id),
        total_amount: total,
      });
      setTimeout(() => {
        setBooking(res.data);
        setPhase("success");
      }, 2000);
    } catch {
      setPhase("form");
      alert("Booking failed. Please try again.");
    }
  };

  const handleRefund = async () => {
    if (!window.confirm(
      `Cancel this booking and refund ₹${total.toLocaleString()}?\n\nNote: This is a dummy refund — no real money movement occurs.`
    )) return;

    setPhase("refunding");
    setRefundErr("");
    try {
      const res = await api.post(`/bookings/${booking.booking_id}/refund`);
      setTimeout(() => setPhase("refunded"), 1500);
    } catch (err) {
      setRefundErr(err.response?.data?.message || "Refund failed. Please contact support.");
      setPhase("success");
    }
  };

  // ── Processing ────────────────────────────────────────────────
  if (phase === "processing") return (
    <div className="page-wrapper">
      <Navbar />
      <div className="checkout-processing">
        <div className="processing-spinner" />
        <h2>Processing Payment</h2>
        <p className="processing-amount">₹{total.toLocaleString()}</p>
        <p>Please do not close or refresh this page…</p>
      </div>
    </div>
  );

  // ── Refunding ────────────────────────────────────────────────
  if (phase === "refunding") return (
    <div className="page-wrapper">
      <Navbar />
      <div className="checkout-processing">
        <div className="processing-spinner" />
        <h2>Processing Refund</h2>
        <p className="processing-amount">₹{total.toLocaleString()}</p>
        <p>Cancelling your booking and releasing seats…</p>
      </div>
    </div>
  );

  // ── Refunded ─────────────────────────────────────────────────
  if (phase === "refunded") return (
    <div className="page-wrapper">
      <Navbar />
      <div className="checkout-success">
        <div className="success-icon" style={{ background:"rgba(255,122,122,0.12)", border:"2px solid var(--danger)", color:"var(--danger)" }}>✕</div>
        <h1>Booking <span style={{ color:"var(--danger)" }}>Cancelled</span></h1>
        <p className="success-sub">
          Your booking for <strong>{event.title}</strong> has been cancelled.
          {booking?.booking_id && <> Booking <strong>#{booking.booking_id}</strong> has been refunded.</>}
        </p>

        <div className="success-ticket" style={{ borderColor:"rgba(255,122,122,0.2)" }}>
          <div className="ticket-row">
            <span>Refund Amount</span>
            <span style={{ color:"var(--danger)", fontWeight:700 }}>₹{total.toLocaleString()}</span>
          </div>
          <div className="ticket-row">
            <span>Status</span>
            <span style={{ color:"var(--danger)" }}>Cancelled &amp; Refunded</span>
          </div>
          <div className="ticket-row">
            <span>Seats Released</span>
            <span>{selectedSeats.map(s => s.seat_number).join(", ")}</span>
          </div>
          <div className="ticket-row" style={{ fontSize:11, color:"var(--text-muted)", marginTop:8 }}>
            <span>Note</span>
            <span>Refunds reflect in 5–7 business days (dummy)</span>
          </div>
        </div>

        <div style={{ display:"flex", gap:12, marginTop:32 }}>
          <button className="btn-primary" onClick={() => navigate("/my-bookings")}>My Bookings</button>
          <button className="btn-ghost"   onClick={() => navigate("/home")}>Browse Events</button>
        </div>
      </div>
    </div>
  );

  // ── Success ───────────────────────────────────────────────────
  if (phase === "success") return (
    <div className="page-wrapper">
      <Navbar />
      <div className="checkout-success">
        <div className="success-icon">✓</div>
        <h1>Booking <span style={{ color:"var(--primary)" }}>Confirmed!</span></h1>
        <p className="success-sub">
          Your tickets for <strong>{event.title}</strong> are confirmed.
          {booking?.booking_id && <> Booking ID: <strong>#{booking.booking_id}</strong></>}
        </p>

        <div className="success-ticket">
          {[
            ["Event",   event.title],
            ["Venue",   event.venue_name],
            ["Date",    new Date(event.event_date).toDateString()],
            ["Section", section?.section_name],
            ["Seats",   selectedSeats.map(s => s.seat_number).join(", ")],
            ["Qty",     `${selectedSeats.length} ticket(s)`],
          ].map(([label, val]) => (
            <div className="ticket-row" key={label}>
              <span>{label}</span><span>{val}</span>
            </div>
          ))}
          <div className="ticket-divider">
            <div className="ticket-notch left" />
            <div className="ticket-notch right" />
          </div>
          <div className="ticket-row total">
            <span>Total Paid</span>
            <span style={{ color:"var(--primary)" }}>₹{total.toLocaleString()}</span>
          </div>
        </div>

        {refundErr && (
          <p style={{ color:"var(--danger)", fontSize:13, marginTop:16 }}>{refundErr}</p>
        )}

        <div style={{ display:"flex", gap:12, marginTop:32, flexWrap:"wrap", justifyContent:"center" }}>
          <button className="btn-primary" onClick={() => navigate("/my-bookings")}>
            My Bookings
          </button>
          <button className="btn-ghost" onClick={() => navigate("/home")}>
            Browse More
          </button>
          <button
            onClick={handleRefund}
            style={{
              background:"transparent",
              border:"1px solid var(--danger)",
              borderRadius:8, padding:"12px 24px",
              color:"var(--danger)", fontSize:13,
              fontFamily:"var(--font-body)", cursor:"pointer",
              transition:"var(--transition)",
            }}
          >
            Cancel &amp; Refund
          </button>
        </div>

        <p style={{ fontSize:11, color:"var(--text-muted)", marginTop:16, textAlign:"center" }}>
          Refunds are processed within 5–7 business days · Only available for future events
        </p>
      </div>
    </div>
  );

  // ── Checkout Form ────────────────────────────────────────────
  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="checkout-page">
        <div className="checkout-left">
          <h1>Checkout <span>.</span></h1>

          <div className="checkout-card">
            <p className="checkout-card-label">Payment Method</p>
            <div className="method-tabs">
              {METHODS.map((m, i) => (
                <button key={i}
                  className={`method-tab ${method === i ? "active" : ""}`}
                  onClick={() => { setMethod(i); setErrors({}); }}>
                  <span className="method-icon">{m.icon}</span>{m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="checkout-card">
            <p className="checkout-card-label">{METHODS[method].label} Details</p>

            {method === 0 && (
              <div className="pay-form">
                <div className="pay-field">
                  <label>Card Number</label>
                  <input placeholder="1234 5678 9012 3456" value={form.cardNumber} maxLength={19}
                    className={errors.cardNumber ? "input-err" : ""}
                    onChange={e => set("cardNumber", formatCard(e.target.value))} />
                  {errors.cardNumber && <span className="field-err">{errors.cardNumber}</span>}
                  <div className="card-brands">
                    {["VISA","MC","AMEX","RUPAY"].map(b => <span key={b}>{b}</span>)}
                  </div>
                </div>
                <div className="pay-field">
                  <label>Cardholder Name</label>
                  <input placeholder="As printed on card" value={form.cardName}
                    className={errors.cardName ? "input-err" : ""}
                    onChange={e => set("cardName", e.target.value)} />
                  {errors.cardName && <span className="field-err">{errors.cardName}</span>}
                </div>
                <div className="pay-field-row">
                  <div className="pay-field">
                    <label>Expiry (MM/YY)</label>
                    <input placeholder="MM/YY" value={form.expiry} maxLength={5}
                      className={errors.expiry ? "input-err" : ""}
                      onChange={e => set("expiry", formatExpiry(e.target.value))} />
                    {errors.expiry && <span className="field-err">{errors.expiry}</span>}
                  </div>
                  <div className="pay-field">
                    <label>CVV</label>
                    <input placeholder="•••" type="password" value={form.cvv} maxLength={4}
                      className={errors.cvv ? "input-err" : ""}
                      onChange={e => set("cvv", e.target.value.replace(/\D/g, ""))} />
                    {errors.cvv && <span className="field-err">{errors.cvv}</span>}
                  </div>
                </div>
                <p className="checkout-secure">🔒 Your card details are encrypted and secure</p>
              </div>
            )}

            {method === 1 && (
              <div className="pay-form">
                <div className="pay-field">
                  <label>UPI ID</label>
                  <input placeholder="yourname@upi" value={form.upiId}
                    className={errors.upiId ? "input-err" : ""}
                    onChange={e => set("upiId", e.target.value)} />
                  {errors.upiId && <span className="field-err">{errors.upiId}</span>}
                </div>
                <div className="pay-field">
                  <label>Or pay with</label>
                  <div className="upi-apps">
                    {UPI_APPS.map(app => (
                      <button key={app}
                        className={`upi-app ${form.upiId === app.toLowerCase()+"@upi" ? "active" : ""}`}
                        onClick={() => set("upiId", app.toLowerCase().replace(" ","")+"@upi")}>
                        {app}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="checkout-secure">🔒 You'll receive a payment request on your UPI app</p>
              </div>
            )}

            {method === 2 && (
              <div className="pay-form">
                <div className="pay-field">
                  <label>Select Bank</label>
                  {errors.bank && <span className="field-err">{errors.bank}</span>}
                  <div className="bank-list">
                    {BANKS.map(bank => (
                      <button key={bank} className={`bank-opt ${form.bank === bank ? "active" : ""}`}
                        onClick={() => set("bank", bank)}>{bank}</button>
                    ))}
                  </div>
                </div>
                <p className="checkout-secure">🔒 You'll be redirected to your bank's secure page</p>
              </div>
            )}

            {method === 3 && (
              <div className="pay-form">
                <div className="pay-field">
                  <label>Select Wallet</label>
                  {errors.wallet && <span className="field-err">{errors.wallet}</span>}
                  <div className="bank-list">
                    {WALLETS.map(w => (
                      <button key={w} className={`bank-opt ${form.wallet === w ? "active" : ""}`}
                        onClick={() => set("wallet", w)}>{w}</button>
                    ))}
                  </div>
                </div>
                <p className="checkout-secure">🔒 Wallet balance will be deducted instantly</p>
              </div>
            )}
          </div>
        </div>

        <div className="checkout-right">
          <div className="checkout-card">
            <p className="checkout-card-label">Order Summary</p>
            {[
              ["Event",   event.title],
              ["Venue",   event.venue_name],
              ["Date",    new Date(event.event_date).toDateString()],
              ["Section", section?.section_name],
              ["Seats",   selectedSeats.map(s => s.seat_number).join(", ")],
              ["Qty",     `${selectedSeats.length} ticket(s)`],
            ].map(([label, val]) => (
              <div className="checkout-row" key={label}><span>{label}</span><span>{val}</span></div>
            ))}
            <div className="divider" />
            <div className="checkout-row total">
              <span>Total</span><span>₹{total.toLocaleString()}</span>
            </div>
          </div>

          <button className="btn-primary checkout-pay-btn" onClick={handlePay}>
            Pay ₹{total.toLocaleString()} →
          </button>
          <p className="checkout-terms">
            By completing this purchase you agree to our Terms of Service.<br />
            Refunds available for future events only.
          </p>
        </div>
      </div>
    </div>
  );
}