import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/userContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { user, peladas, isPeladasLoading } = useUser();
  const isLoggedIn = !!user;
  const [expanded, setExpanded] = useState(true);

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity z-40 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-base-100 shadow-xl z-50 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {isLoggedIn ? (
          <>
            {/* Cabeçalho do usuário */}
            <div
              className="p-4 border-b flex items-center gap-3 cursor-pointer"
              onClick={() => handleNavigate('/profile')}
            >
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img src={user.picture} alt="avatar" />
                </div>
              </div>
              <div>
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-base-content/60">Ver perfil</p>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-4">
              <div className="collapse collapse-arrow bg-base-200" onClick={() => setExpanded(!expanded)}>
                <input type="checkbox" checked={expanded} readOnly />
                <div className="collapse-title font-medium">Minhas Peladas</div>
                <div className="collapse-content flex flex-col gap-2">
                  {isPeladasLoading ? (
                    <div className="flex justify-center py-2">
                      <span className="loading loading-spinner loading-sm text-primary"></span>
                    </div>
                  ) : (
                    peladas?.map((p) => (
                      <Link
                        key={p.id}
                        to={`/pelada/${p.id}`}
                        className="btn btn-sm btn-outline justify-start"
                        onClick={onClose}
                      >
                        {p.name}
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button onClick={() => handleNavigate('/pelada/criar')} className="btn btn-primary btn-sm">
                  ➕ Nova Pelada
                </button>
                <button onClick={() => handleNavigate('/profile')} className="btn btn-outline btn-sm">
                  ⚙️ Editar Perfil
                </button>
                <button onClick={() => handleNavigate('/peladas')} className="btn btn-outline btn-sm">
                  📋 Gerenciar Peladas
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 text-center flex flex-col gap-4">
            <p className="text-base-content">Você não está logado.</p>
            <button onClick={() => handleNavigate('/login')} className="btn btn-primary btn-sm">
              Entrar agora
            </button>
          </div>
        )}
      </div>
    </>
  );
}
