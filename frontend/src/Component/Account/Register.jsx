import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!form.agreeTerms) {
      setError("Please agree to the Terms & Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/accounts/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.fullName,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/login");
      } else {
        const errors = [];
        Object.entries(data).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => errors.push(msg));
          } else {
            errors.push(messages);
          }
        });
        setError(errors.join(" "));
      }
    } catch (err) {
      setError("Unable to connect. Please try again.");
    }

    setLoading(false);
  };

  // Password strength
  const getStrength = (pwd) => {
    if (!pwd) return { label: "", color: "bg-stone-200", width: "w-0" };
    if (pwd.length < 6) return { label: "Weak", color: "bg-red-400", width: "w-1/4" };
    if (pwd.length < 10) return { label: "Fair", color: "bg-amber-400", width: "w-2/4" };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: "Good", color: "bg-yellow-500", width: "w-3/4" };
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  };
  const strength = getStrength(form.password);
  const passwordMismatch = form.confirmPassword && form.password !== form.confirmPassword;

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <main className="min-h-screen bg-[#f9f9f7] flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">

        {/* Brand */}
        <div className="mb-10 text-center">
          <Link to="/" className="font-serif text-3xl font-light tracking-widest text-stone-900">
            Chitralaya
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 md:p-10">

          <header className="mb-6">
            <h2 className="font-serif text-2xl text-stone-900 mb-2 tracking-tight">
              Create an account
            </h2>
            <p className="text-stone-500 text-sm">
              Join the Chitralaya community.
            </p>
          </header>

          {/* Fixed height error zone */}
          <div className="min-h-[44px] mb-4">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-500" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-lg transition-colors duration-200 placeholder-stone-300 text-stone-900 text-sm"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-500" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="user@chitralaya.com"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-lg transition-colors duration-200 placeholder-stone-300 text-stone-900 text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-500" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-lg transition-colors duration-200 placeholder-stone-300 text-stone-900 text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {/* Fixed height — no jump */}
              <div className="h-5 pt-0.5">
                {form.password && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`} />
                    </div>
                    <span className="text-xs text-stone-400 whitespace-nowrap">
                      Strength: <span className="font-medium text-stone-600">{strength.label}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-500" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className={`w-full px-4 py-3 bg-stone-50 border focus:outline-none rounded-lg transition-colors duration-200 placeholder-stone-300 text-stone-900 text-sm pr-12 ${
                    passwordMismatch
                      ? "border-red-300 focus:border-red-400"
                      : "border-stone-200 focus:border-amber-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-700 transition-colors cursor-pointer"
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {/* Fixed height — no jump */}
              <div className="h-4">
                {passwordMismatch && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-2.5">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={form.agreeTerms}
                onChange={handleChange}
                className="w-4 h-4 mt-0.5 rounded text-amber-700 border-stone-300 focus:ring-amber-600 cursor-pointer accent-amber-700"
              />
              <label htmlFor="agreeTerms" className="text-sm text-stone-500 cursor-pointer select-none leading-relaxed">
                I agree to the{" "}
                <a href="#" className="text-amber-700 hover:underline font-medium">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-amber-700 hover:underline font-medium">Privacy Policy</a>
              </label>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-br from-amber-800 to-amber-600 text-white text-sm font-semibold rounded-full shadow-md shadow-amber-900/20 hover:shadow-amber-900/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-stone-500 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-amber-700 font-semibold hover:underline decoration-amber-500 decoration-2 underline-offset-4 transition-all"
          >
            Sign In
          </Link>
        </p>
        <Link
                to="/"
                className="text-amber-700 flex items-center justify-center font-semibold hover:underline decoration-amber-500 decoration-2 underline-offset-4 transition-all"
          >
               Home Page
        </Link>
      </div>
    </main>
  );
}