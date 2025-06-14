import { useState } from 'react';
import { FaCopy } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import styles from './styles.module.css';

function daisyToast(message: string, type: 'success' | 'error') {
  toast.custom(
    <div className={`alert ${type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
      <span>{message}</span>
    </div>,
    { duration: 3000 }
  );
}

export default function GerenciarPeladasPage() {
  const peladas = [
    { id: 1, nome: 'Pelada da Quinta' },
    { id: 2, nome: 'Pelada do Bairro' },
  ];

  const membros = [
    { id: 1, nome: 'João', avatar: 'https://i.pravatar.cc/100?img=1', status: 'Em dia' },
    { id: 2, nome: 'Maria', avatar: 'https://i.pravatar.cc/100?img=2', status: 'Devendo' },
  ];

  const convites = [
    { id: 1, nome: 'Carlos', email: 'carlos@example.com' },
    { id: 2, nome: 'Ana', email: 'ana@example.com' },
  ];

  const [peladaSelecionada, setPeladaSelecionada] = useState(peladas[0].id);
  const [modalAberto, setModalAberto] = useState(false);
  const [membroSelecionado, setMembroSelecionado] = useState<any>(null);
  const [diasPelada, setDiasPelada] = useState({ segunda: '', terca: '', quarta: '', quinta: '', sexta: '', sabado: '', domingo: '' });
  const [evento, setEvento] = useState({ abertura: '', fechamento: '' });
  const [precoMensal, setPrecoMensal] = useState('');
  const [diaPagamento, setDiaPagamento] = useState('');

  const handleSalvar = () => daisyToast('Informações salvas!', 'success');
  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://pelada.com/convite/12345');
    daisyToast('Link copiado!', 'success');
  };

  const abrirModal = (membro: any) => { setMembroSelecionado(membro); setModalAberto(true); };
  const confirmarPagamento = () => { daisyToast(`Pagamento confirmado de ${membroSelecionado.nome}`, 'success'); setModalAberto(false); };
  const excluirMembro = () => { daisyToast(`${membroSelecionado.nome} removido da pelada`, 'error'); setModalAberto(false); };
  const aceitarConvite = (_id: number) => daisyToast('Convite aceito!', 'success');
  const rejeitarConvite = (_id: number) => daisyToast('Convite rejeitado', 'error');

  const SelectPelada = () => (
    <div className="form-control">
      <label className="label"><span className="label-text">Selecione uma pelada</span></label>
      <select className="select select-bordered" value={peladaSelecionada} onChange={(e) => setPeladaSelecionada(Number(e.target.value))}>
        {peladas.map((p) => (<option key={p.id} value={p.id}>{p.nome}</option>))}
      </select>
    </div>
  );

  const ConviteLink = () => (
    <div className="bg-base-100 p-4 rounded-lg shadow space-y-2">
      <h2 className="text-lg font-semibold">Convidar Pessoas</h2>
      <div className="flex items-center gap-2 flex-wrap">
        <input className="input input-bordered w-full max-w-md" value="https://pelada.com/convite/12345" readOnly />
        <button className="btn btn-outline" onClick={handleCopyLink}><FaCopy /></button>
      </div>
    </div>
  );

  const InfoPelada = () => (
    <div className="bg-base-100 p-4 rounded-lg shadow space-y-4">
      <h2 className="text-lg font-semibold">Informações da Pelada</h2>

      <div className="form-control w-full max-w-xs">
        <label className="label" htmlFor="precoMensal">
          <span className="label-text">Preço Mensal</span>
        </label>
        <input
          id="precoMensal"
          type="number"
          placeholder="R$"
          className="input input-bordered"
          value={precoMensal}
          min={0}
          onChange={(e) => setPrecoMensal(e.target.value)}
        />
      </div>

      <div className="form-control w-full max-w-xs">
        <label className="label" htmlFor="diaPagamento">
          <span className="label-text">Dia do Pagamento</span>
        </label>
        <input
          id="diaPagamento"
          type="number"
          placeholder="Ex: 5"
          className="input input-bordered"
          value={diaPagamento}
          min={1}
          max={31}
          onChange={(e) => setDiaPagamento(e.target.value)}
        />
      </div>
      <p className="text-sm text-base-content/70">
        Os usuários devem pagar R${precoMensal || 'X'} por mês. O pagamento deverá ser feito até o dia {diaPagamento || 'X'} quem não pagar, não pode confirmar participação. 
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(diasPelada).map(([dia, horario]) => (
          <div key={dia} className="space-y-1">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="checkbox" checked={!!horario} onChange={(e) => setDiasPelada((prev) => ({ ...prev, [dia]: e.target.checked ? '19:00' : '' }))} />
              <span className="label-text capitalize">{dia}</span>
            </label>
            {horario && (
              <input type="time" className="input input-bordered w-full max-w-xs" value={horario} onChange={(e) => setDiasPelada((prev) => ({ ...prev, [dia]: e.target.value }))} />
            )}
          </div>
        ))}
      </div>

      <button onClick={handleSalvar} className="btn btn-primary mt-4">Salvar Informações</button>
    </div>
  );

  const InfoEventos = () => (
    <div className="bg-base-100 rounded-xl shadow p-4 space-y-4">
      <h2 className="text-lg font-semibold">Informações dos Eventos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label"><span className={`label-text ${styles.textWrap}`}>Prazo de Abertura (horas antes do evento)</span></label>
          <input type="number" min={0} className="input input-bordered w-full max-w-xs" value={evento.abertura} onChange={(e) => setEvento({ ...evento, abertura: e.target.value })} />
        </div>
        <div>
          <label className="label"><span className={`label-text ${styles.textWrap}`}>Prazo de Fechamento (horas após o evento)</span></label>
          <input type="number" className="input input-bordered w-full max-w-xs" value={evento.fechamento} onChange={(e) => setEvento({ ...evento, fechamento: e.target.value })} />
        </div>
      </div>
      <p className="text-sm text-base-content/70">
        Os usuários poderão confirmar ou desconfirmar presença até {evento.abertura || 'X'} horas antes do evento. O fechamento ocorrerá {evento.fechamento || 'X'} horas após o início do evento.
      </p>
      <button onClick={handleSalvar} className="btn btn-primary mt-4">Salvar Informações</button>
    </div>
  );

  const ConvitesList = () => (
    <div className="bg-base-100 rounded-xl shadow p-4 space-y-4">
      <h2 className="text-lg font-semibold">Convites ({convites.length})</h2>
      <ul className="divide-y">
        {convites.map((convite) => (
          <li key={convite.id} className="flex flex-wrap items-center justify-between py-3 gap-2">
            <div>
              <p className="font-medium">{convite.nome}</p>
              <p className="text-sm text-base-content/70">{convite.email}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button className="btn btn-sm btn-success" onClick={() => aceitarConvite(convite.id)}>Aceitar</button>
              <button className="btn btn-sm btn-error" onClick={() => rejeitarConvite(convite.id)}>Rejeitar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  const MembrosList = () => (
    <div className="bg-base-100 rounded-xl shadow p-4 space-y-4">
      <h2 className="text-lg font-semibold">Membros</h2>
      <ul className="divide-y">
        {membros.map((m) => (
          <li key={m.id} className="flex items-center gap-4 p-3 hover:bg-base-200 cursor-pointer" onClick={() => abrirModal(m)}>
            <div className="avatar"><div className="w-10 rounded-full"><img src={m.avatar} /></div></div>
            <div className="flex-1"><p>{m.nome}</p></div>
            <span className={`badge ${m.status === 'Em dia' ? 'badge-success' : 'badge-error'}`}>{m.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const MembroModal = () => (
    modalAberto && membroSelecionado && (
      <dialog open className="modal modal-open">
        <div className="modal-box">
          <div className="flex flex-col items-center gap-4">
            <div className="avatar"><div className="w-20 rounded-full"><img src={membroSelecionado.avatar} /></div></div>
            <p className="text-xl font-semibold">{membroSelecionado.nome}</p>
            <div className="flex flex-col gap-3 w-full">
              <button className="btn btn-success" onClick={confirmarPagamento}>Confirmar Pagamento</button>
              <button className={`btn ${membroSelecionado.admin ? 'btn-warning' : 'btn-info'}`} onClick={() => {
                setMembroSelecionado((prev: any) => ({ ...prev!, admin: !prev?.admin }));
                toast.success(membroSelecionado.admin ? 'Removido como administrador' : 'Adicionado como administrador');
                setModalAberto(false);
              }}>
                {membroSelecionado.admin ? 'Remover de Administrador' : 'Tornar Administrador'}
              </button>
              <button className="btn btn-error" onClick={excluirMembro}>Excluir da Pelada</button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={() => setModalAberto(false)}>
          <button>close</button>
        </form>
      </dialog>
    )
  );

  return (
    <div className="p-6 space-y-8">
      <SelectPelada />
      <ConviteLink />
      <InfoPelada />
      <InfoEventos />
      <ConvitesList />
      <MembrosList />
      <MembroModal />
    </div>
  );
}
