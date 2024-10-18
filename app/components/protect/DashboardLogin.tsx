'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'

export default function ProtectPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
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
    } catch (err) {
      console.error('Error during authentication:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#212121]">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#2a2a2a] rounded-xl shadow-lg p-8 space-y-6">
              <h2 className="text-3xl font-bold text-center text-[#2dd4bf]">
                Enter Dashboard
              </h2>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#333333] text-white border-2 border-[#2dd4bf] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2dd4bf] focus:border-transparent transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-[#2dd4bf] hover:text-white transition-colors duration-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2dd4bf] hover:bg-[#20a08d] text-[#212121] font-bold py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#2dd4bf] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Accessing...' : 'Access Dashboard'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className="hidden md:block w-1/2 bg-[#2dd4bf]">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#212121] mb-4">Welcome Back</h1>
            <p className="text-xl text-[#212121]">Enter your password to access the dashboard</p>
          </div>
        </div>
      </div>
    </div>
  )
}
