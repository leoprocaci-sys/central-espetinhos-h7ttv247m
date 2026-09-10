import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { SkewerIcon } from '@/components/SkewerIcon'
import { Lock, Mail, AlertCircle, Loader2, ArrowRight } from 'lucide-react'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('leoprocaci@gmail.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Por favor, informe e-mail e senha.')
      return
    }

    try {
      setLoading(true)
      await login(email, password)
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch (err: unknown) {
      console.error('Login error:', err)
      setError('E-mail ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F3EF] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FCE9E4] flex items-center justify-center mb-4 shadow-sm border border-[#E7E1DA]">
            <SkewerIcon className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A2420] tracking-tight">
            Central Espetinhos
          </h1>
          <p className="text-sm text-[#7A716A] mt-1">Sistema de Gestão e Operações B2B</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E7E1DA] p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#2A2420] mb-1">Acesse sua conta</h2>
          <p className="text-xs text-[#7A716A] mb-6">
            Informe suas credenciais para entrar no painel operacional.
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2A2420] mb-1.5 uppercase tracking-wider">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7A716A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                  className="w-full bg-white border border-[#E7E1DA] rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-[#2A2420] placeholder-[#7A716A]/60 focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A2420] mb-1.5 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7A716A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full bg-white border border-[#E7E1DA] rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-[#2A2420] placeholder-[#7A716A]/60 focus:outline-hidden focus:ring-2 focus:ring-[#C43A25]/25 focus:border-[#C43A25] transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#C43A25] hover:bg-[#A82F1D] active:scale-[0.99] text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Seed demo hints */}
          <div className="mt-6 pt-5 border-t border-[#E7E1DA] text-center">
            <p className="text-xs text-[#7A716A]">
              Acesso pré-configurado:{' '}
              <strong className="text-[#2A2420]">leoprocaci@gmail.com</strong> /{' '}
              <strong className="text-[#2A2420]">Skip@Pass</strong>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[#7A716A] mt-6">
          © Central Espetinhos — Espetinhos crus, padronizados e congelados
        </p>
      </div>
    </div>
  )
}
