import { useEffect, useState } from 'react';
import styles from './index.module.css';
import { useUser } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import { updateUser } from '../../API/routes';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';

export default function Profile() {
  const [nome, setNome] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, syncUser } = useUser();
  const navigate = useNavigate();
  const maxChars = 30;

  useEffect(() => {
    if (user) {
      setNome(user.name);
      setPreviewUrl(`${API_URL}/images/${user.picture}`);
    } else {
      navigate('/login');
    }
  }, [user]);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSalvar = async () => {
    try {
      setIsLoading(true);
      await updateUser(nome, foto);
      await syncUser();
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar o perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex justify-center items-center px-4 py-10 relative">
      {/* Overlay de carregamento */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <span className="loading loading-spinner text-primary text-4xl"></span>
        </div>
      )}

      <div className="w-full max-w-md bg-base-100 p-8 rounded-xl shadow-xl space-y-6">
        <h1 className="text-2xl font-bold text-center">Editar Perfil</h1>

        <div className="flex flex-col items-center gap-4">
          <div className="avatar">
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img src={previewUrl}
                alt="foto de perfil"
                onError={(e) => {
                  e.currentTarget.onerror = null; // evita loop infinito
                  e.currentTarget.src = '/default_user.png'; // ou alguma URL pública válida
                }}
              />
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full max-w-xs"
            onChange={handleFotoChange}
            disabled={isLoading}
          />
        </div>

        <div className={`form-control ${styles.formControl}`}>
          <span className="label-text mb-1">Nome</span>
          <input
            type="text"
            className="input input-bordered"
            value={nome}
            maxLength={maxChars}
            onChange={(e) => setNome(e.target.value)}
            disabled={isLoading}
          />
          <div className="text-sm text-right mt-1 text-gray-500">
            {nome.length}/{maxChars}
          </div>
        </div>

        <button className="btn btn-primary w-full mt-4" onClick={handleSalvar} disabled={isLoading}>
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}
