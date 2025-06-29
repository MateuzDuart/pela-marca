import { BellIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/userContext';
import { API_URL } from '../../config';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const navigate = useNavigate();
  const { user , logout} = useUser();
  const isLoggedIn = !!user;

  function handleLogout() {
    logout().then(() => {
    navigate('/login');
    });
  }

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

        <span
          className="text-xl font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95"
          onClick={() => navigate('/inicio')}
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

            {/* Avatar com dropdown */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    src={user ? `${API_URL}/images/${user.picture}` : '/default_user.png'}
                    alt="avatar"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/default_user.png';
                    }}
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
              >
                <li><span className="font-bold">{user.name}</span></li>
                <li><a onClick={handleLogout}>Sair</a></li>
              </ul>
            </div>
          </>
        ) : (
          <a href="/login" className="btn btn-primary btn-sm">Entrar</a>
        )}
      </div>
    </div>
  );
}
