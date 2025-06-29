import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/userContext";
import { useEffect } from "react";

export default function Home() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/inicio');
    }
  }, [user]);

  return (
    <div className="bg-base-200 min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center bg-gradient-to-b from-primary to-primary-focus text-primary-content">
        <h1 className="text-5xl font-extrabold mb-4">⚽ Pela Marca</h1>
        <p className="text-xl max-w-2xl mx-auto mb-8">
          Crie, gerencie e convide a galera para suas peladas de forma simples. Controle presenças, pagamentos e muito mais — tudo em um só lugar!
        </p>
        <Link to="/login" className="btn btn-secondary btn-lg shadow-xl">Entrar e marcar a próxima</Link>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8 text-base-content">O que você pode fazer?</h2>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-base-100 p-6 rounded-xl shadow hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold mb-2">⚽ Gerenciar Peladas</h3>
            <p className="text-base-content">Crie peladas, agende horários e organize o local do jogo com facilidade.</p>
          </div>
          <div className="bg-base-100 p-6 rounded-xl shadow hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold mb-2">👥 Convidar Amigos</h3>
            <p className="text-base-content">Compartilhe o link da pelada e tenha uma lista de presenças sempre atualizada.</p>
          </div>
          <div className="bg-base-100 p-6 rounded-xl shadow hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold mb-2">💸 Controlar Pagamentos</h3>
            <p className="text-base-content">Tenha controle sobre os pagamentos da quadra e quem já acertou.</p>
          </div>
        </div>
      </section>

      {/* Explanation Section */}
      <section className="bg-base-200 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-base-content">Como funciona?</h2>
          <p className="text-base-content mb-8 max-w-2xl mx-auto">
            Basta se cadastrar, criar sua pelada e enviar o convite para os amigos. O sistema mantém a lista de confirmados, envia lembretes e organiza o pagamento da quadra automaticamente.
          </p>
          <ul className="list-decimal list-inside text-left text-base-content max-w-2xl mx-auto space-y-2">
            <li>Cadastre-se e crie sua pelada</li>
            <li>Convide os amigos via link compartilhável</li>
            <li>Receba a confirmação e veja quem vai jogar</li>
            <li>Controle os pagamentos e gere relatórios simples</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-content text-center">
        <h2 className="text-3xl font-extrabold mb-4">Pronto para a próxima pelada?</h2>
        <Link to="/login" className="btn btn-accent btn-lg shadow-xl">Começar agora</Link>
      </section>
    </div>
  );
}
