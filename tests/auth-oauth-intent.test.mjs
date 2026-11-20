import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("Google OAuth routing intent is explicit and customer sign-in stays public", () => {
  const api = readFileSync("src/lib/api.ts", "utf8");
  const app = readFileSync("src/App.tsx", "utf8");
  const hub = readFileSync("src/PlatformHub.tsx", "utf8");

  assert.ok(
    api.includes(String.raw`oauthError.replace(/\+/g, ' ')`),
    "OAuth provider error messages should decode plus separators into spaces."
  );
  assert.ok(
    api.includes("if (options?.intent === 'admin') sessionStorage.setItem('eduken_admin_oauth', '1')"),
    "Only an explicitly requested admin OAuth flow may set the admin routing marker."
  );
  assert.ok(
    api.includes("options?.intent === 'admin' ? '/?eduken_admin=1' : '/'"),
    "Only admin OAuth should carry the admin routing marker through the provider redirect."
  );
  assert.ok(
    app.includes("params.get('eduken_admin') === '1'"),
    "The OAuth callback must recognize the explicit admin return marker."
  );
  assert.ok(
    api.includes("else sessionStorage.removeItem('eduken_admin_oauth')"),
    "Customer/default OAuth must clear any stale admin routing marker."
  );
  assert.ok(
    app.includes("await auth.signIn({ intent: 'admin' })"),
    "Private admin sign-in controls must explicitly request admin intent."
  );
  assert.ok(
    hub.includes("await auth.signIn({ scope: 'openid email profile offline_access' })") &&
    hub.includes("void auth.signIn();"),
    "Customer Google sign-in call sites must remain customer/default intent."
  );
});
