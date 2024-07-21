
"use client";

import { getUsers, useUser } from '../context/UserContext';

const AdminMenu = ({ onClose }: { onClose: () => void }) => {
  const { switchUser } = useUser();
  const users = getUsers();

  const handleSwitchUser = (name: string) => {
    const selectedUser = users.find(user => user.name === name);
    if (selectedUser) {
      switchUser(selectedUser);
      onClose();
    }
  };

  return (
    <div className="fixed bottom-0 right-0 bg-white shadow-md p-4 rounded-tl-lg">
      <h2 className="text-lg font-bold mb-2">Admin Menu</h2>
      <ul className="space-y-2">
        {users.map(user => (
          <li key={user.name}>
            <button
              onClick={() => handleSwitchUser(user.name)}
              className="w-full text-left bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg"
            >
              {user.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminMenu;
