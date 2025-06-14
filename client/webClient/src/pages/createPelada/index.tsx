import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function CriarPeladaPage() {
  const [nome, setNome] = useState('');
  const [diasPelada, setDiasPelada] = useState({ segunda: '', terca: '', quarta: '', quinta: '', sexta: '', sabado: '', domingo: '' });
  const [diaPagamento, setDiaPagamento] = useState('');
  const [preco, setPreco] = useState('');

  const handleCriar = () => {
    toast.success('Pelada criada com sucesso!');
    // Aqui você pode chamar a API para criar a pelada
  };

  const SessaoNome = () => (
    <div className="bg-base-100 p-4 rounded-lg shadow space-y-2">
      <h2 className="text-lg font-semibold">Nome da Pelada</h2>
      <input
        type="text"
        className="input input-bordered w-full max-w-md"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Digite o nome da pelada"
      />
    </div>
  );

  const SessaoDias = () => (
    <div className="bg-base-100 p-4 rounded-lg shadow space-y-4">
      <h2 className="text-lg font-semibold">Dias da Semana</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(diasPelada).map(([dia, horario]) => (
          <div key={dia} className="space-y-1">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox"
                checked={!!horario}
                onChange={(e) =>
                  setDiasPelada((prev) => ({
                    ...prev,
                    [dia]: e.target.checked ? '19:00' : '',
                  }))
                }
              />
              <span className="label-text capitalize">{dia}</span>
            </label>
            {horario && (
              <input
                type="time"
                className="input input-bordered w-full max-w-xs"
                value={horario}
                onChange={(e) =>
                  setDiasPelada((prev) => ({
                    ...prev,
                    [dia]: e.target.value,
                  }))
                }
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const SessaoPagamento = () => (
    <div className="bg-base-100 p-4 rounded-lg shadow space-y-4">
      <h2 className="text-lg font-semibold">Informações de Pagamento</h2>

      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Preço</span>
        </label>
        <input
          type="number"
          placeholder="R$"
          className="input input-bordered"
          value={preco}
          min={0}
          onChange={(e) => setPreco(e.target.value)}
        />
      </div>

      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Dia do Pagamento</span>
        </label>
        <input
          type="number"
          min={1}
          max={31}
          placeholder="Ex: 5"
          className="input input-bordered"
          value={diaPagamento}
          onChange={(e) => setDiaPagamento(e.target.value)}
        />
        <p className="text-sm text-gray-500 mt-1">
          Os membros da pelada deverão pagar R$ {preco || '...'} até o dia {diaPagamento || '...'} de cada mês. Quem não pagar não poderá marcar participação.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-primary">Criar Nova Pelada</h1>
      <SessaoNome />
      <SessaoDias />
      <SessaoPagamento />

      <div className="flex justify-center">
        <button className="btn btn-primary" onClick={handleCriar}>
          Criar Pelada
        </button>
      </div>
    </div>
  );
}
