import { useState, useEffect, useCallback } from "react";
import UserList from "@/components/Angora/UserList";
import WalkieTalkieButton from "@/components/Angora/WalkieTalkieButton";
import { ambulanciaService, ITripulante } from "@/services/ambulancia.service";
import type AgoraService from "@/services/agora.service";

const AGORA_APP_ID = '6b72f1e5e75f4bd0b658eb9d332e0d96' || "";

interface WalkieTalkieViewProps {
  initialUsers?: ITripulante[];
}

const WalkieTalkieView: React.FC<WalkieTalkieViewProps> = ({ initialUsers = [] }) => {
  const [users, setUsers] = useState<ITripulante[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<ITripulante | null>(null);
  const [agoraService, setAgoraService] = useState<AgoraService | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!initialUsers.length);
  const [isClient, setIsClient] = useState(false);
  const [isSomeoneTransmitting, setIsSomeoneTransmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!initialUsers.length) {
      const loadUsers = async () => {
        try {
          setIsLoading(true);
          const loadedUsers = await ambulanciaService.getTripulantes();
          setUsers(loadedUsers || []);
        } catch (err) {
          console.error('Error loading users:', err);
          setError('Error al cargar la lista de usuarios');
        } finally {
          setIsLoading(false);
        }
      };

      loadUsers();
    }
  }, [initialUsers]);

  useEffect(() => {
    if (!isClient) return;

    const initAgoraService = async () => {
      try {
        const { default: AgoraService } = await import('@/services/agora.service');
        const service = new AgoraService(AGORA_APP_ID);
        
        // Configurar los event listeners para el audio entrante
        service.on('userPublished', (user, mediaType) => {
          if (mediaType === 'audio') {
            setIsSomeoneTransmitting(true);
          }
        });

        service.on('userUnpublished', (user, mediaType) => {
          if (mediaType === 'audio') {
            setIsSomeoneTransmitting(false);
          }
        });

        setAgoraService(service);
      } catch (err) {
        console.error('Error initializing Agora service:', err);
        setError('Error al inicializar el servicio de comunicación');
      }
    };

    initAgoraService();

    return () => {
      if (agoraService) {
        agoraService.leaveChannel().catch(console.error);
      }
    };
  }, [isClient]);

  const handleSelectUser = useCallback(async (user: ITripulante) => {
    if (!agoraService) return;

    try {
      setIsConnecting(true);
      setError(null);
      setSelectedUser(user);

      const res = await fetch(`/api/generateToken?channel=canal_${user.id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al generar el token');
      }
      
      const { token } = await res.json();
      await agoraService.joinChannel(`canal_${user.id}`, token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con el usuario');
      setSelectedUser(null);
    } finally {
      setIsConnecting(false);
    }
  }, [agoraService]);

  const startTransmission = useCallback(() => {
    if (!agoraService) return;
    try {
      agoraService.enableAudio();
    } catch (err) {
      console.error('Error al iniciar transmisión:', err);
      setError('Error al iniciar la transmisión');
    }
  }, [agoraService]);

  const stopTransmission = useCallback(() => {
    if (!agoraService) return;
    try {
      agoraService.disableAudio();
    } catch (err) {
      console.error('Error al detener transmisión:', err);
    }
  }, [agoraService]);

  if (!isClient || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-5 bg-gray-100">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Walkie-Talkie de Ambulancia
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <UserList 
        users={users} 
        selectedUser={selectedUser} 
        onSelectUser={handleSelectUser} 
      />

      {isSomeoneTransmitting && (
        <div className="fixed top-5 right-5 px-4 py-2 bg-green-500 text-white rounded-lg animate-pulse">
          Recibiendo audio...
        </div>
      )}

      {isConnecting ? (
        <div className="fixed bottom-10 px-6 py-3 bg-gray-500 text-white rounded-full">
          Conectando...
        </div>
      ) : selectedUser && (
        <WalkieTalkieButton
          onPress={startTransmission}
          onRelease={stopTransmission}
          selectedUser={selectedUser}
        />
      )}
    </div>
  );
};

export const getServerSideProps = async () => {
  try {
    const users = await ambulanciaService.getTripulantes();
    return {
      props: {
        initialUsers: users || [],
      },
    };
  } catch (error) {
    console.error('Error loading users in getServerSideProps:', error);
    return {
      props: {
        initialUsers: [],
      },
    };
  }
};

export default WalkieTalkieView;