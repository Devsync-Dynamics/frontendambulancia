// components/ClientOnlyTimestamp.tsx
import React, { useState, useEffect } from 'react';

interface ClientOnlyTimestampProps {
  timestamp: string;
}

const ClientOnlyTimestamp: React.FC<ClientOnlyTimestampProps> = ({ timestamp }) => {
  const [formattedTime, setFormattedTime] = useState<string>('');

  useEffect(() => {
    setFormattedTime(new Date(timestamp).toLocaleString());
  }, [timestamp]);

  return <>{formattedTime}</>;
};

export default ClientOnlyTimestamp;