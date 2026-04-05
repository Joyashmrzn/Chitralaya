import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Reusable image placeholder — replaced by Django image later
const ImgPlaceholder = ({ label, className = "" }) => (
  <div className={`bg-stone-200 flex items-center justify-center text-stone-400 text-sm italic w-full h-full ${className}`}>
    {label || "Image — Django"}
  </div>
);

export default function HomePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  // ── Read auth state from localStorage ──────────────────────────────────────
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!token && !!user;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="bg-[#f9f9f7] text-stone-900 antialiased font-sans">

      {/* ── Top Nav ── */}
      <nav className="fixed top-0 w-full z-50 bg-stone-50/80 backdrop-blur-xl shadow-sm shadow-amber-900/5">
        <div className="flex justify-between items-center px-12 py-6 w-full max-w-screen-2xl mx-auto">

          {/* Brand */}
          <Link to="/" className="font-serif text-2xl font-light tracking-widest text-stone-900">
            Chitralaya
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex gap-10 font-serif text-lg tracking-tight">
            {["Shop", "Categories", "About", "Contact"].map((item, i) => (
              <a
                key={item}
                href="#"
                className={
                  i === 0
                    ? "text-amber-700 border-b border-amber-700/30 pb-1"
                    : "text-stone-600 hover:text-amber-600 transition-colors duration-300"
                }
              >
                {item}
              </a>
            ))}
          </div>

          {/* Auth + Cart */}
          <div className="flex items-center gap-5">
            <button className="material-symbols-outlined text-stone-600 hover:text-amber-600 transition-colors">
              shopping_cart
            </button>

            {isLoggedIn ? (
              /* Logged-in: show name + logout */
              <div className="flex items-center gap-3">
                <span className="text-sm text-stone-600 font-medium hidden md:block">
                  {user?.full_name || user?.email}
                </span>
                {user?.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="text-xs font-semibold tracking-widest uppercase border border-stone-300 text-stone-600 px-4 py-1.5 rounded-full hover:bg-stone-100 transition-all duration-300"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold tracking-widest uppercase border border-amber-700 text-amber-700 px-6 py-2 rounded-full hover:bg-amber-700 hover:text-white transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              /* Logged-out: Sign In button */
              <Link
                to="/login"
                className="text-sm font-semibold tracking-widest uppercase border border-amber-700 text-amber-700 px-6 py-2 rounded-full hover:bg-amber-700 hover:text-white transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImgPlaceholder label="Hero Painting — Django" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 px-12 md:px-24 max-w-4xl">
          <span className="text-white/90 tracking-[0.3em] uppercase text-xs mb-6 block">
            Artisanal Curation
          </span>
          <h1 className="font-serif text-6xl md:text-8xl text-white font-light leading-tight mb-8 drop-shadow-lg">
            Bring Art Into <br />
            <span className="italic">Your Space</span>
          </h1>
          <Link
            to="/register"
            className="inline-block bg-gradient-to-r from-amber-800 to-amber-600 text-white px-10 py-4 rounded-full text-sm tracking-widest uppercase hover:opacity-90 transition-all shadow-xl shadow-amber-900/20"
          >
            Shop Collections
          </Link>
        </div>
      </section>

      {/* ── Curated Highlights ── */}
      <section className="py-32 px-12 max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24">
          <div className="max-w-xl">
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
              Curated Highlights
            </h2>
            <p className="text-stone-500 text-lg leading-relaxed">
              Hand-selected pieces from emerging global artist, chosen for
              their ability to transform a room from a structure into a home.
            </p>
          </div>
          <div className="mt-8 md:mt-0">
            <a href="#" className="group flex items-center gap-2 text-amber-700 font-medium">
              View Gallery
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
          <div className="md:col-span-7 flex flex-col gap-6">
            <div className="aspect-[4/5] overflow-hidden rounded-lg bg-stone-200 shadow-sm">
              <ImgPlaceholder label="Artwork — Django" />
            </div>
            <div className="pt-4">
              <h3 className="font-serif text-2xl font-light">Ethereal Morning</h3>
              <p className="text-stone-400 italic">by Elena Rostova</p>
              <p className="text-amber-700 mt-2 font-semibold">$1,240</p>
            </div>
          </div>
          <div className="md:col-span-5 md:pt-32 flex flex-col gap-6">
            <div className="aspect-square overflow-hidden rounded-lg bg-stone-200 shadow-sm">
              <ImgPlaceholder label="Artwork — Django" />
            </div>
            <div className="pt-4">
              <h3 className="font-serif text-2xl font-light">Urban Echoes</h3>
              <p className="text-stone-400 italic">by Marcus Thorne</p>
              <p className="text-amber-700 mt-2 font-semibold">$890</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Explore Movements ── */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-screen-2xl mx-auto px-12">
          <h2 className="font-serif text-center text-3xl font-light mb-16 tracking-widest uppercase">
            Explore Movements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {["Abstract", "Nature", "Modern", "Spiritual"].map((cat) => (
              <div key={cat} className="group cursor-pointer">
                <div className="aspect-[3/4] rounded-lg overflow-hidden relative mb-4 bg-stone-200">
                  <ImgPlaceholder label={`${cat} — Django`} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="font-serif text-xl font-light">{cat}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Artist Spotlight ── */}
      <section className="py-32 bg-[#f9f9f7]">
        <div className="max-w-screen-2xl mx-auto px-12 flex flex-col md:flex-row gap-20 items-center">
          <div className="flex-1 order-2 md:order-1">
            <span className="text-amber-700 font-medium tracking-widest uppercase text-xs mb-4 block">
              Artist Spotlight
            </span>
            <h2 className="font-serif text-5xl font-light mb-8">Sofia Chen</h2>
            <p className="text-stone-500 text-lg leading-relaxed mb-8 italic">
              "My work is a dialogue between the silence of the canvas and the
              noise of emotion."
            </p>
            <div className="h-px w-24 bg-amber-700 mb-6" />
            <p className="text-stone-500 leading-relaxed mb-10">
              Based in Shanghai, Sofia's contemporary approach to traditional
              ink washing has earned her international acclaim.
            </p>
            <button className="border border-stone-300 px-8 py-3 rounded-full hover:bg-stone-100 transition-colors text-sm uppercase tracking-wider">
              Read Biography
            </button>
          </div>
          <div className="flex-1 order-1 md:order-2 grid grid-cols-2 gap-4">
            <div className="col-span-2 aspect-[16/9] rounded-lg overflow-hidden bg-stone-200">
              <ImgPlaceholder label="Artist portrait — Django" />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden bg-stone-200">
              <ImgPlaceholder label="Detail — Django" />
            </div>
            <div className="aspect-square rounded-lg overflow-hidden bg-stone-200">
              <ImgPlaceholder label="Art piece — Django" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="py-24 bg-stone-100">
        <div className="max-w-4xl mx-auto px-12 text-center">
          <span
            className="material-symbols-outlined text-4xl text-amber-700/40 mb-8 block"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            format_quote
          </span>
          <p className="font-serif text-3xl font-light leading-relaxed mb-8 italic text-stone-800">
            "The painting I received from Chitralaya didn't just decorate my
            room — it changed the entire energy of my home."
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-300">
              <ImgPlaceholder label="" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-stone-900">Julianne Moore</p>
              <p className="text-sm text-stone-400 uppercase tracking-widest">Interior Designer</p>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-12">
            <div className="w-2 h-2 rounded-full bg-amber-700" />
            <div className="w-2 h-2 rounded-full bg-stone-300" />
            <div className="w-2 h-2 rounded-full bg-stone-300" />
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-32 bg-stone-900 text-stone-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-700/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="max-w-screen-xl mx-auto px-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="max-w-xl">
              <h2 className="font-serif text-4xl font-light mb-6">
                Join the Private Collection
              </h2>
              <p className="text-stone-400 text-lg">
                Receive exclusive previews of new collections, artist
                interviews, and curator's notes directly in your inbox.
              </p>
            </div>
            <div className="w-full max-w-md">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-transparent border-b border-stone-700 py-4 focus:border-amber-600 outline-none text-lg transition-colors placeholder:text-stone-600"
                  />
                  <button className="absolute right-0 bottom-4 text-amber-500 uppercase text-sm font-semibold tracking-widest hover:text-amber-300 transition-colors">
                    Subscribe
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 uppercase tracking-tighter">
                  By subscribing you agree to our Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full py-16 bg-stone-100">
        <div className="flex flex-col items-center gap-8 px-8 max-w-screen-2xl mx-auto">
          <div className="font-serif text-2xl italic text-stone-800">Chitralaya</div>
          <div className="flex gap-12 text-sm tracking-wide text-stone-500">
            {["Privacy Policy", "Terms of Service", "Shipping Info"].map((link) => (
              <a key={link} href="#" className="hover:text-stone-900 transition-opacity opacity-80 hover:opacity-100">
                {link}
              </a>
            ))}
          </div>
          <div className="flex gap-6 mt-4">
            {["brand_awareness", "public", "mail"].map((icon) => (
              <span key={icon} className="material-symbols-outlined text-stone-400 cursor-pointer hover:text-amber-700 transition-colors">
                {icon}
              </span>
            ))}
          </div>
          <p className="text-stone-400 text-xs mt-8">© 2024 Chitralaya. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}