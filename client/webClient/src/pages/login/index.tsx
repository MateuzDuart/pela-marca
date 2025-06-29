import { useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/userContext';
import { API_URL } from '../../config';

export default function Login() {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      navigate('/inicio');
    }
  }, [user]);

  const handleLogin = () => {
    document.location.href = `${API_URL}/api/v1/auth/google`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-sm p-6 sm:p-8 bg-base-100 rounded-xl shadow-xl flex flex-col items-center gap-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">Entrar</h1>

        <button
          onClick={handleLogin}
          className="btn btn-primary btn-wide flex items-center gap-3 transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95 cursor-pointer"
        >
          <FcGoogle size={22} />
          Entrar com Google
        </button>

        <button
          onClick={() => navigate("/inicio")}
          className="btn btn-ghost btn-sm mt-2"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
