import { ITripulante } from "@/services/ambulancia.service";

interface UserListProps {
  users: ITripulante[];
  selectedUser: ITripulante | null;
  onSelectUser: (user: ITripulante) => void;
}

const UserList: React.FC<UserListProps> = ({ users = [], selectedUser, onSelectUser }) => {
  if (!Array.isArray(users)) {
    return (
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-4">
        <p className="text-gray-500">No hay usuarios disponibles</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Usuarios Disponibles</h2>
        <p className="text-gray-500">No hay usuarios disponibles en este momento</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Usuarios Disponibles</h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li
            key={user.id}
            onClick={() => onSelectUser(user)}
            className={`p-2 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-blue-50 ${
              selectedUser?.id === user.id 
                ? "bg-blue-500 text-white hover:bg-blue-600" 
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {user.nombre || 'Usuario sin nombre'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;