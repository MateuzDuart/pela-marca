// context/UserContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyPeladas, getUserdata } from '../API/routes';
import type User from '../modules/User';
import type { DaysOfTheWeek } from '../modules/schedule';
import { logout as logoutApi } from '../API/routes';
interface UserContextType {
  user: User | undefined;
  isUserLoading: boolean;
  peladas: Array<{ id: string, name: string, schedule: Array<{ day: DaysOfTheWeek, hour: string }> }> | undefined;
  isPeladasLoading: boolean;
  syncUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const { data: user, isLoading: isUserLoading, refetch } = useQuery<User>({
    queryKey: ['user'],
    queryFn: getUserdata,
    staleTime: 1000 * 60 * 5, // cache por 5 minutos
    enabled: isAuthenticated, // só busca se estiver autenticado
    retry: false,
  });

  const { data: peladas, isLoading: isPeladasLoading } = useQuery<Array<{ id: string, name: string, schedule: Array<{ day: DaysOfTheWeek, hour: string }> }>>({
    queryKey: ['my-peladas-as-member'],
    queryFn: getMyPeladas,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const syncUser = async () => {
    refetch();
  };

  async function logout(): Promise<void> {
    await logoutApi()
    
    setIsAuthenticated(false);
    queryClient.removeQueries({ queryKey: ['user'] })
    queryClient.removeQueries({ queryKey: ['my-peladas-as-member'] })
    queryClient.removeQueries({ queryKey: ['my-peladas-as-admin'] })
  };

  return (
    <UserContext.Provider value={{ user, isUserLoading, peladas, isPeladasLoading, syncUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};
