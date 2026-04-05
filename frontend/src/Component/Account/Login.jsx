import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/accounts/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      } else {
        const message =
          data.detail ||
          data.non_field_errors?.[0] ||
          data.email?.[0] ||
          "Invalid credentials.";
        setError(message);
      }
    } catch (err) {
      setError("Unable to connect. Please try again.");
    }

    setLoading(false);
  };

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
          <span className="font-serif text-3xl font-light tracking-widest text-stone-900">
            Chitralaya
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 md:p-10">

          <header className="mb-6">
            <h2 className="font-serif text-2xl text-stone-900 mb-2 tracking-tight">
              Welcome back
            </h2>
            <p className="text-stone-500 text-sm">
              Please enter your details to access your gallery.
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
                placeholder="curator@chitralaya.com"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-amber-500 focus:outline-none rounded-lg transition-colors duration-200 placeholder-stone-300 text-stone-900 text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-stone-500" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-amber-700 hover:text-amber-500 transition-colors">
                  Forgot Password?
                </a>
              </div>
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
            </div>

            {/* Remember me */}
            <div className="flex items-center space-x-2.5">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={form.remember}
                onChange={handleChange}
                className="w-4 h-4 rounded text-amber-700 border-stone-300 focus:ring-amber-600 cursor-pointer accent-amber-700"
              />
              <label htmlFor="remember" className="text-sm text-stone-500 cursor-pointer select-none">
                Stay signed in for 30 days
              </label>
            </div>

            {/* Submit */}
            <div className="pt-2 space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-br from-amber-800 to-amber-600 text-white text-sm font-semibold rounded-full shadow-md shadow-amber-900/20 hover:shadow-amber-900/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-100" />
                </div>
                {/* <div className="relative flex justify-center text-xs uppercase tracking-widest text-stone-400">
                  <span className="bg-white px-4">Or continue with</span>
                </div> */}
              </div>

              {/* Social */}
              
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-stone-500 text-sm">
          New to Chitralaya?{" "}
          <Link
            to="/register"
            className="text-amber-700 font-semibold hover:underline decoration-amber-500 decoration-2 underline-offset-4 transition-all"
          >
            Sign Up
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