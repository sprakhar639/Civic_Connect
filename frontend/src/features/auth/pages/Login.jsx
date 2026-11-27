import { AlertCircle, ArrowLeft, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { USE_MOCKS } from "../../../config/env";
import { useAuth } from "../../../context/AuthContext";
import { DEMO_CREDENTIALS } from "../../../services/mock/seed";
import Button from "../../../shared/components/Button";
import { Input } from "../../../shared/components/FormField";
import Logo from "../../../shared/components/Logo";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters.";
  return errors;
}

export default function Login() {
  const { user, login, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from ?? "/admin/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  if (user) return <Navigate to={redirectTo} replace />;

  function update(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(error.status === 401 ? "Invalid email or password." : error.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative">
          <Logo tone="light" subtitle="Operations console" />
        </div>
        <div className="relative mt-auto max-w-md">
          <h2 className="text-3xl font-bold tracking-tight">Review what the cameras see, before crews roll out.</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Verify AI detections, manage camera sources and process recorded footage from a single console.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            {["Verify or reject every AI detection", "Track issues through to resolution", "Upload recorded footage for analysis"].map(
              (item) => (
                <li key={item} className="flex items-center gap-3">
                  <ShieldCheck className="size-4 text-blue-400" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>
      </aside>

      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link to="/" className="inline-flex items-center gap-1.5 self-start text-sm text-mute hover:text-ink">
          <ArrowLeft className="size-4" />
          Back to public portal
        </Link>

        <div className="mx-auto my-auto w-full max-w-sm py-12">
          <div className="lg:hidden">
            <Logo subtitle="Operations console" />
          </div>
          <h1 className="mt-8 text-2xl font-bold tracking-tight text-ink lg:mt-0">Sign in</h1>
          <p className="mt-1 text-sm text-mute">Administrator and operator access only.</p>

          {sessionExpired && !formError && (
            <div role="status" className="mt-6 flex gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
              <Lock className="mt-0.5 size-4 shrink-0" />
              Your session expired. Please sign in again.
            </div>
          )}

          {formError && (
            <div role="alert" className="mt-6 flex gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
            <Input
              id="email"
              type="email"
              label="Email"
              autoComplete="email"
              placeholder="you@city.gov.in"
              value={form.email}
              onChange={update("email")}
              error={errors.email}
              autoFocus
            />

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                autoComplete="current-password"
                value={form.password}
                onChange={update("password")}
                error={errors.password}
                inputClassName="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((show) => !show)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-[26px] right-1 rounded-md p-2 text-slate-400 hover:text-ink"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            <Button type="submit" size="lg" loading={submitting} className="mt-2 w-full">
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-mute">
            Accounts are created by your CivicConnect administrator. There is no public registration.
          </p>

          {USE_MOCKS && (
            <div className="mt-8 rounded-lg border border-dashed border-amber-300 bg-amber-50/60 p-3 text-xs text-amber-900">
              <p className="font-semibold">Demo mode credentials</p>
              <p className="mt-1 font-mono">
                {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
              </p>
              <button
                type="button"
                onClick={() => {
                  setForm(DEMO_CREDENTIALS);
                  setErrors({});
                }}
                className="mt-2 font-semibold text-amber-800 underline underline-offset-2"
              >
                Fill in demo credentials
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
