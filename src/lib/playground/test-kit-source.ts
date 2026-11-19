/**
 * Source of the in-preview test kit, injected as a hidden file into every coding ground.
 * It runs INSIDE the Sandpack preview iframe (any framework), registers tests via
 * describe/it, executes them after the app has loaded and posts results to the parent.
 *
 * Written as plain ES2018 JavaScript without template literals so it can live in a string.
 * Exposed API (import from "<rel>/assay/test-kit"):
 *   describe, it, test, expect, fn, waitFor, sleep, flush, screen, within, user
 */
export const TEST_KIT_SOURCE = String.raw`
var registry = [];
var prefix = [];

export function describe(name, body) {
  prefix.push(name);
  try { body(); } finally { prefix.pop(); }
}

export function it(name, body) {
  // Hot reloads re-evaluate the tests module while this kit stays loaded: replace, don't duplicate.
  var full = prefix.concat([name]).join(" › ");
  for (var i = 0; i < registry.length; i++) {
    if (registry[i].name === full) {
      registry[i] = { name: full, body: body };
      return;
    }
  }
  registry.push({ name: full, body: body });
}
export var test = it;

function fmt(value) {
  try {
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "function") return "[Function " + (value.name || "anonymous") + "]";
    if (value instanceof Element) return "<" + value.tagName.toLowerCase() + ">";
    var seen = [];
    var out = JSON.stringify(value, function (k, v) {
      if (v && typeof v === "object") { if (seen.indexOf(v) >= 0) return "[Circular]"; seen.push(v); }
      if (v === undefined) return "undefined";
      if (typeof v === "bigint") return String(v) + "n";
      return v;
    });
    return out === undefined ? String(value) : out;
  } catch (e) { return String(value); }
}

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    var okMap = true;
    a.forEach(function (v, k) { if (!b.has(k) || !deepEqual(v, b.get(k))) okMap = false; });
    return okMap;
  }
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    var okSet = true;
    a.forEach(function (v) { if (!b.has(v)) okSet = false; });
    return okSet;
  }
  var ka = Object.keys(a).filter(function (k) { return a[k] !== undefined; });
  var kb = Object.keys(b).filter(function (k) { return b[k] !== undefined; });
  if (ka.length !== kb.length) return false;
  for (var i = 0; i < ka.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(b, ka[i]) || !deepEqual(a[ka[i]], b[ka[i]])) return false;
  }
  return true;
}

function AssertionError(message) { var e = new Error(message); e.name = "AssertionError"; return e; }

function makeMatchers(actual, negate) {
  function check(pass, message, negMessage) {
    if (negate ? pass : !pass) throw AssertionError(negate ? negMessage : message);
  }
  var m = {
    toBe: function (expected) {
      check(Object.is(actual, expected), "Expected " + fmt(actual) + " to be " + fmt(expected), "Expected " + fmt(actual) + " not to be " + fmt(expected));
    },
    toEqual: function (expected) {
      check(deepEqual(actual, expected), "Expected " + fmt(actual) + " to equal " + fmt(expected), "Expected " + fmt(actual) + " not to equal " + fmt(expected));
    },
    toBeTruthy: function () { check(!!actual, "Expected " + fmt(actual) + " to be truthy", "Expected " + fmt(actual) + " to be falsy"); },
    toBeFalsy: function () { check(!actual, "Expected " + fmt(actual) + " to be falsy", "Expected " + fmt(actual) + " to be truthy"); },
    toBeNull: function () { check(actual === null, "Expected " + fmt(actual) + " to be null", "Expected value not to be null"); },
    toBeUndefined: function () { check(actual === undefined, "Expected " + fmt(actual) + " to be undefined", "Expected value not to be undefined"); },
    toBeDefined: function () { check(actual !== undefined, "Expected value to be defined", "Expected " + fmt(actual) + " to be undefined"); },
    toBeNaN: function () { check(Number.isNaN(actual), "Expected " + fmt(actual) + " to be NaN", "Expected value not to be NaN"); },
    toContain: function (item) {
      var has = actual != null && typeof actual.indexOf === "function" && actual.indexOf(item) >= 0;
      if (!has && actual instanceof Set) has = actual.has(item);
      check(has, "Expected " + fmt(actual) + " to contain " + fmt(item), "Expected " + fmt(actual) + " not to contain " + fmt(item));
    },
    toContainEqual: function (item) {
      var has = Array.isArray(actual) && actual.some(function (x) { return deepEqual(x, item); });
      check(has, "Expected " + fmt(actual) + " to contain an item equal to " + fmt(item), "Expected " + fmt(actual) + " not to contain " + fmt(item));
    },
    toHaveLength: function (n) {
      var len = actual == null ? undefined : actual.length;
      check(len === n, "Expected length " + n + " but got " + fmt(len), "Expected length not to be " + n);
    },
    toBeGreaterThan: function (n) { check(actual > n, "Expected " + fmt(actual) + " > " + n, "Expected " + fmt(actual) + " <= " + n); },
    toBeGreaterThanOrEqual: function (n) { check(actual >= n, "Expected " + fmt(actual) + " >= " + n, "Expected " + fmt(actual) + " < " + n); },
    toBeLessThan: function (n) { check(actual < n, "Expected " + fmt(actual) + " < " + n, "Expected " + fmt(actual) + " >= " + n); },
    toBeLessThanOrEqual: function (n) { check(actual <= n, "Expected " + fmt(actual) + " <= " + n, "Expected " + fmt(actual) + " > " + n); },
    toBeCloseTo: function (n, digits) {
      var d = digits === undefined ? 2 : digits;
      check(Math.abs(actual - n) < Math.pow(10, -d) / 2, "Expected " + fmt(actual) + " to be close to " + n, "Expected " + fmt(actual) + " not to be close to " + n);
    },
    toMatch: function (re) {
      var ok = typeof actual === "string" && (re instanceof RegExp ? re.test(actual) : actual.indexOf(re) >= 0);
      check(ok, "Expected " + fmt(actual) + " to match " + String(re), "Expected " + fmt(actual) + " not to match " + String(re));
    },
    toBeInstanceOf: function (C) { check(actual instanceof C, "Expected value to be an instance of " + (C && C.name), "Expected value not to be an instance of " + (C && C.name)); },
    toThrow: function (expected) {
      var threw = false, error;
      try { actual(); } catch (e) { threw = true; error = e; }
      var msg = error && error.message !== undefined ? error.message : String(error);
      var matches = threw && (expected === undefined ||
        (expected instanceof RegExp ? expected.test(msg) : typeof expected === "function" ? error instanceof expected : msg.indexOf(String(expected)) >= 0));
      check(matches, threw ? "Expected error matching " + String(expected) + " but got " + fmt(msg) : "Expected function to throw", "Expected function not to throw but it threw " + fmt(msg));
    },
    toHaveBeenCalled: function () {
      check(actual && actual.mock && actual.mock.calls.length > 0, "Expected mock to have been called", "Expected mock not to have been called");
    },
    toHaveBeenCalledTimes: function (n) {
      var c = actual && actual.mock ? actual.mock.calls.length : -1;
      check(c === n, "Expected mock to be called " + n + " times but it was called " + c + " times", "Expected mock not to be called " + n + " times");
    },
    toHaveBeenCalledWith: function () {
      var args = Array.prototype.slice.call(arguments);
      var ok = actual && actual.mock && actual.mock.calls.some(function (c) { return deepEqual(c, args); });
      check(ok, "Expected mock to have been called with " + fmt(args), "Expected mock not to have been called with " + fmt(args));
    },
    toHaveTextContent: function (text) {
      var content = actual && actual.textContent ? actual.textContent.replace(/\s+/g, " ").trim() : "";
      var ok = text instanceof RegExp ? text.test(content) : content.indexOf(text) >= 0;
      check(ok, "Expected element text " + fmt(content) + " to contain " + String(text), "Expected element text not to contain " + String(text));
    },
    toBeInTheDocument: function () {
      var ok = !!actual && actual.ownerDocument && actual.ownerDocument.contains(actual);
      check(ok, "Expected element to be in the document", "Expected element not to be in the document");
    },
    toHaveAttribute: function (name, value) {
      var ok = !!actual && actual.hasAttribute(name) && (value === undefined || actual.getAttribute(name) === String(value));
      check(ok, "Expected element to have attribute " + name + (value === undefined ? "" : "=" + fmt(value)), "Expected element not to have attribute " + name);
    },
    toHaveClass: function (cls) {
      var ok = !!actual && actual.classList && actual.classList.contains(cls);
      check(ok, "Expected element to have class " + fmt(cls), "Expected element not to have class " + fmt(cls));
    },
    toBeDisabled: function () {
      var ok = !!actual && (actual.disabled === true || actual.getAttribute("aria-disabled") === "true");
      check(ok, "Expected element to be disabled", "Expected element to be enabled");
    },
    toHaveValue: function (v) {
      var val = actual ? actual.value : undefined;
      check(String(val) === String(v), "Expected value " + fmt(v) + " but got " + fmt(val), "Expected value not to be " + fmt(v));
    }
  };
  return m;
}

export function expect(actual) {
  var m = makeMatchers(actual, false);
  m.not = makeMatchers(actual, true);
  m.resolves = {
    toBe: function (e) { return Promise.resolve(actual).then(function (v) { makeMatchers(v, false).toBe(e); }); },
    toEqual: function (e) { return Promise.resolve(actual).then(function (v) { makeMatchers(v, false).toEqual(e); }); }
  };
  m.rejects = {
    toThrow: function (e) {
      return Promise.resolve(actual).then(
        function () { throw AssertionError("Expected promise to reject"); },
        function (err) { makeMatchers(function () { throw err; }, false).toThrow(e); }
      );
    }
  };
  return m;
}

export function fn(impl) {
  var mock = function () {
    var args = Array.prototype.slice.call(arguments);
    mock.mock.calls.push(args);
    var r = impl ? impl.apply(this, args) : undefined;
    mock.mock.results.push(r);
    return r;
  };
  mock.mock = { calls: [], results: [] };
  return mock;
}

export function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

export function flush() {
  return new Promise(function (resolve) {
    Promise.resolve().then(function () {
      // Timers, not requestAnimationFrame: rAF never fires in hidden/background tabs.
      setTimeout(resolve, 16);
    });
  });
}

export function waitFor(callback, options) {
  var timeout = (options && options.timeout) || 2500;
  var interval = (options && options.interval) || 30;
  var start = Date.now();
  return new Promise(function (resolve, reject) {
    (function attempt() {
      Promise.resolve().then(callback).then(resolve, function (err) {
        if (Date.now() - start > timeout) reject(err);
        else setTimeout(attempt, interval);
      });
    })();
  });
}

var IMPLICIT_ROLES = {
  button: "button,input[type=button],input[type=submit],input[type=reset],summary",
  link: "a[href]",
  heading: "h1,h2,h3,h4,h5,h6",
  textbox: "input:not([type]),input[type=text],input[type=email],input[type=search],input[type=tel],input[type=url],input[type=password],textarea",
  checkbox: "input[type=checkbox]",
  radio: "input[type=radio]",
  combobox: "select",
  option: "option",
  list: "ul,ol",
  listitem: "li",
  img: "img[alt]",
  spinbutton: "input[type=number]",
  slider: "input[type=range]",
  table: "table",
  row: "tr",
  cell: "td",
  navigation: "nav",
  main: "main",
  form: "form",
  dialog: "dialog"
};

function textOf(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }

function accessibleName(el) {
  var label = el.getAttribute("aria-label");
  if (label) return label.trim();
  var by = el.getAttribute("aria-labelledby");
  if (by) {
    return by.split(/\s+/).map(function (id) { var n = document.getElementById(id); return n ? textOf(n) : ""; }).join(" ").trim();
  }
  if (el.id) {
    var lab = document.querySelector("label[for='" + el.id + "']");
    if (lab) return textOf(lab);
  }
  var wrap = el.closest && el.closest("label");
  if (wrap) return textOf(wrap);
  if (el.tagName === "IMG") return el.getAttribute("alt") || "";
  if (el.tagName === "INPUT" && (el.type === "submit" || el.type === "button")) return el.value || "";
  var t = textOf(el);
  if (t) return t;
  return el.getAttribute("title") || el.getAttribute("placeholder") || "";
}

function matchText(actual, expected, exact) {
  if (expected instanceof RegExp) return expected.test(actual);
  if (exact === false) return actual.toLowerCase().indexOf(String(expected).toLowerCase()) >= 0;
  return actual === String(expected);
}

function visible(el) {
  if (el.closest("[hidden]") || el.closest("[aria-hidden=true]")) return false;
  var style = window.getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden";
}

function queries(root) {
  function allByRole(role, opts) {
    var sel = "[role='" + role + "']" + (IMPLICIT_ROLES[role] ? "," + IMPLICIT_ROLES[role] : "");
    var nodes = Array.prototype.slice.call(root.querySelectorAll(sel)).filter(function (el) {
      var explicit = el.getAttribute("role");
      return (!explicit || explicit === role) && (opts && opts.hidden ? true : visible(el));
    });
    if (opts && opts.level) nodes = nodes.filter(function (el) { return el.tagName === "H" + opts.level || el.getAttribute("aria-level") === String(opts.level); });
    if (opts && opts.name !== undefined) nodes = nodes.filter(function (el) { return matchText(accessibleName(el), opts.name, opts.exact); });
    return nodes;
  }
  function allByText(text, opts) {
    var selector = (opts && opts.selector) || "*";
    return Array.prototype.slice.call(root.querySelectorAll(selector)).filter(function (el) {
      if (el.tagName === "SCRIPT" || el.tagName === "STYLE") return false;
      var own = Array.prototype.some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
      return own && matchText(textOf(el), text, opts && opts.exact);
    });
  }
  function allByLabelText(text, opts) {
    var controls = Array.prototype.slice.call(root.querySelectorAll("input,select,textarea,[role=textbox],[role=combobox],[role=checkbox],[role=switch]"));
    return controls.filter(function (el) { return matchText(accessibleName(el), text, opts && opts.exact); });
  }
  function allByTestId(id) { return Array.prototype.slice.call(root.querySelectorAll("[data-testid='" + id + "']")); }
  function allByPlaceholderText(text, opts) {
    return Array.prototype.slice.call(root.querySelectorAll("[placeholder]")).filter(function (el) { return matchText(el.getAttribute("placeholder"), text, opts && opts.exact); });
  }

  function variants(name, all, describeQuery) {
    var api = {};
    api["queryAllBy" + name] = all;
    api["queryBy" + name] = function (a, b) {
      var r = all(a, b);
      if (r.length > 1) throw AssertionError("Found multiple elements " + describeQuery(a, b));
      return r[0] || null;
    };
    api["getAllBy" + name] = function (a, b) {
      var r = all(a, b);
      if (!r.length) throw AssertionError("Unable to find any element " + describeQuery(a, b));
      return r;
    };
    api["getBy" + name] = function (a, b) {
      var r = all(a, b);
      if (!r.length) throw AssertionError("Unable to find an element " + describeQuery(a, b));
      if (r.length > 1) throw AssertionError("Found " + r.length + " elements " + describeQuery(a, b) + "; use getAllBy" + name);
      return r[0];
    };
    api["findBy" + name] = function (a, b, o) { return waitFor(function () { return api["getBy" + name](a, b); }, o); };
    api["findAllBy" + name] = function (a, b, o) { return waitFor(function () { return api["getAllBy" + name](a, b); }, o); };
    return api;
  }

  return Object.assign(
    {},
    variants("Role", allByRole, function (r, o) { return "with role " + fmt(r) + (o && o.name !== undefined ? " and name " + String(o.name) : ""); }),
    variants("Text", allByText, function (t) { return "with text " + String(t); }),
    variants("LabelText", allByLabelText, function (t) { return "with label " + String(t); }),
    variants("TestId", allByTestId, function (t) { return "with data-testid " + fmt(t); }),
    variants("PlaceholderText", allByPlaceholderText, function (t) { return "with placeholder " + String(t); })
  );
}

export var screen = queries(document);
export function within(el) { return queries(el); }

function setNativeValue(el, value) {
  var proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : el.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  var setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  setter.call(el, value);
}

export var user = {
  click: function (el) {
    el.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    if (el.focus) el.focus();
    el.dispatchEvent(new MouseEvent("pointerup", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    el.click();
    return flush();
  },
  type: function (el, text) {
    if (el.focus) el.focus();
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      el.dispatchEvent(new KeyboardEvent("keydown", { key: ch, bubbles: true }));
      setNativeValue(el, (el.value || "") + ch);
      el.dispatchEvent(new InputEvent("input", { bubbles: true, data: ch, inputType: "insertText" }));
      el.dispatchEvent(new KeyboardEvent("keyup", { key: ch, bubbles: true }));
    }
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return flush();
  },
  clear: function (el) {
    setNativeValue(el, "");
    el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward" }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return flush();
  },
  selectOption: function (el, value) {
    setNativeValue(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return flush();
  },
  keyboard: function (el, key) {
    el.dispatchEvent(new KeyboardEvent("keydown", { key: key, bubbles: true }));
    el.dispatchEvent(new KeyboardEvent("keyup", { key: key, bubbles: true }));
    return flush();
  }
};

function post(message) {
  try { window.parent.postMessage(Object.assign({ source: "assay-tests" }, message), "*"); } catch (e) { /* ignore */ }
}

var running = false;
export function run() {
  if (running) return Promise.resolve();
  running = true;
  var started = Date.now();
  var results = [];
  post({ type: "started", total: registry.length });
  return registry.reduce(function (chain, t) {
    return chain.then(function () {
      var t0 = Date.now();
      var timer;
      var timeout = new Promise(function (_, reject) { timer = setTimeout(function () { reject(new Error("Test timed out after 5s")); }, 5000); });
      return Promise.race([Promise.resolve().then(t.body), timeout]).then(
        function () { clearTimeout(timer); results.push({ name: t.name, status: "pass", ms: Date.now() - t0 }); },
        function (err) {
          clearTimeout(timer);
          results.push({ name: t.name, status: "fail", ms: Date.now() - t0, error: String((err && err.message) || err).slice(0, 600) });
        }
      );
    });
  }, Promise.resolve()).then(function () {
    var passed = results.filter(function (r) { return r.status === "pass"; }).length;
    post({ type: "results", total: results.length, passed: passed, ms: Date.now() - started, tests: results });
    running = false;
  });
}

window.addEventListener("error", function (e) {
  post({ type: "runtime-error", message: String((e && e.message) || "Runtime error").slice(0, 600) });
});
window.addEventListener("unhandledrejection", function (e) {
  var r = e && e.reason;
  post({ type: "runtime-error", message: String((r && r.message) || r || "Unhandled rejection").slice(0, 600) });
});
`;

/** Runner bootstrap: imports the task's tests, then runs them once the app had time to mount. */
export function buildRunSource(testsImport: string) {
  return [
    'import { run } from "./test-kit";',
    `import "${testsImport}";`,
    "",
    "function start() {",
    "  setTimeout(run, 80);",
    "}",
    'if (document.readyState === "complete") start();',
    'else window.addEventListener("load", start);',
    "",
  ].join("\n");
}
