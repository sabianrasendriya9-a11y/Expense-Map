const $ = (s) => document.querySelector(s);
const CAT = {
  Makanan: ["🍔", "#f59e0b"],
  Belanja: ["🛍️", "#8b5cf6"],
  Transportasi: ["🚌", "#06b6d4"],
  Hiburan: ["🎮", "#ec4899"],
  Nongkrong: ["☕", "#b45309"],
  Tagihan: ["🧾", "#64748b"],
  Gaji: ["💼", "#10b981"],
  Lainnya: ["📦", "#94a3b8"],
};
const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
const R = (n) => "Rp" + Math.round(n).toLocaleString("id-ID");
const iso = (d) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 6e4)
    .toISOString()
    .slice(0, 10);
const today = () => iso(new Date());
const uid = () => Math.random().toString(36).slice(2);
function seed() {
  const mk = (o, name, amt, cat, loc, type = "out") => {
    const x = new Date();
    x.setDate(x.getDate() - o);
    return { id: uid(), name, amt, cat, date: iso(x), loc, note: "", type };
  };
  return {
    user: "",
    budget: 1000000,
    theme: "",
    tx: [
      mk(0, "Nasi goreng", 25000, "Makanan", "Warung Bu Siti"),
      mk(0, "Kopi susu", 22000, "Nongkrong", "Kafe Senja"),
      mk(1, "Ojek online", 18000, "Transportasi", "Halte Kota"),
      mk(2, "Kaos", 120000, "Belanja", "Mall Central"),
      mk(3, "Tiket film", 50000, "Hiburan", "Bioskop Plaza"),
      mk(4, "Makan siang", 32000, "Makanan", "Warung Bu Siti"),
      mk(5, "Belanja bulanan", 210000, "Belanja", "Minimarket"),
      mk(6, "Latte", 28000, "Nongkrong", "Kafe Senja"),
      mk(8, "Bensin", 50000, "Transportasi", "SPBU Raya"),
      mk(9, "Gaji", 2500000, "Gaji", "Kantor", "in"),
      mk(12, "Game top-up", 75000, "Hiburan", "Warnet Zone"),
      mk(35, "Makan malam", 60000, "Makanan", "Warung Bu Siti"),
      mk(38, "Sepatu", 250000, "Belanja", "Mall Central"),
      mk(42, "Kopi", 24000, "Nongkrong", "Kafe Senja"),
    ],
  };
}
let S;
try {
  S = JSON.parse(localStorage.getItem("em"));
} catch (e) {}
S = S || seed();
S.goals = S.goals || [];
S.rem = S.rem || {
  on: false,
  freq: "daily",
  time: "20:00",
  dow: "1",
  last: "",
};
const save = () => {
  try {
    localStorage.setItem("em", JSON.stringify(S));
  } catch (e) {}
};
let view = "dash",
  editId = null,
  per = "hari",
  F = { q: "", cat: "", from: "", to: "" },
  ML = [];
const ex = () => S.tx.filter((t) => t.type === "out"),
  sum = (a) => a.reduce((s, t) => s + t.amt, 0);
const grp = (a, f) => {
  const m = {};
  a.forEach((t) => {
    const k = f(t);
    m[k] = (m[k] || 0) + t.amt;
  });
  return m;
};
const topOf = (m) => Object.entries(m).sort((a, b) => b[1] - a[1]);
const mon = (d) => d.slice(0, 7),
  wk = (d) => {
    const x = new Date(d + "T00:00");
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    return iso(x);
  };
