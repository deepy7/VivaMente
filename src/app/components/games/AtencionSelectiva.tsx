import { useState } from "react";

/**
 * EJERCICIO 3: ATENCIÓN SELECTIVA
 * 
 * Funcionamiento:
 * 1. Mostrar una cuadrícula de elementos similares
 * 2. Uno de ellos es diferente
 * 3. El usuario debe encontrar el elemento diferente
 */

interface Round {
  elements: string[];
  differentIndex: number;
}

const rounds: Round[] = [
  { elements: ["🐶", "🐶", "🐶", "🐱", "🐶", "🐶"], differentIndex: 3 },
  { elements: ["🌟", "⭐", "🌟", "🌟", "🌟", "🌟"], differentIndex: 1 },
  { elements: ["🔴", "🔴", "🔴", "🔵", "🔴", "🔴"], differentIndex: 3 },
  { elements: ["🍎", "🍎", "🍊", "🍎", "🍎", "🍎"], differentIndex: 2 },
];

interface AtencionSelectivaProps {
  onComplete: (aciertos: number, errores: number, tiempo: number) => void;
}

export function AtencionSelectiva({ onComplete }: AtencionSelectivaProps) {
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [startTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);

  const round = rounds[currentRound];
  const isLastRound = currentRound === rounds.length - 1;

  const handleClick = (index: number) => {
    if (selectedIndex !== null) return; // Ya seleccionó

    setSelectedIndex(index);
    setShowFeedback(true);

    const isCorrect = index === round.differentIndex;
    if (isCorrect) {
      setAciertos(aciertos + 1);
    } else {
      setErrores(errores + 1);
    }

    // Esperar 1.5s antes de continuar
    setTimeout(() => {
      if (isLastRound) {
        const tiempo = Math.floor((Date.now() - startTime) / 1000);
        onComplete(aciertos + (isCorrect ? 1 : 0), errores + (isCorrect ? 0 : 1), tiempo);
      } else {
        setCurrentRound(currentRound + 1);
        setSelectedIndex(null);
        setShowFeedback(false);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] sm:min-h-[440px] lg:min-h-[500px]">
      <div className="text-center max-w-3xl w-full">
        {/* Progreso */}
        <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6" style={{ fontWeight: 600 }}>
          Ronda {currentRound + 1} de {rounds.length}
        </p>

        {/* Instrucciones */}
        <p className="text-xl sm:text-2xl text-gray-800 mb-5 sm:mb-8" style={{ fontWeight: 700 }}>
          Encuentra el diferente
        </p>

        {/* Grid de elementos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 lg:gap-6 max-w-2xl mx-auto mb-5 sm:mb-6">
          {round.elements.map((elem, idx) => {
            const isSelected = selectedIndex === idx;
            const isCorrect = idx === round.differentIndex;
            const showCorrect = showFeedback && isCorrect;
            const showWrong = showFeedback && isSelected && !isCorrect;

            return (
              <button
                key={idx}
                onClick={() => handleClick(idx)}
                disabled={selectedIndex !== null}
                className="aspect-square rounded-2xl border-4 flex items-center justify-center text-5xl sm:text-6xl lg:text-7xl transition-all hover:scale-105 disabled:cursor-not-allowed shadow-lg"
                style={{
                  borderColor: showCorrect
                    ? "#12B8B2"
                    : showWrong
                    ? "#E88F7A"
                    : "#12B8B2",
                  backgroundColor: showCorrect
                    ? "#f0fdf4"
                    : showWrong
                    ? "#fef2f2"
                    : "#ffffff",
                }}
              >
                {elem}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className="mt-6">
            {selectedIndex === round.differentIndex ? (
              <p className="text-3xl" style={{ color: "#12B8B2", fontWeight: 700 }}>
                ✓ ¡Muy bien!
              </p>
            ) : (
              <p className="text-3xl" style={{ color: "#E88F7A", fontWeight: 700 }}>
                Inténtalo de nuevo
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}