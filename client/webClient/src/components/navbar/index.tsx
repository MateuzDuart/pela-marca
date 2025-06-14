import { BellIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/userContext';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  const isLoggedIn = user?true:false;

  return (
    <div className="navbar bg-base-100 shadow-md px-4">
      {/* Início: botão menu + logo */}
      <div className="flex-1 flex items-center gap-2">
        <button className="btn btn-ghost btn-square" onClick={onToggleSidebar}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Botão que leva para home */}
        <span
          className="text-xl font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95"
          onClick={() => navigate('/')}
        >
          Pela Marca
        </span>
      </div>

      {/* Fim: login ou notificações */}
      <div className="flex-none flex items-center gap-4">
        {isLoggedIn ? (
          <>
            <button className="btn btn-ghost btn-circle">
              <BellIcon className="h-6 w-6" />
            </button>
            <div className="avatar">
              <div className="w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={user?.picture} alt="avatar" />
              </div>
            </div>
          </>
        ) : (
          <a href="/login" className="btn btn-primary btn-sm">Entrar</a>
        )}
      </div>
    </div>
  );
}
