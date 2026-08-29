// Shared helpers for Incossify app pages
// Fully client-side (localStorage) — Firebase used ONLY to read/write config.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDrnmtx0LkfMKytzTKQZwXCg1JKZXiJmtU",
  authDomain: "glamour-28049.firebaseapp.com",
  projectId: "glamour-28049",
  storageBucket: "glamour-28049.firebasestorage.app",
  messagingSenderId: "22177815395",
  appId: "1:22177815395:web:2ca7caa2b1626299675156"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "(default)");
export const CONFIG_DOC = doc(db, "account", "incossifyprincess");

// ── Storage keys ──
export const USERS_KEY       = "incossify_users";
export const USER_KEY        = "incossify_connect_user";
export const ACTIVE_KEY      = "incossify_account_active";
export const TASKS_KEY       = "incossify_tasks";
export const EARNINGS_KEY    = "incossify_total_earnings";
export const WITHDRAW_KEY    = "incossify_withdrawals";
export const RECEIPT_KEY     = "incossify_receipt";

// ── Users (localStorage array) ──
export function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
}
export function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
export function saveUser(u) { localStorage.setItem(USER_KEY, JSON.stringify(u)); }
export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; }
}
export function clearUser() { localStorage.removeItem(USER_KEY); localStorage.removeItem(ACTIVE_KEY); }

export function isActive() { return localStorage.getItem(ACTIVE_KEY) === "true"; }
export function setActive(v) { localStorage.setItem(ACTIVE_KEY, v ? "true" : "false"); }

// ── Config (Firebase, read-only for the frontend) ──
export function loadConfig() {
  return getDoc(CONFIG_DOC)
    .then(snap => (snap.exists() ? snap.data() : {}))
    .catch(() => ({}));
}

export function fmt(n) { return "₦" + Number(n || 0).toLocaleString(); }
export function esc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── Balances (stored on the current user object) ──
export function getBalance(user, key) { return Number((user && user[key]) || 0); }

// ── Toast ──
let toastEl = null;
export function toast(msg) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "toast";
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 2400);
}

// ── Bottom nav ──
const NAV = [
  { to: "dashboard.html", label: "Home", icon: "home" },
  { to: "withdraw.html", label: "Wallet", icon: "withdraw" },
  { to: "profile.html", label: "Profile", icon: "profile" },
];

export function renderNav(active) {
  const nav = document.getElementById("bottomNav");
  if (!nav) return;
  const lis = NAV.map(item => {
    const isActive = item.to.split(".")[0] === active;
    return `<li><a href="${item.to}" class="${isActive ? "active" : ""}"><span class="nav-ic">${icon(item.icon)}</span>${item.label}</a></li>`;
  }).join("");
  nav.innerHTML = `<ul>${lis}</ul><div class="safe"></div>`;
}

// ── Icons (lucide paths) ──
const ICONS = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
  withdraw: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>',
  tasks: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
  profile: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
};

export function icon(name, cls) {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="' + (cls || "") + '">' + (ICONS[name] || "") + "</svg>";
}

// ── Activation gate modal (bobby-new style: shown only when earning/withdrawing) ──
export function showActivateGate() {
  if (isActive()) return false;
  if (document.getElementById("incossifyGate")) return true;
  const gate = document.createElement("div");
  gate.className = "gate";
  gate.id = "incossifyGate";
  gate.innerHTML = `
    <div class="box">
      <div class="big">!</div>
      <h2>Activate your account</h2>
      <p>Kindly activate your account to earn from premium tasks. You can do other tasks below.</p>
      <button class="btn btn-aqua" id="incossifyGateNow">Activate Now</button>
      <button class="ghost" id="incossifyGateBack">Go Back</button>
    </div>`;
  document.body.appendChild(gate);
  gate.querySelector("#incossifyGateNow").addEventListener("click", () => {
    openActivationPicker();
  });
  gate.querySelector("#incossifyGateBack").addEventListener("click", () => {
    gate.remove();
  });
  return true;
}

// ── Package picker modal (shown after tapping Activate) ──
let pickerEl = null;
export async function openActivationPicker() {
  // close any open activation gate / withdraw gate
  const gate = document.getElementById("incossifyGate");
  if (gate) gate.remove();
  const wg = document.getElementById("activateGate");
  if (wg) wg.classList.remove("active");
  document.body.style.overflow = "";

  if (pickerEl) pickerEl.remove();

  const config = await loadConfig();
  const getLink = (pkg) => (pkg === "apex" ? config.paymentLink2 : config.paymentLink1) || "";

  pickerEl = document.createElement("div");
  pickerEl.className = "gate";
  pickerEl.id = "incossifyPicker";
  pickerEl.innerHTML = `
    <div class="box">
      <div style="display:flex;align-items:center;justify-content:flex-start;">
        <button type="button" class="picker-back" id="pickerBackTop" aria-label="Back">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>
        </button>
      </div>
      <div class="big" style="overflow:hidden;"><img src="assets/logo-CUooZ1Ch.png" alt="Incossify" style="width:100%;height:100%;object-fit:cover;border-radius:1rem;"></div>
      <h2>Choose your activation package</h2>
      <p>Pick a package to activate your account and start earning premium rewards.</p>
      <div style="display:grid;gap:10px;margin-top:16px;">
        <button type="button" class="picker-card" data-pkg="starterkit">
          <span class="pk-name">StarterKit Package</span>
          <span class="pk-price">₦9,500</span>
        </button>
        <button type="button" class="picker-card" data-pkg="apex">
          <span class="pk-name">Apex Package</span>
          <span class="pk-price">₦15,000</span>
        </button>
      </div>
      <button class="ghost" id="pickerBack" type="button">Go Back</button>
    </div>`;
  document.body.appendChild(pickerEl);

  pickerEl.querySelectorAll("[data-pkg]").forEach(btn => {
    btn.addEventListener("click", () => {
      const pkg = btn.dataset.pkg;
      // remember the chosen package so payment.html shows it directly (no second selector)
      const cur = getCurrentUser();
      if (cur) {
        cur.package = pkg;
        cur.package_name = pkg === "apex" ? "Apex Package" : "StarterKit Package";
        saveUser(cur);
        const users = getUsers();
        const i = users.findIndex(u => u.email === cur.email);
        if (i >= 0) { users[i] = cur; saveUsers(users); }
      }
      if (config.usePaymentLink) {
        const link = getLink(pkg);
        if (link) { window.location.href = link; return; }
      }
      window.location.href = "payment.html";
    });
  });
  [pickerEl.querySelector("#pickerBackTop"), pickerEl.querySelector("#pickerBack")].forEach(btn => {
    if (btn) btn.addEventListener("click", () => pickerEl.remove());
  });
}
