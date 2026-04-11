export default function GalleryGrid({ artworks, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-[#f0ece4] p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[16px] font-bold text-[#1a1a2e] m-0">Private Gallery</h2>
        <span className="text-[12px] text-[#c9a96e] italic">Curated Wishlist</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[220px] rounded-xl bg-[#f5f3ef] animate-pulse" />
          ))}
        </div>
      ) : artworks.length === 0 ? (
        <p className="text-center text-[#aaaacc] py-8 text-[14px]">
          Your wishlist is empty. Browse artworks to save your favourites.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {artworks.map((item) => {
            const art = item.artwork ?? item;
            return (
              <div
                key={art.id}
                className="rounded-xl overflow-hidden border border-[#f0ece4] bg-[#f8f6f1] relative hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
              >
                {art.image ? (
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-40 object-cover block"
                  />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center text-[36px] bg-[#f0ece4]">
                    🎨
                  </div>
                )}

                <button className="absolute top-2.5 right-2.5 w-[30px] h-[30px] rounded-full bg-white/90 border-none flex items-center justify-center text-[#c9a96e] text-[14px] cursor-pointer shadow-sm">
                  ♥
                </button>

                <div className="p-2.5">
                  <p className="text-[13px] font-bold text-[#1a1a2e] m-0 mb-0.5 truncate">
                    {art.title}
                  </p>
                  {art.artist_name && (
                    <p className="text-[11px] text-[#8888aa] m-0 mb-1">{art.artist_name}</p>
                  )}
                  {art.price && (
                    <p className="text-[13px] font-bold text-[#c9a96e] m-0">
                      ${parseFloat(art.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}