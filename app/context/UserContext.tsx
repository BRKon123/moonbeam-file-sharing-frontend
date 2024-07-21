import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  name: string;
  public_key: string;
  private_key: string;
}

interface UserContextType {
  user: User | null;
  switchUser: (user: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const users: User[] = [
  { name: 'John Doe', public_key: 'john@example.com', private_key: 'lalala' },
  { name: 'Jane Smith', public_key: 'jane@example.com', private_key: 'babababa' },
  { name: 'Alice Johnson', public_key: 'alice@example.com', private_key: 'hahahha' },
];

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(users[0]);

  const switchUser = (newUser: User) => {
    setUser(newUser);
  };

  return (
    <UserContext.Provider value={{ user, switchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const getUsers = () => users;
