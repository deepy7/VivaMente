import { useState } from "react";

/**
 * EJERCICIO 5: RECONOCIMIENTO DE OBJETOS
 * 
 * Funcionamiento:
 * 1. Mostrar un objeto objetivo
 * 2. Mostrar una cuadrícula de 6 objetos
 * 3. Usuario debe identificar todos los objetos que coinciden con el objetivo
 * SIN tiempo límite - para evitar estrés en usuarios con Alzheimer
 */

interface Round {
  target: string;
  options: string[];
  correctIndices: number[];
}

const rounds: Round[] = [
  {
    target: "🐶",
    options: ["🐶", "🐱", "🐶", "🦁", "🐶", "🐵"],
    correctIndices: [0, 2, 4],
  },
  {
    target: "🌟",
    options: ["🌟", "⭐", "🌟", "💫", "🌟", "✨"],
    correctIndices: [0, 2, 4],
  },
  {
    target: "🍎",
    options: ["🍎", "🍊", "🍎", "🍌", "🍇", "🍎"],
    correctIndices: [0, 2, 5],
  },
];

interface ReconocimientoProps {
  onComplete: (aciertos: number, errores: number, tiempo: number) => void;
}

export function Reconocimiento({ onComplete }: ReconocimientoProps) {
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [startTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);

  const round = rounds[currentRound];
  const isLastRound = currentRound === rounds.length - 1;

  const handleClick = (index: number) => {
    if (showFeedback) return;

    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
      return;
    }

    if (selectedIndices.length >= round.correctIndices.length) {
      return;
    }

    setSelectedIndices([...selectedIndices, index]);
  };

  const handleSubmit = () => {
    setShowFeedback(true);

    const totalRespuestas = round.correctIndices.length;
    const correctSelected = selectedIndices.filter((i) =>
      round.correctIndices.includes(i)
    ).length;
    const roundErrors = totalRespuestas - correctSelected;

    const newAciertos = aciertos + correctSelected;
    const newErrores = errores + roundErrors;

    setAciertos(newAciertos);
    setErrores(newErrores);

    setTimeout(() => {
      if (isLastRound) {
        const tiempo = Math.floor((Date.now() - startTime) / 1000);
        onComplete(newAciertos, newErrores, tiempo);
      } else {
        setCurrentRound(currentRound + 1);
        setSelectedIndices([]);
        setShowFeedback(false);
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: "500px", maxHeight: "600px" }}>
      <div className="text-center max-w-3xl w-full">
        <p className="text-lg text-gray-600 mb-4" style={{ fontWeight: 600 }}>
          Ronda {currentRound + 1} de {rounds.length}
        </p>

        <p className="text-2xl text-gray-800 mb-6" style={{ fontWeight: 700 }}>
          Encuentra los iguales a este:
        </p>

        <div
          className="w-36 h-36 mx-auto rounded-3xl border-4 flex items-center justify-center text-8xl bg-white shadow-xl mb-6"
          style={{ borderColor: "#12B8B2" }}
        >
          {round.target}
        </div>

        <div className="grid grid-cols-3 gap-5 max-w-2xl mx-auto mb-6">
          {round.options.map((option, idx) => {
            const isSelected = selectedIndices.includes(idx);
            const isCorrect = round.correctIndices.includes(idx);
            const showCorrect = showFeedback && isCorrect;
            const showWrong = showFeedback && isSelected && !isCorrect;
            const isDisabled = !isSelected && selectedIndices.length >= round.correctIndices.length;

            return (
              <button
                key={idx}
                onClick={() => handleClick(idx)}
                disabled={showFeedback || isDisabled}
                className="aspect-square rounded-2xl border-4 flex items-center justify-center text-7xl transition-all hover:scale-105 disabled:cursor-not-allowed shadow-lg disabled:opacity-30"
                style={{
                  borderColor: showCorrect
                    ? "#12B8B2"
                    : showWrong
                    ? "#E88F7A"
                    : isSelected
                    ? "#12B8B2"
                    : "#E5ECEC",
                  backgroundColor: showCorrect
                    ? "#f0fdf4"
                    : showWrong
                    ? "#fef2f2"
                    : isSelected
                    ? "#EFFCFB"
                    : "#ffffff",
                }}
              >
                {option}
              </button>
            );
          })}
        </div>

        <p className="text-xl mb-4" style={{ fontWeight: 600, color: "#12B8B2" }}>
          {selectedIndices.length} / {round.correctIndices.length}
        </p>

        <button
          onClick={handleSubmit}
          disabled={selectedIndices.length !== round.correctIndices.length || showFeedback}
          className="text-white text-xl px-10 py-4 rounded-2xl transition-colors shadow-lg cursor-pointer disabled:cursor-not-allowed"
          style={{
            fontWeight: 700,
            backgroundColor:
              selectedIndices.length !== round.correctIndices.length || showFeedback
                ? "#D1D5DB"
                : "#12B8B2",
          }}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}
