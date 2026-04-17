export function Navbar() {
  return (
    <div className="flex flex-row justify-between">
      <div class="identity-hero">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <rect width="60" height="60" rx="14" fill="#2A6B5C" />
          <rect
            x="13"
            y="34"
            width="7"
            height="13"
            rx="2"
            fill="white"
            opacity="0.40"
          />
          <rect
            x="23"
            y="26"
            width="7"
            height="21"
            rx="2"
            fill="white"
            opacity="0.65"
          />
          <rect x="33" y="17" width="7" height="30" rx="2" fill="white" />
          <path
            d="M39 14 L46 8 M46 8 L41.5 8 M46 8 L46 12.5"
            stroke="white"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <div>
          <div className="text-3xl font-bold">
            Scope <p>Flow</p>
          </div>
          <div className="logo-tagline">
            Precificação inteligente para desenvolvedores
          </div>
        </div>
      </div>
      <div className="text-2xl font-bold"></div>
      <div className="flex flex-row gap-4">
        <a href="/" className="text-gray-600 hover:text-gray-900">
          Home
        </a>
        <a href="/about" className="text-gray-600 hover:text-gray-900">
          About
        </a>
        <a href="/contact" className="text-gray-600 hover:text-gray-900">
          Contact
        </a>
      </div>
    </div>
  )
}
