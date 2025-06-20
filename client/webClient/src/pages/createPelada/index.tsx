import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { DaysOfTheWeek, type schedule } from '../../modules/schedule';
import { translateWeekDays } from '../../utils/translate';
import { createPelada } from '../../API/routes';
import { useNavigate } from 'react-router-dom';

const defaultSchedule: schedule = Object.values(DaysOfTheWeek).reduce((acc, day) => {
  acc[day] = { hour: '', isActive: false };
  return acc;
}, {} as schedule);

export default function CreatePeladaPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState<schedule>(defaultSchedule);
  const [paymentDay, setPaymentDay] = useState('');
  const [price, setPrice] = useState('');

  const handleCreate = () => {
    const allScheduleHasCorrectHour = Object.values(schedule)
      .filter((day) => day.isActive)
      .every((day) => day.hour !== '');

    if (!allScheduleHasCorrectHour) {
      toast.error('Todos os agendamentos devem ter uma horário válida.');
      return;
    }

    const activeSchedule = {} as schedule;
    for (const day in schedule) {
      if (schedule[day as DaysOfTheWeek].isActive) {
        activeSchedule[day as DaysOfTheWeek] = schedule[day as DaysOfTheWeek];
      }
    }

    createPelada({
      name,
      schedule: activeSchedule,
      paymentDay: Number(paymentDay),
      price: Number(price),
    })
      .then((res) => {
        toast.success(res.message);
        navigate('/');
      })
      .catch((err) => {
        toast.error(err.response.data.message || 'Erro ao criar a pelada.');
      });
  };

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-primary">Criar Nova Pelada</h1>
      <SectionName name={name} setName={setName} />
      <SectionSchedule schedule={schedule} setSchedule={setSchedule} />
      <SectionPayment
        price={price}
        setPrice={setPrice}
        paymentDay={paymentDay}
        setPaymentDay={setPaymentDay}
      />
      <div className="flex justify-center">
        <button className="btn btn-primary" onClick={handleCreate}>
          Create Game
        </button>
      </div>
    </div>
  );
}

const SectionName = ({ name, setName }: { name: string; setName: (name: string) => void }) => (
  <div className="bg-base-100 p-4 rounded-lg shadow space-y-2">
    <h2 className="text-lg font-semibold">Nome da Pelada</h2>
    <input
      type="text"
      className="input input-bordered w-full max-w-md"
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Digite o nome da pelada"
    />
  </div>
);

const SectionSchedule = ({
  schedule,
  setSchedule,
}: {
  schedule: schedule;
  setSchedule: React.Dispatch<React.SetStateAction<schedule>>;
}) => (
  <div className="bg-base-100 p-4 rounded-lg shadow space-y-4">
    <h2 className="text-lg font-semibold">Agendamento da semana</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {Object.entries(schedule).map(([day, { hour, isActive }]) => (
        <div key={day} className="space-y-1">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={isActive}
              onChange={(e) =>
                setSchedule((prev) => ({
                  ...prev,
                  [day]: {
                    ...prev[day as DaysOfTheWeek],
                    isActive: e.target.checked,
                  },
                }))
              }
            />
            <span className="label-text capitalize">
              {translateWeekDays(day).toLowerCase()}
            </span>
          </label>
          {isActive && (
            <input
              type="time"
              className="input input-bordered w-full max-w-xs"
              value={hour}
              onChange={(e) =>
                setSchedule((prev) => ({
                  ...prev,
                  [day]: {
                    ...prev[day as DaysOfTheWeek],
                    hour: e.target.value,
                  },
                }))
              }
            />
          )}
        </div>
      ))}
    </div>
  </div>
);

const SectionPayment = ({
  price,
  setPrice,
  paymentDay,
  setPaymentDay,
}: {
  price: string;
  setPrice: (val: string) => void;
  paymentDay: string;
  setPaymentDay: (val: string) => void;
}) => (
  <div className="bg-base-100 p-4 rounded-lg shadow space-y-4">
    <h2 className="text-lg font-semibold">Informações de pagamento</h2>
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">Preço</span>
      </label>
      <input
        type="number"
        placeholder="R$"
        min={0}
        className="input input-bordered"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
    </div>
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">Dia de pagamento</span>
      </label>
      <input
        type="number"
        min={1}
        max={31}
        placeholder="Ex: 5"
        className="input input-bordered"
        value={paymentDay}
        onChange={(e) => setPaymentDay(e.target.value)}
      />
      <p className="text-sm text-gray-500 mt-1">
        Os memembros devem pagar R${price || '...'} até o dia {paymentDay || '...'} todo mês. Quem
        não pagar até o dia {paymentDay || '...'} não podera confirmar participação.
      </p>
    </div>
  </div>
);
