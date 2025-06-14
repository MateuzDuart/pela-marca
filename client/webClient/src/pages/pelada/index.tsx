import { useParams } from 'react-router-dom';
import { useState } from 'react';

export default function PeladaPage() {
  const { id } = useParams();

  // Simulação de evento da semana
  const eventoAtivo = true;
  const dataEvento = '2025-06-13'; // ou undefined se não tiver evento

  const [confirmados, setConfirmados] = useState<number[]>([1, 3]);
  const membros = [
    { id: 1, nome: 'João', avatar: 'https://i.pravatar.cc/100?img=1', status: 'Em dia', pagamento: '2025-06-10' },
    { id: 2, nome: 'Maria', avatar: 'https://i.pravatar.cc/100?img=2', status: 'Devendo', pagamento: '2025-05-05' },
    { id: 3, nome: 'Carlos', avatar: 'https://i.pravatar.cc/100?img=3', status: 'Em dia', pagamento: '2025-06-08' },
  ];

  const usuarioLogado = membros[0];
  const confirmou = confirmados.includes(usuarioLogado.id);

  const handleConfirmarPresenca = () => {
    if (!confirmou) setConfirmados((prev) => [...prev, usuarioLogado.id]);
  };

  const diasFrequentes = ['Segunda-feira', 'Quinta-feira'];

  const formatData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 space-y-8">
      {/* Cabeçalho */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Pelada #{id}</h1>
        <p className="text-base-content">{eventoAtivo ? `Evento em: ${formatData(dataEvento)}` : 'Nenhum evento ativo'}</p>
      </div>

      {/* Sessão 1: Presença */}
      <section className="bg-base-100 rounded-xl shadow-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Lista de Presença</h2>
          <span className="badge badge-primary text-white">
            {confirmados.length} Confirmados
          </span>
        </div>

        {eventoAtivo ? (
          <>
            {!confirmou ? (
              <button onClick={handleConfirmarPresenca} className="btn btn-success btn-block">
                Confirmar Presença
              </button>
            ) : (
              <button
                onClick={() =>
                  setConfirmados((prev) => prev.filter((id) => id !== usuarioLogado.id))
                }
                className="btn btn-warning btn-block"
              >
                Cancelar Confirmação
              </button>
            )}

            <ul className="space-y-2">
              {membros
                .filter((m) => confirmados.includes(m.id))
                .map((m) => (
                  <li key={m.id} className="flex items-center gap-3 p-2 rounded bg-success/20">
                    <div className="avatar">
                      <div className="w-10 rounded-full">
                        <img src={m.avatar} />
                      </div>
                    </div>
                    <span>{m.nome}</span>
                  </li>
                ))}
            </ul>
          </>
        ) : (
          <p className="text-center text-base-content">Nenhum evento disponível para confirmar presença.</p>
        )}
      </section>

      {/* Sessão 2: Status do Usuário */}
      <section className="bg-base-100 rounded-xl shadow-md p-6 space-y-3">
        <h2 className="text-xl font-semibold">Seu Status</h2>
        <p>
          <strong>Status:</strong>{' '}
          <span className={`badge ${usuarioLogado.status === 'Em dia' ? 'badge-success' : 'badge-error'}`}>
            {usuarioLogado.status}
          </span>
        </p>
        <p>
          <strong>Último Pagamento:</strong> {formatData(usuarioLogado.pagamento)}
        </p>
      </section>

      {/* Sessão 3: Próximos Eventos */}
      <section className="bg-base-100 rounded-xl shadow-md p-6 space-y-3">
        <h2 className="text-xl font-semibold">Próximos Eventos</h2>
        {diasFrequentes.map((dia, i) => (
          <div key={i} className="flex justify-between border-b py-2">
            <span>{dia}</span>
            <span className="text-sm text-base-content/70">
              {/* Simulando a data futura baseada em hoje */}
              {formatData(new Date(Date.now() + (i + 2) * 86400000).toISOString())}
            </span>
          </div>
        ))}
      </section>

      {/* Sessão 4: Membros */}
      <section className="bg-base-100 rounded-xl shadow-md p-6 space-y-3">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Membros</h2>
          <span className="badge badge-outline">{membros.length} membros</span>
        </div>
        <ul className="space-y-3">
          {membros.map((m) => (
            <li key={m.id} className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img src={m.avatar} />
                </div>
              </div>
              <span>{m.nome}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
