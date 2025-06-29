import { useQuery } from "@tanstack/react-query";
import { useUser } from "../../context/userContext";
import { Link, useNavigate } from "react-router-dom";
import { getMyPeladas, getMyPeladasAsAdmin } from "../../API/routes";
import { getNextAvailableDay } from "../../utils/getNextAvailableDay";
import { getNextWeekday } from "../../utils/getNextWeekDay";
import { checkIfOpen } from "../../utils/checkIfOpen";
import { useEffect } from "react";

export default function HomeDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();

  const { data: peladasAsAdmin } = useQuery({
    queryKey: ['my-peladas-as-admin'],
    queryFn: getMyPeladasAsAdmin,
    staleTime: 1000 * 60 * 5, // cache por 5 minutos
    retry: false,
    enabled: !!user,
  });

  const { data: peladas, isLoading: isPeladasLoading } = useQuery({
    queryKey: ['my-peladas-as-member'],
    queryFn: getMyPeladas,
    staleTime: 1000 * 60 * 5, // cache por 5 minutos
    retry: false,
    enabled: !!user,
  });


  useEffect(() => {
    if (!user) {
      navigate('/inicio');
    }
  }, [user]);

  function formatePeladaDate(schedule: Array<{ day: string, hour: string }>) {
    const nextAvailableDayName = getNextAvailableDay(schedule.map(day => day.day));
    const nextAvailableDay = schedule.find(day => day.day === nextAvailableDayName);
    if (!nextAvailableDay) {
      return "Sem data definida";
    }

    const nextDate = getNextWeekday(nextAvailableDay.day, nextAvailableDay.hour);

    return nextDate.toLocaleDateString('pt-BR', { day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' });
  }

  function handleCheckIfOpen(schedule: Array<{ day: string, hour: string }>, confirmationOpenHoursBeforeEvent: number, confirmationCloseHoursFromEvent: number) {
    const nextAvailableDayName = getNextAvailableDay(schedule.map(day => day.day));
    const nextAvailableDay = schedule.find(day => day.day === nextAvailableDayName);
    if (!nextAvailableDay) { return false }

    const nextDate = getNextWeekday(nextAvailableDay.day, nextAvailableDay.hour);
    return checkIfOpen(nextDate, confirmationOpenHoursBeforeEvent, confirmationCloseHoursFromEvent);
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      {/* Título e ações rápidas */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold">Olá, {user?.name || "Usuário"} 👋</h1>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Link to="/pelada/criar" className="btn btn-primary btn-sm">➕ Nova Pelada</Link>
          <Link to="/profile" className="btn btn-outline btn-sm">⚙️ Meu Perfil</Link>
          <Link to="/peladas" className="btn btn-outline btn-sm">⚙️ Minhas Peladas</Link>
        </div>
      </header>

      {/* Informações rápidas */}
      <section className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="bg-base-100 p-4 rounded-xl shadow text-center">
          <p className="text-sm text-base-content/70">Peladas criadas</p>
          <p className="text-2xl font-bold">{peladasAsAdmin?.length || 0}</p>
        </div>
        <div className="bg-base-100 p-4 rounded-xl shadow text-center">
          <p className="text-sm text-base-content/70">Suas peladas</p>
          {/* aqui pode filtrar por data, mas vou usar o total */}
          <p className="text-2xl font-bold">{peladas?.length || 0}</p>
        </div>
        {/* <div className="bg-base-100 p-4 rounded-xl shadow text-center">
          <p className="text-sm text-base-content/70">Confirmado em</p>
          <p className="text-2xl font-bold">{peladas?.length || 0}</p>
        </div> */}
      </section>

      {/* Listagem das peladas */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Suas peladas</h2>

        {isPeladasLoading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : peladas && peladas.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {peladas.map((p) => (
              <Link
                key={p.id}
                to={`/pelada/${p.id}`}
                className="bg-base-100 p-4 rounded-xl shadow hover:shadow-lg transition flex flex-col gap-2"
              >
                <h3 className="text-lg font-bold">{p.name}</h3>

                <p className="text-sm text-base-content/70">
                  🕒 {formatePeladaDate(p.schedule!) || "Sem data definida"}
                </p>

                <p className="text-sm text-base-content/70">
                  💰 Dia de pagamento: {p.paymentDay ? `Dia ${p.paymentDay}` : "Não definido"}
                </p>

                <p className="text-sm font-semibold">
                  {
                    handleCheckIfOpen(p.schedule, p.confirmationOpenHoursBeforeEvent, p.confirmationCloseHoursFromEvent) ? (
                      <span className="text-green-600">🔓 Aberta para confirmação</span>
                    ) : (
                      <span className="text-gray-500">🔒 Fechada</span>
                    )
                  }
                  {false && (
                    <span className="text-red-600">❌ Cancelada</span>
                  )}
                </p>

                <button className="btn btn-sm btn-outline mt-2">Ver detalhes da pelada</button>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-base-content/70">Você ainda não tem peladas criadas ou confirmadas.</p>
        )}
      </section>
    </div>
  );
}
