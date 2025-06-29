import { useEffect, useState } from 'react';
import { FaCopy } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import styles from './styles.module.css';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type Pelada from '../../modules/Pelada';
import { acceptInvite, cancelPaymentPending, deletePelada, exludeMember, getInvites, getMembersAsAdmin, getMyPeladasAsAdmin, getPeladaAsAdmin, rejectInvite, removeAdminRole, setAdminRole, setPaymentPaid, setPaymentPending, updatePeladaInformations } from '../../API/routes';
import { DaysOfTheWeek, type schedule } from '../../modules/schedule';
import type { Member } from '../../modules/Member';
import type { Invite } from '../../modules/Invite';
import { translateWeekDays } from '../../utils/translate';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import { useSearchParams } from 'react-router-dom';

const defaultSchedule: schedule = Object.values(DaysOfTheWeek).reduce((acc, day) => {
  acc[day] = { hour: '', isActive: false };
  return acc;
}, {} as schedule);
function daisyToast(message: string, type: 'success' | 'error') {
  if (type === 'success') {
    toast.success(message, { duration: 3000 });
  } else {
    toast.error(message, { duration: 3000 });
  }
}

export default function ManagerPeladasPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const { data: peladas, isLoading: isPeladasLoading } = useQuery<Pelada[]>({
    queryKey: ['my-peladas-as-admin'],
    queryFn: getMyPeladasAsAdmin,
    retry: false,
  })

  const [selectedPelada, setSelectedPelada] = useState<string | undefined>(id || undefined);
  const [confirmationOpenHoursBeforeEvent, setConfirmationOpenHoursBeforeEvent] = useState<number | undefined>(undefined);
  const [confirmationCloseHoursFromEvent, setConfirmationCloseHoursFromEvent] = useState<number | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    if (peladas && peladas.length > 0) {
      if (id) {
        const pelada = peladas.find((pelada) => pelada.id === id);
        if (pelada) {
          setSelectedPelada(pelada.id);
          return
        }
      }
      setSelectedPelada(peladas[0].id);
    }
  }, [peladas]);

  const deletePeladaMutation = useMutation({
    mutationFn: (idPelada: string) => deletePelada(idPelada),
    onSuccess: () => {
      daisyToast('Pelada excluída com sucesso!', 'success');
      setSelectedPelada(undefined);
      queryClient.invalidateQueries({ queryKey: ['my-peladas-as-admin'] });
      queryClient.invalidateQueries({ queryKey: ['my-peladas-as-member'] });
    },
    onError: (err) => {
      const errorMessage = (err as any)?.response?.data?.message || 'Erro ao excluir a pelada.';
      daisyToast(errorMessage, 'error');
    }
  });

  async function handleDeletePelada() {
    const confirmed = window.confirm('Tem certeza que deseja excluir esta pelada? Esta ação não pode ser desfeita.');
    if (!confirmed || !selectedPelada) return;
    deletePeladaMutation.mutate(selectedPelada);
  }

  if (isPeladasLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!peladas || peladas.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Gerenciar Peladas</h1>
        <p className="text-base-content/70">Você ainda não tem nenhuma pelada criada ou não é um administrador em algumaoutra pelada.<br /> Crie uma nova pelada para começar a gerenciar.</p>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/pelada/criar')}>
          Criar Pelada
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <SelectPelada
        selectedPelada={selectedPelada}
        setSelectedPelada={setSelectedPelada}
        peladas={peladas}
        isPeladasLoading={isPeladasLoading} />

      <ConviteLink selectedPeladaId={selectedPelada} />
      <InfoPelada
        setConfirmationCloseHoursFromEvent={setConfirmationCloseHoursFromEvent}
        setConfirmationOpenHoursBeforeEvent={setConfirmationOpenHoursBeforeEvent}
        selectedPeladaId={selectedPelada} />
      <InfoEventos
        selectedPeladaId={selectedPelada}
        confirmationOpenHoursBeforeEvent={confirmationOpenHoursBeforeEvent}
        confirmationCloseHoursFromEvent={confirmationCloseHoursFromEvent}
      />
      <ConvitesList selectedPeladaId={selectedPelada} />
      <MembrosList
        selectedPeladaId={selectedPelada}
      />
      <div className='flex justify-center'>
        <button className='btn btn-error' onClick={handleDeletePelada}>Excluir Pelada</button>
      </div>
    </div>
  );
}

