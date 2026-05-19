import { isAxiosError } from 'axios';
import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import type { Toast } from 'react-hot-toast';
import { FiLock, FiMail } from 'react-icons/fi';
import { Navigate, useNavigate } from 'react-router-dom';
import AlertToast from '../../components/AlertToast';
import PrimaryButton from '../../components/PrimaryButton';
import TextInput from '../../components/TextInput';
import { useAuth } from '../../contexts/AuthContext';
import type { ApiErrorResponse } from '../../interfaces/auth';
import { login } from '../../services/auth';
import './index.scss';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEmailValid = useMemo(() => emailRegex.test(email), [email]);
  const isPasswordValid = password.trim().length > 0;
  const isFormValid = isEmailValid && isPasswordValid;

  const showAlert = (message: string) => {
    toast.custom((t: Toast) => <AlertToast title={message} onClose={() => toast.dismiss(t.id)} />, {
      id: message,
    });
  };

  const validateEmailField = () => {
    if (!email) {
      setEmailError('');
      return false;
    }

    if (!isEmailValid) {
      setEmailError('Por favor, inserir um e-mail válido.');
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);

    if (emailError) {
      setEmailError('');
    }
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);

    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setPasswordError('');

    if (!validateEmailField() || !isPasswordValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({ email, password });
      signIn(response);
      navigate('/courses', { replace: true });
    } catch (error) {
      if (isAxiosError<ApiErrorResponse>(error)) {
        const status = error.response?.status;
        const code = error.response?.data?.code;

        if (status === 404 || code === 'USER_NOT_FOUND') {
          setEmailError('Usuário não encontrado. Tente novamente.');
          setPasswordError('');
          return;
        }

        if (status === 401 || code === 'INVALID_PASSWORD') {
          setPasswordError('Senha incorreta.');
          return;
        }
      }

      showAlert('Não foi possível realizar o login. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/courses" replace />;
  }

  return (
    <main className="login-page flex min-h-screen items-center justify-center px-4 py-8">
      <section className="w-full max-w-md rounded-3xl border border-white/60 bg-white/90 p-8 shadow-panel backdrop-blur-sm sm:p-10">
        <div className="mb-8 text-center">
          <span className="inline-flex rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-600">
            Painel Administrativo
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            JVE Vestibulinho
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Informe seus dados para acessar o sistema.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <TextInput
            id="email"
            name="email"
            type="email"
            label="E-mail"
            placeholder="Digite o seu E-mail"
            value={email}
            onChange={handleEmailChange}
            onBlur={validateEmailField}
            autoComplete="email"
            required
            error={emailError}
            icon={<FiMail size={18} />}
          />

          <TextInput
            id="password"
            name="password"
            type="password"
            label="Senha"
            placeholder="Digite sua Senha"
            value={password}
            onChange={handlePasswordChange}
            autoComplete="current-password"
            required
            error={passwordError}
            icon={<FiLock size={18} />}
          />

          <PrimaryButton type="submit" disabled={!isFormValid} isLoading={isSubmitting}>
            Entrar
          </PrimaryButton>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