function login() {
  const n = $("#u").value.trim();
  if (!n) return;
  S.user = n;
  save();
  boot();
}
function logout() {
  S.user = "";
  save();
  boot();
}
function boot() {
  $("#login").style.display = S.user ? "none" : "flex";
  render();
}
function theme() {
  const dark = S.theme
    ? S.theme === "dark"
    : matchMedia("(prefers-color-scheme:dark)").matches;
  S.theme = dark ? "light" : "dark";
  save();
  render();
}
function go(v) {
  view = v;
  render();
}
function bars(d) {
  const n = d.length,
    mx = Math.max(...d.map((x) => x.v), 1),
    w = 600 / n;
  return `<svg viewBox="0 0 600 210"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22b8e8"/><stop offset="1" stop-color="#2563eb"/></linearGradient></defs>${[0, 1, 2].map((i) => `<line x1="0" x2="600" y1="${20 + i * 75}" y2="${20 + i * 75}" stroke="var(--bd)" stroke-dasharray="4 5"/>`).join("")}${d
    .map((x, i) => {
      const h = (x.v / mx) * 150;
      return `<rect x="${i * w + w * 0.18}" y="${170 - h}" width="${w * 0.64}" height="${Math.max(h, 1)}" rx="5" fill="url(#bg)" opacity="${x.v ? 1 : 0.25}"><title>${esc(x.l)}: ${R(x.v)}</title></rect><text x="${i * w + w / 2}" y="192" text-anchor="middle" font-size="11" fill="var(--mu)">${esc(x.l)}</text>`;
    })
    .join("")}</svg>`;
}
function series(p) {
  const e = ex(),
    o = [],
    now = new Date();
  if (p === "hari") {
    const m = grp(e, (t) => t.date);
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const k = iso(d);
      o.push({ l: k.slice(8), v: m[k] || 0 });
    }
  }
  if (p === "minggu") {
    const m = grp(e, (t) => wk(t.date));
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - 7 * i);
      const k = wk(iso(d));
      o.push({ l: k.slice(5), v: m[k] || 0 });
    }
  }
  if (p === "bulan") {
    const m = grp(e, (t) => mon(t.date));
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = iso(d).slice(0, 7);
      o.push({ l: k.slice(2), v: m[k] || 0 });
    }
  }
  return o;
}
function catList(m, tot) {
  return (
    topOf(m)
      .map(
        ([k, v]) =>
          `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between"><span>${(CAT[k] || CAT.Lainnya)[0]} ${esc(k)}</span><b>${R(v)}</b></div><div class="bar"><i style="width:${(v / tot) * 100}%;background:${(CAT[k] || CAT.Lainnya)[1]}"></i></div></div>`,
      )
      .join("") || '<p class="k">Belum ada data.</p>'
  );
}
function render() {
  const r = document.documentElement;
  S.theme ? (r.dataset.theme = S.theme) : r.removeAttribute("data-theme");
  const N = [
    ["dash", "🏠", "Dashboard"],
    ["tx", "💰", "Transaksi"],
    ["stat", "📊", "Statistik"],
    ["bud", "🎯", "Budget"],
    ["goal", "🐷", "Target"],
  ];
  $("#nav").innerHTML =
    "<h1>💸 ExpenseMap</h1>" +
    N.map(
      (n) =>
        `<button class="nb ${view === n[0] ? "on" : ""}" onclick="go('${n[0]}')"><span>${n[1]}</span>${n[2]}</button>`,
    ).join("") +
    `<div class="me">Halo, ${esc(S.user || "")}<br><a href="#" style="color:#fff" onclick="logout();return false">Keluar</a></div>`;
  const t = N.find((n) => n[0] === view);
  $("#main").innerHTML =
    `<div class="top"><h2>${t[1]} ${t[2]}</h2><div style="display:flex;gap:8px"><button class="btn g s" onclick="exportCsv()">Ekspor</button><button class="btn g s" onclick="theme()">🌓 Tema</button></div></div>` +
    { dash: vDash, tx: vTx, stat: vStat, bud: vBud, goal: vGoal }[view]();
  if (view === "tx") list();
}
function vDash() {
  const e = ex(),
    td = today(),
    m = mon(td),
    mt = sum(e.filter((t) => mon(t.date) === m)),
    big = e.slice().sort((a, b) => b.amt - a.amt)[0],
    inc = sum(S.tx.filter((t) => t.type === "in"));
  const card = (k, v, s = "") =>
    `<div class="c ${s}"><div class="k">${k}</div><div class="v">${v}</div></div>`;
  return `<p class="k" style="margin:-8px 0 16px">Halo ${esc(S.user)}, ini ringkasan keuanganmu.</p><div class="grid">${card("Total pengeluaran", R(sum(e)), "hero")}${card("Hari ini", R(sum(e.filter((t) => t.date === td))))}${card("Bulan ini", R(mt))}${card("Terbesar", big ? R(big.amt) + `<div class="k">${esc(big.name)}</div>` : "-")}${card("Saldo (masuk − keluar)", R(inc - sum(e)))}</div>
<div class="two"><div class="c"><h3>Pengeluaran 14 hari terakhir</h3>${bars(series("hari"))}</div><div class="c"><h3>Per kategori (bulan ini)</h3>${catList(
    grp(
      e.filter((t) => mon(t.date) === m),
      (t) => t.cat,
    ),
    mt || 1,
  )}</div></div>`;
}
function vTx() {
  const o = S.tx.find((t) => t.id === editId) || {
    name: "",
    amt: "",
    cat: "Makanan",
    date: today(),
    loc: "",
    note: "",
    type: "out",
  };
  const opts = Object.keys(CAT)
    .map((k) => `<option ${o.cat === k ? "selected" : ""}>${k}</option>`)
    .join("");
  return `<div class="c" style="margin-bottom:14px"><h3>${editId ? "Edit transaksi" : "Tambah transaksi"}</h3><div class="f">
<div><label>Nama</label><input id="f_name" value="${esc(o.name)}"></div><div><label>Nominal (Rp)</label><input id="f_amt" type="number" min="0" value="${o.amt}"></div>
<div><label>Jenis</label><select id="f_type"><option value="out" ${o.type === "out" ? "selected" : ""}>Pengeluaran</option><option value="in" ${o.type === "in" ? "selected" : ""}>Pemasukan</option></select></div>
<div><label>Kategori</label><select id="f_cat">${opts}</select></div><div><label>Tanggal</label><input id="f_date" type="date" value="${o.date}"></div>
<div><label>Lokasi</label><input id="f_loc" value="${esc(o.loc)}" placeholder="mis. Kafe Senja"></div></div>
<div style="margin-bottom:10px"><label>Catatan</label><input id="f_note" value="${esc(o.note)}"></div>
<button class="btn" onclick="saveTx()">${editId ? "Simpan perubahan" : "Tambah"}</button> ${editId ? '<button class="btn g" onclick="editId=null;render()">Batal</button>' : ""}</div>
<div class="c"><div class="f"><input id="q" placeholder="🔍 Cari transaksi" value="${esc(F.q)}" oninput="F.q=this.value;list()">
<select id="fc" onchange="F.cat=this.value;list()"><option value="">Semua kategori</option>${Object.keys(
    CAT,
  )
    .map((k) => `<option ${F.cat === k ? "selected" : ""}>${k}</option>`)
    .join("")}</select>
<input type="date" value="${F.from}" onchange="F.from=this.value;list()" title="Dari"><input type="date" value="${F.to}" onchange="F.to=this.value;list()" title="Sampai"></div><div id="list"></div></div>`;
}
function list() {
  const q = F.q.toLowerCase(),
    a = S.tx
      .filter(
        (t) =>
          (!q || (t.name + t.loc + t.note).toLowerCase().includes(q)) &&
          (!F.cat || t.cat === F.cat) &&
          (!F.from || t.date >= F.from) &&
          (!F.to || t.date <= F.to),
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  $("#list").innerHTML =
    a
      .map(
        (t) =>
          `<div class="row"><div class="i">${(CAT[t.cat] || CAT.Lainnya)[0]}</div><div class="m"><b>${esc(t.name)}</b><span class="k">${t.date} · ${esc(t.cat)}${t.loc ? " · 📍" + esc(t.loc) : ""}</span></div><div class="${t.type === "in" ? "inc" : "out"}">${t.type === "in" ? "+" : "−"}${R(t.amt)}</div><button class="btn g s" onclick="edit('${t.id}')">Edit</button><button class="btn g s" onclick="del('${t.id}',this)">Hapus</button></div>`,
      )
      .join("") ||
    '<p class="k">Tidak ada transaksi yang cocok. Ubah filter atau tambahkan transaksi baru.</p>';
}
function saveTx() {
  const g = (i) => $("#" + i).value,
    amt = +g("f_amt");
  if (!g("f_name").trim() || !(amt > 0)) {
    toast("Isi nama dan nominal lebih dari 0.");
    return;
  }
  const o = {
    name: g("f_name").trim(),
    amt,
    cat: g("f_cat"),
    date: g("f_date") || today(),
    loc: g("f_loc").trim(),
    note: g("f_note"),
    type: g("f_type"),
  };
  if (editId)
    Object.assign(
      S.tx.find((t) => t.id === editId),
      o,
    );
  else S.tx.push({ id: uid(), ...o });
  editId = null;
  save();
  render();
}
function edit(id) {
  editId = id;
  render();
  scrollTo(0, 0);
}
function del(id, b) {
  if (b.dataset.s !== "1") {
    b.dataset.s = "1";
    b.textContent = "Yakin?";
    setTimeout(() => {
      b.dataset.s = "";
      b.textContent = "Hapus";
    }, 3000);
    return;
  }
  S.tx = S.tx.filter((t) => t.id !== id);
  save();
  render();
}
function toast(m) {
  let t = $("#toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    document.body.appendChild(t);
  }
  t.textContent = m;
  t.className = "toast on";
  clearTimeout(toast.h);
  toast.h = setTimeout(() => {
    t.className = "toast";
  }, 4000);
}
function vStat() {
  const e = ex(),
    td = new Date(),
    m1 = mon(iso(td)),
    m0 = mon(iso(new Date(td.getFullYear(), td.getMonth() - 1, 1))),
    a = sum(e.filter((t) => mon(t.date) === m1)),
    b = sum(e.filter((t) => mon(t.date) === m0)),
    d = b ? ((a - b) / b) * 100 : 0;
  const tc = topOf(grp(e, (t) => t.cat))[0],
    tl = topOf(
      grp(
        e.filter((t) => t.loc),
        (t) => t.loc,
      ),
    )[0];
  return `<div class="tabs">${["hari", "minggu", "bulan"].map((p) => `<button class="btn ${per === p ? "on" : ""}" onclick="per='${p}';render()">Per ${p}</button>`).join("")}</div>
<div class="c" style="margin-bottom:14px">${bars(series(per))}</div>
<div class="grid"><div class="c"><div class="k">Kategori paling boros</div><div class="v">${tc ? (CAT[tc[0]] || CAT.Lainnya)[0] + " " + esc(tc[0]) : "-"}</div><div class="k">${tc ? R(tc[1]) : ""}</div></div>
<div class="c"><div class="k">Lokasi terbesar</div><div class="v">${tl ? "📍 " + esc(tl[0]) : "-"}</div><div class="k">${tl ? R(tl[1]) : ""}</div></div>
<div class="c"><div class="k">Bulan ini vs bulan lalu</div><div class="v ${d > 0 ? "out" : "inc"}">${b ? (d > 0 ? "▲ " : "▼ ") + Math.abs(d).toFixed(0) + "%" : "-"}</div><div class="k">${R(a)} dari ${R(b)}</div></div></div>`;
}
function vBud() {
  const used = sum(ex().filter((t) => mon(t.date) === mon(today()))),
    b = S.budget,
    p = Math.min((used / b) * 100, 100),
    col = used > b ? "var(--rd)" : p > 80 ? "#f59e0b" : "var(--gn)";
  return `<div class="c" style="max-width:520px"><label>Budget bulan ini (Rp)</label><div style="display:flex;gap:8px"><input id="bud" type="number" min="0" value="${b}"><button class="btn" onclick="S.budget=+$('#bud').value||0;save();render()">Simpan</button></div>
<div class="bar" style="height:16px;margin:20px 0 14px"><i style="width:${p}%;background:${col}"></i></div>
<div style="display:flex;justify-content:space-between"><div><div class="k">Terpakai</div><div class="v">${R(used)}</div></div><div style="text-align:right"><div class="k">Sisa</div><div class="v" style="color:${col}">${R(b - used)}</div></div></div>
<p class="k">${used > b ? "Budget terlampaui. Kurangi pengeluaran atau naikkan batas." : p > 80 ? "Hampir habis: sudah lebih dari 80% terpakai." : "Pengeluaran masih aman."}</p></div>`;
}
function exportCsv() {
  const q = (v) => '"' + String(v).replace(/"/g, '""') + '"';
  $("#exp").value = ["tanggal,nama,jenis,kategori,nominal,lokasi,catatan"]
    .concat(
      S.tx.map((t) =>
        [
          t.date,
          q(t.name),
          t.type === "in" ? "masuk" : "keluar",
          t.cat,
          t.amt,
          q(t.loc),
          q(t.note),
        ].join(","),
      ),
    )
    .join("\n");
  $("#dlg").showModal();
}
function cp() {
  const e = $("#exp");
  e.select();
  try {
    navigator.clipboard.writeText(e.value);
  } catch (x) {
    document.execCommand("copy");
  }
}
function vGoal() {
  const G = S.goals,
    ts = G.reduce((a, g) => a + g.saved, 0),
    tt = G.reduce((a, g) => a + g.target, 0);
  const form = `<div class="c" style="margin-bottom:16px"><h3>Buat target baru</h3><div class="f"><div><label>Nama target</label><input id="g_name" placeholder="mis. Laptop baru"></div><div><label>Nominal target (Rp)</label><input id="g_t" type="number" min="0"></div><div><label>Sudah terkumpul (Rp)</label><input id="g_s" type="number" min="0" placeholder="0"></div><div><label>Tenggat (opsional)</label><input id="g_d" type="date"></div></div><button class="btn" onclick="addGoal()">Tambah target</button></div>`;
  const cards =
    G.map((g) => {
      const p = Math.min((g.saved / g.target) * 100, 100),
        left = Math.max(g.target - g.saved, 0),
        done = g.saved >= g.target;
      let hint = "";
      if (!done && g.deadline) {
        const d = Math.ceil(
          (new Date(g.deadline + "T00:00") - new Date()) / 864e5,
        );
        hint =
          d <= 0
            ? "Tenggat sudah lewat"
            : `${d} hari lagi · sisihkan ${R(left / Math.max(Math.ceil(d / 30), 1))}/bulan`;
      }
      return `<div class="c"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><div><b style="font-size:16px">${esc(g.name)}</b>${done ? ' <span class="pill">🎉 Tercapai</span>' : ""}<div class="k">${hint}</div></div><button class="btn g s" onclick="delGoal('${g.id}',this)">Hapus</button></div><div class="v" style="margin:12px 0 2px">${R(g.saved)}</div><div class="k">dari ${R(g.target)} · ${p.toFixed(0)}%${done ? "" : " · kurang " + R(left)}</div><div class="bar" style="height:12px;margin:10px 0 14px"><i style="width:${p}%;background:${done ? "var(--gn)" : "linear-gradient(90deg,#2563eb,#22b8e8)"}"></i></div><div style="display:flex;gap:8px"><input id="amt_${g.id}" type="number" min="0" placeholder="Nominal (Rp)"><button class="btn s" onclick="moveGoal('${g.id}',1)">Setor</button><button class="btn g s" onclick="moveGoal('${g.id}',-1)">Tarik</button></div></div>`;
    }).join("") ||
    '<div class="c"><p class="k">Belum ada target. Buat target pertama di atas, misalnya dana darurat atau liburan.</p></div>';
  return `<div class="grid"><div class="c hero"><div class="k">Total tabungan</div><div class="v">${R(ts)}</div><div class="k">dari total target ${R(tt)}</div></div></div>${remCard()}${form}<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">${cards}</div>`;
}
function addGoal() {
  const g = (i) => $("#" + i).value,
    t = +g("g_t");
  if (!g("g_name").trim() || !(t > 0)) {
    toast("Isi nama target dan nominal lebih dari 0.");
    return;
  }
  S.goals.push({
    id: uid(),
    name: g("g_name").trim(),
    target: t,
    saved: Math.max(+g("g_s") || 0, 0),
    deadline: g("g_d"),
  });
  save();
  render();
  toast("Target ditambahkan.");
}
function moveGoal(id, dir) {
  const a = +$("#amt_" + id).value,
    g = S.goals.find((x) => x.id === id);
  if (!(a > 0)) {
    toast("Isi nominal lebih dari 0.");
    return;
  }
  if (dir < 0 && a > g.saved) {
    toast("Saldo target tidak cukup untuk ditarik.");
    return;
  }
  const was = g.saved >= g.target;
  g.saved += dir * a;
  save();
  render();
  toast(
    dir > 0
      ? !was && g.saved >= g.target
        ? "🎉 Selamat, target tercapai!"
        : "Setoran dicatat."
      : "Penarikan dicatat.",
  );
}
function delGoal(id, b) {
  if (b.dataset.s !== "1") {
    b.dataset.s = "1";
    b.textContent = "Yakin?";
    setTimeout(() => {
      b.dataset.s = "";
      b.textContent = "Hapus";
    }, 3000);
    return;
  }
  S.goals = S.goals.filter((g) => g.id !== id);
  save();
  render();
}
const DOW = [
  ["1", "Senin"],
  ["2", "Selasa"],
  ["3", "Rabu"],
  ["4", "Kamis"],
  ["5", "Jumat"],
  ["6", "Sabtu"],
  ["0", "Minggu"],
];
function remCard() {
  const r = S.rem,
    sel = (a, b) => (a == b ? "selected" : "");
  return `<div class="c" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px"><h3 style="margin:0">🔔 Pengingat menabung</h3><span class="pill">${r.on ? "Aktif" : "Nonaktif"}</span></div>
<div class="f"><div><label>Ulangi</label><select id="r_f" onchange="setRem()"><option value="daily" ${sel(r.freq, "daily")}>Setiap hari</option><option value="weekly" ${sel(r.freq, "weekly")}>Setiap minggu</option></select></div>
<div><label>Hari (jika mingguan)</label><select id="r_d" onchange="setRem()">${DOW.map((d) => `<option value="${d[0]}" ${sel(r.dow, d[0])}>${d[1]}</option>`).join("")}</select></div>
<div><label>Jam</label><input id="r_t" type="time" value="${r.time}" onchange="setRem()"></div></div>
<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" onclick="toggleRem()">${r.on ? "Matikan pengingat" : "Aktifkan notifikasi"}</button><button class="btn g" onclick="testRem()">Tes notifikasi</button></div>
<p class="k" style="margin:10px 0 0">Notifikasi muncul di perangkatmu selama halaman ExpenseMap terbuka di browser. Jika notifikasi sistem tidak didukung, pengingat tampil di dalam halaman.</p></div>`;
}
function setRem() {
  const r = S.rem;
  r.freq = $("#r_f").value;
  r.dow = $("#r_d").value;
  r.time = $("#r_t").value || "20:00";
  r.last = "";
  save();
}
async function askPerm() {
  try {
    if ("Notification" in window) {
      if (Notification.permission === "default")
        await Notification.requestPermission();
      return Notification.permission === "granted";
    }
  } catch (e) {}
  return false;
}
function notify(t, b) {
  let shown = false;
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(t, { body: b });
      shown = true;
    }
  } catch (e) {}
  if (!shown) toast(t + " " + b);
}
function remMsg() {
  const G = S.goals.filter((g) => g.saved < g.target);
  if (!G.length)
    return [
      "Pengingat menabung 🐷",
      "Buat target tabungan di menu Target agar pengingat lebih berguna.",
    ];
  const g = G.slice().sort((a, b) =>
      (a.deadline || "9") < (b.deadline || "9") ? -1 : 1,
    )[0],
    left = g.target - g.saved;
  let amt;
  if (g.deadline) {
    const d = Math.ceil((new Date(g.deadline + "T00:00") - new Date()) / 864e5);
    amt = left / Math.max(S.rem.freq === "daily" ? d : Math.ceil(d / 7), 1);
  } else amt = Math.min(left, Math.ceil(left / 10 / 1000) * 1000);
  return [
    "Waktunya menabung 🐷",
    `Sisihkan ${R(amt)} untuk "${g.name}" (kurang ${R(left)}).`,
  ];
}
async function toggleRem() {
  const r = S.rem;
  if (r.on) {
    r.on = false;
    save();
    render();
    toast("Pengingat dimatikan.");
    return;
  }
  const ok = await askPerm();
  r.on = true;
  r.last = "";
  save();
  render();
  toast(
    ok
      ? "Pengingat aktif. Notifikasi muncul selama halaman ini terbuka."
      : "Pengingat aktif, tetapi izin notifikasi belum diberikan, jadi pengingat tampil di dalam halaman. Izinkan notifikasi di pengaturan browser.",
  );
}
async function testRem() {
  await askPerm();
  const x = remMsg();
  notify(x[0], x[1]);
}
function tick() {
  const r = S.rem;
  if (!S.user || !r.on) return;
  const n = new Date(),
    d = iso(n),
    [h, m] = r.time.split(":").map(Number);
  if (r.freq === "weekly" && n.getDay() !== +r.dow) return;
  if (r.last === d) return;
  if (n.getHours() * 60 + n.getMinutes() >= h * 60 + m) {
    r.last = d;
    save();
    const x = remMsg();
    notify(x[0], x[1]);
  }
}
boot();
tick();
setInterval(tick, 30000);
