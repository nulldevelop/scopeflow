export function Footer() {
  return (
    <footer className="bg-[#0E2E26] px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 60 60" fill="none">
              <rect width="60" height="60" rx="14" fill="#2A6B5C" />
              <rect
                x="13"
                y="34"
                width="7"
                height="13"
                rx="2"
                fill="white"
                opacity="0.4"
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
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <span className="text-white font-medium">ScopeFlow</span>
              <span className="text-[#9BBFB8]"> — SaaS de Precificação</span>
            </div>
          </div>

          <p className="text-sm text-white/40">
            Documento de conceito · Guia da ideia pré-desenvolvimento · 2026
          </p>
        </div>
      </div>
    </footer>
  )
}
