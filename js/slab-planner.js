/* Apex Resilient Flooring — concrete slab moisture test planner.
   Everything runs in the browser; nothing entered here is sent anywhere.
   Rules follow ASTM F2170 (in-situ RH probes) as commonly applied; the
   page itself explains each one and tells users which documents govern. */
(function () {
  "use strict";

  var KEY = "apex-slab-planner-v1";
  var $ = function (id) { return document.getElementById(id); };
  var form = $("plan-form");
  if (!form) return;

  // localStorage can be missing or throw (private mode, blocked site data) —
  // the planner must still work, it just won't remember anything.
  var store = {
    get: function () { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } },
    set: function (v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} },
    clear: function () { try { localStorage.removeItem(KEY); } catch (e) {} }
  };

  var FIELDS = ["p-area", "p-area-unit", "p-thick", "p-thick-unit", "p-walls", "p-cond",
                "r-project", "r-area", "r-limit", "r-flat", "r-amb-t", "r-amb-rh"];
  var state = store.get();
  state.rows = Array.isArray(state.rows) ? state.rows : [];
  state.checks = state.checks || {};

  function radio(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked') ||
             document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }
  function num(id) {
    var v = parseFloat($(id).value);
    return isFinite(v) ? v : NaN;
  }
  function fmt(n, dp) {
    return n.toLocaleString("en-CA", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }

  // Three locations for the first 1,000 sq ft (100 m²), one more for each
  // additional 1,000 (100 m²). Partial blocks round up — testing more is
  // always allowed, testing less is not.
  function testCount(area, unit) {
    if (!(area > 0)) return null;
    var block = unit === "m2" ? 100 : 1000;
    var extra = area > block ? Math.ceil((area - block) / block) : 0;
    return { n: 3 + extra, extra: extra, block: block };
  }

  // Probe depth: 40% of thickness for a slab drying from the top only,
  // 20% for one drying from both faces.
  function probeDepth(t, unit, dry) {
    if (!(t > 0)) return null;
    var frac = dry === "two" ? 0.2 : 0.4;
    var inches = unit === "mm" ? (t * frac) / 25.4 : t * frac;
    return { pct: frac * 100, inches: inches, mm: inches * 25.4 };
  }

  function parseLocalDate(v) {
    // "YYYY-MM-DD" parsed as local midnight; new Date(v) would be UTC and can
    // land on the previous day in Toronto.
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function day(d) {
    return d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
  }

  var plan = { count: null, depth: null, walls: 0, onGrade: true };

  function compute() {
    var area = num("p-area"), aUnit = $("p-area-unit").value;
    var thick = num("p-thick"), tUnit = $("p-thick-unit").value;
    var dry = radio("p-dry") || "one";
    var onGrade = (radio("p-grade") || "yes") === "yes";
    var walls = Math.max(0, Math.floor(num("p-walls") || 0));

    $("walls-field").hidden = !onGrade;

    var c = testCount(area, aUnit);
    var d = probeDepth(thick, tUnit, dry);
    plan = { count: c, depth: d, walls: onGrade ? walls : 0, onGrade: onGrade };

    // Test count
    if (c) {
      var blockLbl = aUnit === "m2" ? "100 m²" : "1,000 sq ft";
      $("o-count").textContent = c.n;
      $("o-count-detail").textContent = c.extra
        ? "3 for the first " + blockLbl + ", plus " + c.extra + " for the remaining " +
          fmt(area - c.block, 0) + (aUnit === "m2" ? " m²" : " sq ft") + " (rounded up)."
        : "3 locations cover the first " + blockLbl + ".";
    } else {
      $("o-count").textContent = "—";
      $("o-count-detail").textContent = "Enter the floor area to calculate.";
    }

    // Perimeter placement (slabs on or below grade)
    var wallsOut;
    if (!onGrade) {
      wallsOut = "Rule applies to slabs on or below grade";
    } else if (!walls) {
      wallsOut = "Enter the number of exterior walls";
    } else {
      wallsOut = "1 within 3 ft (0.9 m) of each of " + walls + (walls === 1 ? " wall" : " walls");
      if (c && walls > c.n) wallsOut += " — plan " + walls + " locations";
    }
    $("o-walls").textContent = wallsOut;

    // Slabs are almost always 3-12 in (75-300 mm). Anything far outside that is
    // usually a unit mix-up, so say so rather than silently converting the value.
    var hint = $("p-thick-hint"), tIn = tUnit === "mm" ? thick / 25.4 : thick;
    if (thick > 0 && (tIn > 24 || tIn < 1.5)) {
      hint.textContent = "That's an unusual slab thickness for " + (tUnit === "mm" ? "millimetres" : "inches") + " — check the unit.";
      hint.hidden = false;
    } else { hint.hidden = true; }

    // Depth
    $("o-depth").textContent = d
      ? fmt(d.inches, 2) + " in (" + fmt(d.mm, 0) + " mm) — " + d.pct + "% of thickness"
      : "Enter the slab thickness";

    // Timeline: 48 h at service conditions before drilling, 24 h equilibration after
    var cond = parseLocalDate($("p-cond").value);
    if (cond) {
      $("o-install").textContent = day(addDays(cond, 2));
      $("o-read").textContent = day(addDays(cond, 3)) + " at the earliest";
    } else {
      $("o-install").textContent = "48 h after service conditions";
      $("o-read").textContent = "24 h after probes go in";
    }

    syncRows();
    save();
  }

  /* ---------- Acceptance record ---------- */

  function plannedRows() {
    var n = plan.count ? plan.count.n : 3;
    return Math.max(n, plan.walls || 0);
  }
  function blankRow() { return { loc: "", wall: false, depth: "", rh: "", temp: "", date: "" }; }
  function isBlank(r) { return !r.loc && !r.wall && !r.rh && !r.temp && !r.date && !r.depthEdited; }

  // Grow to the planned count; shrink only by dropping trailing empty rows,
  // so a plan change never throws away readings someone already typed.
  function syncRows() {
    var want = plannedRows();
    while (state.rows.length < want) state.rows.push(blankRow());
    while (state.rows.length > want && isBlank(state.rows[state.rows.length - 1]) && !state.rows[state.rows.length - 1].manual) {
      state.rows.pop();
    }
    renderRows();
  }

  function cellInput(type, i, key, value, label, extra) {
    return '<input type="' + type + '" data-i="' + i + '" data-k="' + key + '" value="' +
      String(value == null ? "" : value).replace(/"/g, "&quot;") + '" aria-label="' + label + " " + (i + 1) + '"' +
      (extra || "") + ">";
  }

  function renderRows() {
    var tbody = $("r-rows");
    var depthDefault = plan.depth ? fmt(plan.depth.inches, 2) + " in" : "";
    var html = "";
    state.rows.forEach(function (r, i) {
      var depth = r.depthEdited ? r.depth : depthDefault;
      html += '<tr data-row="' + i + '">' +
        '<td class="num-cell">' + (i + 1) + "</td>" +
        "<td>" + cellInput("text", i, "loc", r.loc, "Location", ' placeholder="e.g. NE corner, grid C-4"') + "</td>" +
        '<td class="chk-cell"><input type="checkbox" data-i="' + i + '" data-k="wall"' + (r.wall ? " checked" : "") +
          ' aria-label="Within 3 ft of an exterior wall, location ' + (i + 1) + '"></td>' +
        "<td>" + cellInput("text", i, "depth", depth, "Probe depth", ' class="w-depth"') + "</td>" +
        "<td>" + cellInput("number", i, "rh", r.rh, "Relative humidity percent", ' min="0" max="100" step="0.1" inputmode="decimal" class="w-num"') +
          '<span class="over-flag" hidden>Above entered limit</span></td>' +
        "<td>" + cellInput("number", i, "temp", r.temp, "Slab temperature", ' step="0.1" inputmode="decimal" class="w-num"') + "</td>" +
        "<td>" + cellInput("date", i, "date", r.date, "Date read") + "</td>" +
        "</tr>";
    });
    tbody.innerHTML = html;
    summarise();
  }

  function summarise() {
    var limit = num("r-limit");
    var read = 0, over = 0, max = -Infinity;
    state.rows.forEach(function (r, i) {
      var tr = $("r-rows").querySelector('tr[data-row="' + i + '"]');
      var v = parseFloat(r.rh);
      var isOver = false;
      if (isFinite(v)) {
        read++; if (v > max) max = v;
        if (isFinite(limit) && v > limit) { over++; isOver = true; }
      }
      if (tr) {
        tr.classList.toggle("over", isOver);
        tr.querySelector(".over-flag").hidden = !isOver;
      }
    });
    // Counts only — deliberately no pass/fail verdict. Acceptance is the
    // manufacturer's and the specifier's call, not a web page's.
    var parts = [read + " of " + state.rows.length + " locations read"];
    if (read && isFinite(limit)) parts.push(over + (over === 1 ? " reading" : " readings") + " above the entered " + fmt(limit, limit % 1 ? 1 : 0) + "% limit");
    else if (read) parts.push("enter the manufacturer limit to compare");
    if (read) parts.push("highest " + fmt(max, max % 1 ? 1 : 0) + "% RH");
    $("r-summary").textContent = parts.join(" · ");
  }

  /* ---------- Persistence ---------- */

  function save() {
    FIELDS.forEach(function (id) { var el = $(id); if (el) state[id] = el.value; });
    state["p-dry"] = radio("p-dry");
    state["p-grade"] = radio("p-grade");
    store.set(state);
  }

  function restore() {
    FIELDS.forEach(function (id) {
      var el = $(id);
      if (el && state[id] != null && state[id] !== "") el.value = state[id];
    });
    ["p-dry", "p-grade"].forEach(function (name) {
      if (!state[name]) return;
      var el = document.querySelector('input[name="' + name + '"][value="' + state[name] + '"]');
      if (el) el.checked = true;
    });
    document.querySelectorAll("[data-check]").forEach(function (cb) {
      cb.checked = !!state.checks[cb.getAttribute("data-check")];
    });
  }

  /* ---------- Events ---------- */

  form.addEventListener("input", compute);
  form.addEventListener("change", compute);

  ["r-project", "r-area", "r-flat", "r-amb-t", "r-amb-rh"].forEach(function (id) {
    $(id).addEventListener("input", save);
  });
  $("r-limit").addEventListener("input", function () { summarise(); save(); });

  $("r-rows").addEventListener("input", function (e) {
    var t = e.target, i = +t.getAttribute("data-i"), k = t.getAttribute("data-k");
    if (!state.rows[i] || !k) return;
    if (k === "wall") state.rows[i].wall = t.checked;
    else state.rows[i][k] = t.value;
    if (k === "depth") state.rows[i].depthEdited = true;
    if (k === "rh") summarise();
    save();
  });
  $("r-rows").addEventListener("change", function (e) {
    if (e.target.type === "checkbox") {
      var i = +e.target.getAttribute("data-i");
      if (state.rows[i]) { state.rows[i].wall = e.target.checked; save(); }
    }
  });

  document.querySelectorAll("[data-check]").forEach(function (cb) {
    cb.addEventListener("change", function () { state.checks[cb.getAttribute("data-check")] = cb.checked; save(); });
  });

  $("r-add").addEventListener("click", function () {
    var r = blankRow(); r.manual = true;
    state.rows.push(r); renderRows(); save();
    var inputs = $("r-rows").querySelectorAll('input[data-k="loc"]');
    if (inputs.length) inputs[inputs.length - 1].focus();
  });

  $("r-print").addEventListener("click", function () { window.print(); });

  $("r-clear").addEventListener("click", function () {
    if (!window.confirm("Clear the plan and every reading on this record? This can't be undone.")) return;
    store.clear();
    state = { rows: [], checks: {} };
    form.reset();
    ["r-project", "r-area", "r-limit", "r-amb-t", "r-amb-rh"].forEach(function (id) { $(id).value = ""; });
    $("r-flat").value = $("r-flat").defaultValue;
    document.querySelectorAll("[data-check]").forEach(function (cb) { cb.checked = false; });
    compute();
    $("p-area").focus();
  });

  restore();
  compute();
})();
