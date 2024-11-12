// components/WalkieTalkieButton.tsx
import { useState } from "react";

interface WalkieTalkieButtonProps {
  onPress: () => void;
  onRelease: () => void;
  selectedUser: { nombre: string } | null;
}

const WalkieTalkieButton: React.FC<WalkieTalkieButtonProps> = ({ onPress, onRelease, selectedUser }) => {
  const [isTransmitting, setIsTransmitting] = useState(false);

  const handlePress = () => {
    setIsTransmitting(true);
    onPress();
  };

  const handleRelease = () => {
    setIsTransmitting(false);
    onRelease();
  };

  return (
    <button
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      className={`px-6 py-3 rounded-full font-semibold transition ${
        isTransmitting ? "bg-red-500" : "bg-blue-500"
      } text-white fixed bottom-10`}
    >
      {isTransmitting ? "Hablando..." : `Hablar con ${selectedUser?.nombre || "Usuario"}`}
    </button>
  );
};

export default WalkieTalkieButton;
