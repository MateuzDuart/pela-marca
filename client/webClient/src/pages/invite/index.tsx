import { useParams, useNavigate } from 'react-router-dom';
import { translateRole, translateWeekDays } from '../../utils/translate';
import { formatHour } from '../../utils/formatHour';
import { getPeladaInviteData, sendInvite } from '../../API/routes';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { PeladaInviteDTO } from '../../DTO/PeladaInviteDTO';
import toast from 'react-hot-toast';

export default function InvitePage() {
  const { id: peladaId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: pelada, isLoading } = useQuery<PeladaInviteDTO>({
    queryKey: ['pelada'],
    queryFn: () => getPeladaInviteData(peladaId!),
    retry: false
  })

  const mutation = useMutation({
    mutationFn: () => sendInvite(peladaId!),
    onSuccess: (res) => {
      toast.success(res.message || 'Convite enviado com sucesso.');
      pelada!.status = 'pedding'; 
    },
    onError: (err: any) => {
      toast.error(err.response?.data.message || 'Erro ao enviar o convite.');
    }
  })

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="loading loading-spinner text-primary" />
      </div>
    );
  }

  if (!pelada) {
    return (
      <div className="h-screen flex items-center justify-center text-center px-4">
        <div className="space-y-3">
          <p className="text-xl font-semibold text-red-600">Convite inválido ou expirado</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>Voltar para o início</button>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-2xl mx-auto p-4 space-y-10">
      {/* Banner com logo e informações */}
      <div className="relative rounded-xl overflow-visible">
        <img
          src={pelada.banner || "/banner_futebol.jpg"}
          alt="Banner da Pelada"
          className="w-full h-48 object-cover rounded-xl"
        />
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/70 to-transparent" style={{ borderRadius: '0 0 10px 10px' }}></div>

        {/* Logo redonda centralizada, meio pra fora */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <img
            src={pelada.picture || "/futebol-desenho.png"}
            alt="Logo da pelada"
            className="w-32 h-32 rounded-full border-4 border-white shadow-xl"
          />
        </div>
      </div>

      {/* Informações da pelada */}
      <div className="mt-16 text-center space-y-1">
        <h1 className="text-2xl font-bold">{pelada.name}</h1>
        <p className="text-sm text-gray-600">
          {
            pelada.price ? (
              `R$ ${pelada.price} por mês - pagamento no dia ${pelada.payment_day}`
            ) : (
              "A pelada é gratuita"
            )
          }
        </p>
      </div>

      {/* Botão de entrada */}
      <div className="text-center">
        {
          pelada.status ? (
            pelada.status === 'accepted' ? (
              <p className="text-success font-semibold">Você já é membro desta pelada</p>
            ) : pelada.status === 'unsent' ? (
              <button className="btn btn-primary" onClick={() => mutation.mutate()}>Entrar na pelada</button>
            ) : (
              <p className="text-warning font-semibold">Aguardando aceitação...</p>
            )
          ) : (
            <div className='space-y-2'>
              <p className="text-sm font-semibold">
                Para entrar na pelada você precisar entrar na sua conta no Pela Marca.<br />
                Clique no botão abaixo para entrar
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/login')}>Entrar na sua conta</button>
            </div>
          )
        }
      </div>

      {/* Agenda */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Agenda</h2>
        <ul className="space-y-2">
          {pelada.schedule.map((schedule) => (
            <li key={schedule.day} className="flex justify-between border-b pb-1">
              <span className="capitalize">{translateWeekDays(schedule.day)}</span>
              <span className="font-mono">{formatHour(schedule.hour)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Administradores */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Administradores</h2>
        <div className="space-y-3">
          {pelada.members.map((member, idx) => (
            <div key={idx} className="flex items-center space-x-4">
              <img
                src={member.user.picture}
                alt={member.user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{member.user.name}</p>
                <p className="text-sm text-gray-500">{translateRole(member.role)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
