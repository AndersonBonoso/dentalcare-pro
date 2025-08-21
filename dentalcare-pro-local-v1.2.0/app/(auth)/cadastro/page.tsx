'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface PasswordStrength {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export default function CadastroPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [showPasswordMatch, setShowPasswordMatch] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  function validatePassword(password: string): PasswordStrength {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  }

  function handlePasswordChange(password: string) {
    setFormData(prev => ({ ...prev, password }));
    const strength = validatePassword(password);
    setPasswordStrength(strength);
    setShowPasswordStrength(password.length > 0);
    setShowPasswordMatch(false);
  }

  function handleConfirmPasswordFocus() {
    setShowPasswordStrength(false);
    setShowPasswordMatch(true);
  }

  function isPasswordValid(): boolean {
    const { minLength, hasUppercase, hasNumber, hasSpecialChar } = passwordStrength;
    return minLength && hasUppercase && hasNumber && hasSpecialChar;
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (!isPasswordValid()) {
      setError('A senha não atende aos critérios de segurança');
      setLoading(false);
      return;
    }

    try {
      // Criar o usuário no Supabase Auth
      // O trigger handle_new_user() criará automaticamente a clínica e o registro na tabela usuarios
      const { data: authData, error: authError } = await supabaseBrowser.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nome: formData.nome
          }
        }
      });

      if (authError) throw authError;

      setSuccess(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthLayout title="Conta criada com sucesso!">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full mb-4 bg-green-100">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-green-600">
              <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <p className="text-dc-fg/70 mb-6">
            Verifique seu email para confirmar sua conta e depois faça login.
          </p>
          <Link href="/login" className="dc-btn-primary">
            Fazer Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Crie sua conta">
      <form onSubmit={handleCadastro} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-dc-ink mb-2">Nome Completo</label>
          <input
            type="text"
            required
            className="dc-input"
            placeholder="Seu nome completo"
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dc-ink mb-2">Email</label>
          <input
            type="email"
            required
            className="dc-input"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dc-ink mb-2">Senha</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="dc-input pr-10"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          
          {showPasswordStrength && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm font-medium text-gray-700 mb-2">Critérios da senha:</p>
              <div className="space-y-1">
                <div className={`flex items-center text-sm ${passwordStrength.minLength ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{passwordStrength.minLength ? '✓' : '✗'}</span>
                  Mínimo de 8 caracteres
                </div>
                <div className={`flex items-center text-sm ${passwordStrength.hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{passwordStrength.hasUppercase ? '✓' : '✗'}</span>
                  Pelo menos 1 letra maiúscula
                </div>
                <div className={`flex items-center text-sm ${passwordStrength.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{passwordStrength.hasNumber ? '✓' : '✗'}</span>
                  Pelo menos 1 número
                </div>
                <div className={`flex items-center text-sm ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{passwordStrength.hasSpecialChar ? '✓' : '✗'}</span>
                  Pelo menos 1 caractere especial (!@#$%^&*)
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-dc-ink mb-2">Confirmar Senha</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              className="dc-input pr-10"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              onFocus={handleConfirmPasswordFocus}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          
          {showPasswordMatch && formData.confirmPassword.length > 0 && (
            <div className="mt-2">
              {formData.password === formData.confirmPassword ? (
                <p className="text-sm text-green-600 flex items-center">
                  <span className="mr-2">✓</span>
                  As senhas coincidem
                </p>
              ) : (
                <p className="text-sm text-red-600 flex items-center">
                  <span className="mr-2">✗</span>
                  As senhas não coincidem
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="dc-btn-primary w-full"
        >
          {loading ? 'Criando...' : 'Criar Conta'}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-dc-fg/70">
          Já tem uma conta?{' '}
          <Link href="/login" className="dc-link">
            Entre aqui
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