function SelectPelada({ selectedPelada, setSelectedPelada, peladas, isPeladasLoading }: {
  selectedPelada: string | undefined,
  setSelectedPelada: React.Dispatch<React.SetStateAction<string | undefined>>
  peladas: Pelada[] | undefined,
  isPeladasLoading: boolean
}) {

  return (
    <div className="form-control">
      <label className="label"><span className="label-text">Selecione uma pelada</span></label>
      {
        isPeladasLoading ? (
          <div className="flex justify-center py-2">
            <span className="loading loading-spinner loading-sm text-primary"></span>
          </div>
        ) : (
          <select className="select select-bordered" value={selectedPelada || ''} onChange={(e) => setSelectedPelada(e.target.value)}>
            {
              peladas && (
                peladas.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))
              )
            }
          </select>

        )
      }
    </div>
  );
}

function ConviteLink({ selectedPeladaId }: { selectedPeladaId: string | undefined }) {
  const link = `https://pelamarca.com/convite/${selectedPeladaId}`
  const handleCopyLink = () => {
    navigator.clipboard.writeText(link);
    daisyToast('Link copiado!', 'success');
  };

  useEffect(() => {
    console.log(selectedPeladaId);
  }, [selectedPeladaId]);
  return (
    <div className="bg-base-100 p-4 rounded-lg shadow space-y-2">
      <h2 className="text-lg font-semibold">Convidar Pessoas</h2>
      <div className="flex items-center gap-2 flex-wrap">
        {
          selectedPeladaId ? (
            <>
              <input className="input input-bordered w-full max-w-md" value={link} readOnly />
              <button className="btn btn-outline" onClick={handleCopyLink}><FaCopy /></button>
            </>
          ) : (
            <div className="flex justify-center py-2">
              <span className="loading loading-spinner loading-sm text-primary"></span>
            </div>
          )
        }
      </div>
    </div>
  );
}

function InfoPelada({ selectedPeladaId, setConfirmationOpenHoursBeforeEvent, setConfirmationCloseHoursFromEvent }: {
  selectedPeladaId: string | undefined,
  setConfirmationOpenHoursBeforeEvent: React.Dispatch<React.SetStateAction<number | undefined>>,
  setConfirmationCloseHoursFromEvent: React.Dispatch<React.SetStateAction<number | undefined>>
}) {
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [paymentDay, setPaymentDay] = useState<number | undefined>(undefined);
  const [schedule, setSchedule] = useState<schedule>(defaultSchedule);
  const { data: pelada, isLoading } = useQuery<Pelada | undefined | null>({
    queryKey: ['pelada', selectedPeladaId],
    queryFn: () => selectedPeladaId ? (getPeladaAsAdmin(selectedPeladaId) as Promise<Pelada>) : Promise.resolve(null),
    enabled: !!selectedPeladaId,
    retry: false,
  })

  const mutation = useMutation({
    mutationFn: () => updatePeladaInformations(selectedPeladaId!, {
      price,
      paymentDay,
      schedule,
    }),
    onSuccess: () => {
      daisyToast('Informações salvas!', 'success');
    },
    onError: (err) => {
      console.log(err);
      daisyToast('Erro ao salvar informações.', 'error');
    },
  })

  useEffect(() => {
    if (pelada) {
      setPrice(Number(pelada.price));
      setPaymentDay(Number(pelada.paymentDay));
      setSchedule({ ...defaultSchedule, ...pelada.schedule })
      setConfirmationOpenHoursBeforeEvent(Number(pelada.confirmationOpenHoursBeforeEvent));
      setConfirmationCloseHoursFromEvent(Number(pelada.confirmationCloseHoursFromEvent));
    }
  }, [pelada])

  return (
    <div className="bg-base-100 p-4 rounded-lg shadow space-y-4">
      <h2 className="text-lg font-semibold">Informações da Pelada</h2>
      {
        isLoading ? (
          <div className="flex justify-center py-2">
            <span className="loading loading-spinner loading-sm text-primary"></span>
          </div>
        ) : pelada ? (
          <>
            <div className="form-control w-full max-w-xs">
              <label className="label" htmlFor="precoMensal">
                <span className="label-text">Preço Mensal</span>
              </label>
              <input
                id="precoMensal"
                type="number"
                placeholder="R$"
                className="input input-bordered"
                value={price || ""}
                min={0}
                onChange={(e) => setPrice(Number(e.target.value))}
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
                value={paymentDay || ""}
                min={1}
                max={31}
                onChange={(e) => setPaymentDay(Number(e.target.value))}
              />
            </div>
            <p className="text-sm text-base-content/70">
              Os usuários devem pagar R${price || 'X'} por mês. O pagamento deverá ser feito até o dia {paymentDay || 'X'} quem não pagar, não pode confirmar participação.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(schedule).map(([day, dayData]) => (
                <div key={day} className="space-y-1">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={dayData.isActive}
                      onChange={(e) => setSchedule((prev) => ({ ...prev, [day]: { hour: dayData.hour, isActive: e.target.checked } }))}
                    />
                    <span className="label-text capitalize">{translateWeekDays(day)}</span>
                  </label>
                  {dayData.isActive && (
                    <input
                      type="time"
                      className="input input-bordered w-full max-w-xs"
                      value={dayData.hour}
                      onChange={(e) => setSchedule((prev) => ({ ...prev, [day]: { hour: e.target.value, isActive: dayData.isActive } }))}
                    />
                  )}
                </div>
              ))}
            </div>

            <button onClick={() => mutation.mutate()} className="btn btn-primary mt-4">Salvar Informações</button>
          </>
        ) : (
          <div className="flex justify-center py-2">
            <p>Pelada não encontrada</p>
          </div>
        )
      }
    </div>
  );
}

