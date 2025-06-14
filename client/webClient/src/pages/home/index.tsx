import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="max-w-md text-center bg-base-100 p-8 rounded-xl shadow-xl flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold text-primary">⚽ Pela Marca</h1>
        <p className="text-base-content text-lg">
          Marque sua pelada com os amigos de forma fácil, rápida e sem bagunça.
        </p>

        <ul className="text-base-content text-left text-sm list-disc list-inside">
          <li>Monte a lista dos jogadores</li>
          <li>Confirme presença</li>
          <li>Compartilhe horário e local</li>
        </ul>

        <Link to="/login" className="btn btn-primary btn-wide text-lg">
          Entrar e marcar a próxima
        </Link>
      </div>
    </div>
  );
}
