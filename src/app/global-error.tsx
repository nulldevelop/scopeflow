'use client'

import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Algo deu errado!</h2>
      <p className="text-gray-500 mb-8">{error.message}</p>
      <Button
        onClick={() => reset()}
        className="px-4 py-2 bg-[#ff5a5f] text-white rounded-lg"
      >
        Tentar novamente
      </Button>
    </div>
  )
}