function InfoEventos({ selectedPeladaId, confirmationOpenHoursBeforeEvent, confirmationCloseHoursFromEvent }: {
  selectedPeladaId: string | undefined,
  confirmationOpenHoursBeforeEvent: number | undefined,
  confirmationCloseHoursFromEvent: number | undefined
}) {
  const [eventData, setEventData] = useState({ confirmationOpenHoursBeforeEvent, confirmationCloseHoursFromEvent });
  const mutation = useMutation({
    mutationFn: () => updatePeladaInformations(selectedPeladaId!, {
      confirmationOpenHoursBeforeEvent: eventData.confirmationOpenHoursBeforeEvent,
      confirmationCloseHoursFromEvent: eventData.confirmationCloseHoursFromEvent
    }),
    onSuccess: () => {
      daisyToast('Informações salvas!', 'success');
    },
    onError: (err) => {
      console.log(err);
      daisyToast('Erro ao salvar informações.', 'error');
    },
  })

  useEffect(() => {
    setEventData({ confirmationOpenHoursBeforeEvent, confirmationCloseHoursFromEvent });
  }, [confirmationOpenHoursBeforeEvent, confirmationCloseHoursFromEvent]);

  return (
    <div className="bg-base-100 rounded-xl shadow p-4 space-y-4">
      <h2 className="text-lg font-semibold">Informações dos Eventos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">
            <span className={`label-text ${styles.textWrap}`}>Prazo de Abertura (horas antes do evento)</span>
          </label>
          <input
            type="number" min={0}
            className="input input-bordered w-full max-w-xs"
            value={eventData.confirmationOpenHoursBeforeEvent || ""}
            onChange={(e) => setEventData({ ...eventData, confirmationOpenHoursBeforeEvent: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="label">
            <span className={`label-text ${styles.textWrap}`}>Prazo de Fechamento (horas após o evento)</span>
          </label>
          <input
            type="number"
            className="input input-bordered w-full max-w-xs"
            value={eventData.confirmationCloseHoursFromEvent || ""}
            onChange={(e) => setEventData({ ...eventData, confirmationCloseHoursFromEvent: Number(e.target.value) })}
          />
        </div>
      </div>
      <p className="text-sm text-base-content/70">
        Os usuários poderão confirmar ou desconfirmar presença até {eventData.confirmationOpenHoursBeforeEvent || 'X'} horas antes do evento. O fechamento ocorrerá {eventData.confirmationCloseHoursFromEvent || 'X'} horas após o início do evento.
      </p>
      <button onClick={() => mutation.mutate()} className="btn btn-primary mt-4">Salvar Informações</button>
    </div>
  );
}

function ConvitesList({ selectedPeladaId }: { selectedPeladaId: string | undefined }) {
  const queryClient = useQueryClient();
  const { data: invites, isLoading } = useQuery<Invite[]>({
    queryKey: ['invites', selectedPeladaId],
    queryFn: () => getInvites(selectedPeladaId!),
    enabled: !!selectedPeladaId,
    retry: false,
  })

  const accept = useMutation({
    mutationFn: (id: string): Promise<any> => acceptInvite(selectedPeladaId!, id),
    onSuccess: (res) => {
      daisyToast(res.message || 'Convite aceito com sucesso.', 'success');
      queryClient.invalidateQueries({ queryKey: ['invites', selectedPeladaId!] });
      queryClient.invalidateQueries({ queryKey: ['members', selectedPeladaId!] });
    },
    onError: (err) => {
      const errorMessage =
        (err as any)?.response?.data?.message ||
        err?.message ||
        'Erro ao aceitar o convite.';
      daisyToast(errorMessage, 'error');
    },
  })

  const reject = useMutation({
    mutationFn: (id: string): Promise<any> => rejectInvite(selectedPeladaId!, id),
    onSuccess: (res) => {
      daisyToast(res.message || 'Convite rejeitado com sucesso.', 'success');
      invites?.splice(invites.findIndex(invite => invite.id === res.id), 1);
    },
    onError: (err) => {
      const errorMessage =
        (err as any)?.response?.data?.message ||
        err?.message ||
        'Erro ao rejeitar o convite.';
      daisyToast(errorMessage, 'error');
    }
  })

  return (
    <div className="bg-base-100 rounded-xl shadow p-4 space-y-4">
      <h2 className="text-lg font-semibold">Convites ({invites?.length || 0})</h2>
      {
        isLoading ? (
          <div className="flex justify-center py-2">
            <span className="loading loading-spinner loading-sm text-primary"></span>
          </div>
        ) : (
          <ul className="divide-y">
            {
              invites?.map((invite) => (
                <li key={invite.id} className="flex flex-wrap items-center justify-between py-3 gap-2">
                  <div className='flex gap-2'>
                    <div className="avatar">
                      <div className="w-10 rounded-full">
                        <img src={invite.user.picture ? `${API_URL}/images/${invite.user.picture}` : '/default_user.png'}
                          alt="avatar"
                          onError={(e) => {
                            e.currentTarget.onerror = null; // evita loop infinito
                            e.currentTarget.src = '/default_user.png'; // ou alguma URL pública válida
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{invite.user.name}</p>
                      <p className="text-sm text-base-content/70">{invite.user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button className="btn btn-sm btn-success" onClick={() => accept.mutate(invite.id)}>Aceitar</button>
                    <button className="btn btn-sm btn-error" onClick={() => reject.mutate(invite.id)}>Rejeitar</button>
                  </div>
                </li>
              ))
            }
          </ul>
        )
      }
    </div>
  );
}

function MembrosList({ selectedPeladaId }: { selectedPeladaId: string | undefined }) {
  const [selectedMember, setSelectedMember] = useState<Member | undefined>(undefined);

  const { data: members, isLoading } = useQuery<Member[]>({
    queryKey: ['members', selectedPeladaId],
    queryFn: () => getMembersAsAdmin(selectedPeladaId!),
    enabled: !!selectedPeladaId,
    retry: false,
  });

  return (
    <>
      <div className="bg-base-100 rounded-xl shadow p-4 space-y-4">
        <h2 className="text-lg font-semibold">Membros</h2>
        {isLoading ? (
          <div className="flex justify-center py-2">
            <span className="loading loading-spinner loading-sm text-primary"></span>
          </div>
        ) : (
          <ul className="divide-y">
            {members?.map((m) => (
              <li
                key={m.user.id}
                className="flex items-center gap-4 p-3 hover:bg-base-200 cursor-pointer"
                onClick={() => setSelectedMember(m)}
              >
                <div className="avatar">
                  <div className="w-10 rounded-full">
                    <img src={m.user.picture ? `${API_URL}/images/${m.user.picture}` : '/default_user.png'}
                      alt="avatar"
                      onError={(e) => {
                        e.currentTarget.onerror = null; // evita loop infinito
                        e.currentTarget.src = '/default_user.png'; // ou alguma URL pública válida
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1"><p>{m.user.name}</p></div>
                {
                  m.user.paymentHistories?.[0]?.status === 'pending' ? (
                    <span className="badge badge-warning">Pendente</span>
                  ) : m.user.paymentHistories?.[0]?.status === 'paid' ? (
                    <span className="badge badge-success">Pago</span>
                  ) : (
                    <span className="badge badge-error">Não Pago</span>
                  )
                }
              </li>
            ))}
          </ul>
        )}
      </div>
      <MembroModal
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        selectedPeladaId={selectedPeladaId}
      />
    </>
  )
}

function MembroModal({
  selectedMember,
  setSelectedMember,
  selectedPeladaId,
}: {
  selectedMember: Member | undefined;
  setSelectedMember: React.Dispatch<React.SetStateAction<any>>;
  selectedPeladaId: string | undefined;
}) {
  const queryClient = useQueryClient();

  const exclude = useMutation({
    mutationFn: (memberId: string): Promise<any> =>
      exludeMember(selectedPeladaId!, memberId),
    onSuccess: (res) => {
      daisyToast(res.message || 'Usuário excluído com sucesso.', 'success');
      queryClient.invalidateQueries({ queryKey: ['members', selectedPeladaId!] });
    },
    onError: (err) => {
      const errorMessage =
        (err as any)?.response?.data?.message ||
        err?.message ||
        'Erro ao excluir o usuário.';
      daisyToast(errorMessage, 'error');
    },
  });

  const setAdmin = useMutation({
    mutationFn: (memberId: string): Promise<any> =>
      setAdminRole(selectedPeladaId!, memberId),
    onSuccess: (res) => {
      daisyToast(res.message || 'Usuário promovido com sucesso.', 'success');
      queryClient.setQueryData(['members', selectedPeladaId!], (prev: Member[]) =>
        prev.map((m) => (m.id === res.id ? { ...m, role: 'admin' } : m))
      );
      setSelectedMember(undefined);
    },
    onError: (err) => {
      const errorMessage =
        (err as any)?.response?.data?.message ||
        err?.message ||
        'Erro ao promover o usuário.';
      daisyToast(errorMessage, 'error');
    },
  });

  const removeAdmin = useMutation({
    mutationFn: (memberId: string): Promise<any> =>
      removeAdminRole(selectedPeladaId!, memberId),
    onSuccess: (res) => {
      daisyToast(res.message || 'Usuário rebaixado com sucesso.', 'success');
      queryClient.setQueryData(['members', selectedPeladaId!], (prev: Member[]) =>
        prev.map((m) => (m.id === res.id ? { ...m, role: 'member' } : m))
      );
      setSelectedMember(undefined);
    },
    onError: (err) => {
      const errorMessage =
        (err as any)?.response?.data?.message ||
        err?.message ||
        'Erro ao rebaixar o administrador.';
      daisyToast(errorMessage, 'error');
    },
  });

  const paymentPending = useMutation({
    mutationFn: (memberId: string) => setPaymentPending(selectedPeladaId!, memberId),
    onSuccess: (res) => {
      daisyToast(res.message || 'Pagamento marcado como pendente.', 'success');
      updatePaymentStatus(res.id, 'pending');
      setSelectedMember(undefined);
    },
    onError: (err) => {
      console.error(err);
      const errorMessage =
        (err as any)?.response?.data?.message ||
        err?.message ||
        'Erro ao marcar o pagamento como pendente.';
      daisyToast(errorMessage, 'error');
    }
  });

  const cancelPaymentPendingMutate = useMutation({
    mutationFn: (memberId: string) => cancelPaymentPending(selectedPeladaId!, memberId),
    onSuccess: (res) => {
      daisyToast(res.message || 'Pagamento desmarcado como pendente.', 'success');
      updatePaymentStatus(res.id, 'unpaid');
      setSelectedMember(undefined);
    },
    onError: (err) => {
      const errorMessage =
        (err as any)?.response?.data?.message ||
        err?.message ||
        'Erro ao desmarcar o pagamento como pendente.';
      daisyToast(errorMessage, 'error');
    }
  });

  const setPaymentPaidMutate = useMutation({
    mutationFn: (memberId: string) => setPaymentPaid(selectedPeladaId!, memberId),
    onSuccess: (res) => {
      daisyToast(res.message || 'Pagamento confirmado.', 'success');
      updatePaymentStatus(res.id, 'paid');
      setSelectedMember(undefined);
    },
    onError: (err) => {
      const errorMessage =
        (err as any)?.response?.data?.message ||
        err?.message ||
        'Erro ao confirmar o pagamento.';
      daisyToast(errorMessage, 'error');
    }
  });


  function updatePaymentStatus(memberId: string, status: 'paid' | 'pending' | 'unpaid') {
    queryClient.setQueryData(['members', selectedPeladaId!], (prev: Member[]) =>
      prev.map((m) => {
        if (m.id === memberId) {
          if (m.user.paymentHistories && m.user.paymentHistories[0]) {
            m.user.paymentHistories[0].status = status;
          } else {
            m.user.paymentHistories = [{ status: status, reference_month: '' }];
          }
        }
        return m;
      })
    );
  }

  function handleDeleteMember(memberId: string) {
    exclude.mutate(memberId);
    setSelectedMember(undefined);
  }

  return (
    selectedMember && (
      <dialog open className="modal modal-open">
        <div className="modal-box">
          <div className="flex flex-col items-center gap-4">
            <div className="avatar">
              <div className="w-20 rounded-full">
                <img src={selectedMember.user.picture ? `${API_URL}/images/${selectedMember.user.picture}` : '/default_user.png'}
                  alt="avatar"
                  onError={(e) => {
                    e.currentTarget.onerror = null; // evita loop infinito
                    e.currentTarget.src = '/default_user.png'; // ou alguma URL pública válida
                  }}
                />
              </div>
            </div>
            <p className="text-xl font-semibold">{selectedMember.user.name}</p>

            {/* Sessão: Pagamento */}
            <div className="w-full">
              <h3 className="text-lg font-bold mb-2">Pagamento</h3>
              <div className="flex flex-col gap-2">
                {
                  selectedMember.user.paymentHistories?.[0]?.status === 'pending' ? (
                    <>
                      <button className="btn btn-success" onClick={() => setPaymentPaidMutate.mutate(selectedMember.id)}>
                        Confirmar Pagamento
                      </button>
                      <button className="btn btn-outline" onClick={() => cancelPaymentPendingMutate.mutate(selectedMember.id)}>
                        Cancelar Pendência
                      </button>
                    </>
                  ) : selectedMember.user.paymentHistories?.[0]?.status === 'paid' ? (
                    <p className="text-sm text-base-content/70">Pagamento confirmado</p>
                  ) : (
                    <>
                      <button className="btn btn-success" onClick={() => setPaymentPaidMutate.mutate(selectedMember.id)}>
                        Confirmar Pagamento
                      </button>
                      <button className="btn btn-warning" onClick={() => paymentPending.mutate(selectedMember.id)}>
                        Deixar como Pendente
                      </button>
                    </>
                  )
                }
              </div>
            </div>

            {/* Sessão: Administração */}
            <div className="w-full mt-6">
              <h3 className="text-lg font-bold mb-2">Administração</h3>
              <div className="flex flex-col gap-2">
                {selectedMember.role === 'member' && (
                  <button
                    className="btn btn-info"
                    onClick={() => setAdmin.mutate(selectedMember.id)}
                  >
                    Tornar Administrador
                  </button>
                )}
                {selectedMember.role === 'admin' && (
                  <button
                    className="btn btn-warning"
                    onClick={() => removeAdmin.mutate(selectedMember.id)}
                  >
                    Remover cargo de Administrador
                  </button>
                )}
                {
                  selectedMember.role === 'owner' ? (
                    <p>Sem ações</p>
                  ) : (
                    <button
                      className="btn btn-error"
                      onClick={() => handleDeleteMember(selectedMember.id)}
                    >
                      Excluir da Pelada
                    </button>
                  )
                }
              </div>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={() => setSelectedMember(undefined)}>
          <button>close</button>
        </form>
      </dialog>
    )
  );
}