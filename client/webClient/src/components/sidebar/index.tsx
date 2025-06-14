import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/userContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const { user } = useUser();
  const isLoggedIn = user?true:false;

  const peladas = [
    { id: 1, nome: 'Pelada da Quinta' },
    { id: 2, nome: 'Pelada da Galera do Bairro' },
  ];

  function handleSeePerfil() {
    onClose();
    navigate('/profile');
  }

  function handleLogin() {
    onClose();
    navigate('/login');
  }

  return (
    <>
      {/* Overlay escuro */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity z-40 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-base-100 shadow-xl z-50 transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {isLoggedIn ? (
          <>
            {/* Usuário logado */}
            <div className="p-4 border-b flex items-center gap-3 cursor-pointer" onClick={handleSeePerfil}>
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img src={user?.picture} alt="avatar" />
                </div>
              </div>
              <div>
                <p className="font-bold">{user?.name}</p>
                <p className="text-sm text-base-content/60">Ver perfil</p>
              </div>
            </div>

            <div className="p-4">
              <div
                className="collapse collapse-arrow bg-base-200"
                onClick={() => setExpanded(!expanded)}
              >
                <input type="checkbox" checked={expanded} readOnly />
                <div className="collapse-title font-medium">Minhas Peladas</div>
                <div className="collapse-content flex flex-col gap-2">
                  {peladas.map((p) => (
                    <Link
                      key={p.id}
                      to={`/pelada/${p.id}`}
                      className="btn btn-sm btn-outline justify-start"
                      onClick={onClose}
                    >
                      {p.nome}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <Link to="/pelada/criar" className="btn btn-primary btn-sm" onClick={onClose}>
                  ➕ Nova Pelada
                </Link>
                <Link to="/profile" className="btn btn-outline btn-sm" onClick={onClose}>
                  ⚙️ Editar Perfil
                </Link>
                <Link to="/peladas" className="btn btn-outline btn-sm" onClick={onClose}>
                  📋 Gerenciar Peladas
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Usuário deslogado */}
            <div className="p-6 text-center flex flex-col gap-4">
              <p className="text-base-content">Você não está logado.</p>
              <button onClick={handleLogin} className="btn btn-primary btn-sm">
                Entrar agora
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
