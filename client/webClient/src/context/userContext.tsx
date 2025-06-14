// context/UserContext.tsx
import React, { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserdata } from '../API/routes';
import type User from '../modules/User';

interface UserContextType {
  user: User | undefined;
  isLoading: boolean;
  syncUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: user, isLoading, refetch } = useQuery<User>({
    queryKey: ['user'],
    queryFn: getUserdata,
    staleTime: 1000 * 60 * 5, // cache por 5 minutos
    retry: false,
  });

  const syncUser = async () => {
    refetch();
  };

  const logout = async () => {
    queryClient.removeQueries({ queryKey: ['user'] });
  };

  return (
    <UserContext.Provider value={{ user, isLoading, syncUser, logout }}>
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
