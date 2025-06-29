import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelConfirmAttendance, confirmAttendance, getPeladaData } from '../../API/routes';
import { getNextWeekday } from '../../utils/getNextWeekDay';
import type { PeladaPageDTO } from '../../DTO/PeladaPageDTO';
import { useUser } from '../../context/userContext';
import { useEffect, useState } from 'react';
import { translatePaymentStatus, translateWeekDays } from '../../utils/translate';
import toast from 'react-hot-toast';
import { getNextAvailableDay } from '../../utils/getNextAvailableDay';
import { API_URL } from '../../config';

export default function PeladaPage() {
  const { id } = useParams();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [isUserConfirmed, setConfirmados] = useState(false);
  const [isEventActive, setEventActive] = useState(false);
  const [nextPeladaDate, setNextPeladaDate] = useState<Date | null>(null);

  const { data: peladaData, isLoading, isError, error } = useQuery({
    queryKey: ['pelada', id],
    queryFn: () => getPeladaData(id!),
    enabled: !!id,
    retry: false,
  });

  const confirmAttendanceMutation = useMutation({
    mutationFn: confirmAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pelada', id!] });
      setConfirmados(true);
      toast.success('Confirmado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || 'Erro ao confirmar presença.');
    },
  });

  const cancelAttendanceMutation = useMutation({
    mutationFn: cancelConfirmAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pelada', id!] });
      setConfirmados(false);
      toast.success('Cancelado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || 'Erro ao cancelar presença.');
    },
  });


  useEffect(() => {
    function isUserConfirmed(data: PeladaPageDTO): boolean {
      const userFound = data.attendance_list.find((userFromList) => userFromList.id === user?.id)
      return !!userFound;
    }

    function isEventActive(eventDay: Date, confirmationOpenHours: number, confirmationCloseHours: number) {
      const now = new Date();
      const eventDate = new Date(eventDay);
      const openDate = new Date(eventDate.getTime() - confirmationOpenHours * 60 * 60 * 1000);
      const closeDate = new Date(eventDate.getTime() + confirmationCloseHours * 60 * 60 * 1000);
      return now >= openDate && now <= closeDate;
    }

    if (peladaData) {
      setConfirmados(isUserConfirmed(peladaData));

      if (peladaData.schedule.length > 0) {
        const nextAvailableDayName = getNextAvailableDay(peladaData.schedule.map(day => day.day))
        const nextAvailableDay = peladaData.schedule.find(day => day.day === nextAvailableDayName);
        if (!nextAvailableDay) {
          setNextPeladaDate(null);
          setEventActive(false);
          return;
        }
        const nextEventDate = getNextWeekday(nextAvailableDay.day, nextAvailableDay.hour);
        setNextPeladaDate(nextEventDate);
        const eventActive = isEventActive(nextEventDate, peladaData.confirmation_open_hours_before_event, peladaData.confirmation_close_hours_from_event);
        setEventActive(eventActive);
      }
    }
  }, [peladaData, user]);



  function getPaymentBadge(data: PeladaPageDTO) {
    let paymentStatus = ""

    if (data.payment_status === "paid") {
      paymentStatus = "badge-success";
    } else if (data.payment_status === "pending") {
      paymentStatus = "badge-warning";
    } else if (data.payment_status === "late") {
      paymentStatus = "badge-error";
    }

    return (
      <span className={`badge ${paymentStatus}`}>
        {translatePaymentStatus(data.payment_status)}
      </span>
    )
  }

  function getDateOfOpeningConfirmation(confirmationOpenHours: number): string {
    if (!nextPeladaDate) {
      return "Data não disponível";
    }
    return new Date(nextPeladaDate.getTime() - confirmationOpenHours * 60 * 60 * 1000)
      .toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  const formatData = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return <div className="text-center p-4">Carregando...</div>;
  }

  if (isError) {
    return <div className="text-center p-4">{(error as any).response?.data.message || "Erro ao carregar a pelada."}</div>;
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 space-y-8">
      {/* Cabeçalho */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">{peladaData?.name.toUpperCase()}</h1>
        <p className="text-base-content">{peladaData?.schedule[0]?.day ? `Data do evento atual: ${nextPeladaDate ? formatData(nextPeladaDate!) : ''}` : 'Nenhum evento ativo'}</p>
      </div>

      {
        !isEventActive && (
          <div className="text-center">
            <p className="text-base-content/70">
              A lista de presença vai está disponível para confirmação {peladaData?.confirmation_open_hours_before_event} horas antes do evento.<br />
              Ás {getDateOfOpeningConfirmation(peladaData?.confirmation_open_hours_before_event!)}
            </p>
          </div>
        )
      }



      {/* Sessão 1: Presença */}
      <section className="bg-base-100 rounded-xl shadow-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Lista de Presença</h2>
          <span className="badge badge-primary text-white">
            {peladaData?.attendance_list.length} Confirmados
          </span>
        </div>

        {isEventActive ? (
          <>
            {!isUserConfirmed ? (
              <button onClick={() => confirmAttendanceMutation.mutate(id!)} className="btn btn-success btn-block">
                Confirmar Presença
              </button>
            ) : (
              <button
                onClick={() => cancelAttendanceMutation.mutate(id!)}
                className="btn btn-warning btn-block"
              >
                Cancelar Confirmação
              </button>
            )}

            <ul className="space-y-2">
              {
                peladaData?.attendance_list
                  .map((m) => (
                    <li key={m.id} className="flex items-center gap-3 p-2 rounded bg-success/20">
                      <div className="avatar">
                        <div className="w-10 rounded-full">
                          <img src={m.picture ? `${API_URL}/images/${m.picture}` : '/default_user.png'}
                            alt="avatar"
                            onError={(e) => {
                              e.currentTarget.onerror = null; // evita loop infinito
                              e.currentTarget.src = '/default_user.png'; // ou alguma URL pública válida
                            }}
                          />
                        </div>
                      </div>
                      <span>{m.name}</span>
                    </li>
                  ))
              }
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
          {
            getPaymentBadge(peladaData!)
          }
        </p>
        {/* <p>
          <strong>Último Pagamento:</strong>
        </p> */}
      </section>

      {/* Sessão 3: Próximos Eventos */}
      <section className="bg-base-100 rounded-xl shadow-md p-6 space-y-3">
        <h2 className="text-xl font-semibold">Próximos Eventos</h2>
        {peladaData?.schedule.map((date, i) => (
          <div key={i} className="flex justify-between border-b py-2">
            <span>{translateWeekDays(date.day)}</span>
            <span className="text-sm text-base-content/70">
              {formatData(getNextWeekday(date.day, date.hour))}
            </span>
          </div>
        ))}
      </section>

      {/* Sessão 4: Membros */}
      <section className="bg-base-100 rounded-xl shadow-md p-6 space-y-3">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Membros</h2>
          <span className="badge badge-outline">{peladaData?.members_list.length} membros</span>
        </div>
        <ul className="space-y-3">
          {peladaData?.members_list.map((m, i) => (
            <li key={i} className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img src={m.picture ? `${API_URL}/images/${m.picture}` : '/default_user.png'}
                      alt="avatar"
                      onError={(e) => {
                        e.currentTarget.onerror = null; // evita loop infinito
                        e.currentTarget.src = '/default_user.png'; // ou alguma URL pública válida
                      }}
                    />
                </div>
              </div>
              <span>{m.name}</span>
            </li>
          ))}
        </ul>
      </section>
    </div >
  );
}
