// app/components/protect/protect-page.tsx

'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'

export default function ProtectPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (response.ok) {
      router.push('/dashboard')
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EFF3FF] to-[#B7CCFF] p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300 p-6 space-y-6">
            <h2 className="text-3xl font-bold text-center text-[#082472]">
              Enter Dashboard
            </h2>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#EFF3FF] text-[#082472] border-2 border-[#B7CCFF] rounded-md focus:outline-none focus:border-[#0550F2] transition-all duration-300"
              />
              <Lock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#0550F2]" size={20} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-[#0550F2] hover:text-[#003BCF] transition-colors duration-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-[#0550F2] hover:bg-[#003BCF] text-white font-bold py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#78A3FF] focus:ring-opacity-50"
              style={{
                boxShadow: '0 4px 6px -1px rgba(0, 59, 207, 0.1), 0 2px 4px -1px rgba(0, 59, 207, 0.06)',
                transform: 'translateY(-2px)',
              }}
            >
              Access Dashboard
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
