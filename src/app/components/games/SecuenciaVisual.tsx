import { useState } from "react";

/**
 * EJERCICIO 6: SECUENCIA VISUAL
 * 
 * Funcionamiento:
 * 1. Mostrar una secuencia de emojis con uno faltante (?)
 * 2. Mostrar 3 opciones simples
 * 3. Usuario debe elegir el emoji que completa la secuencia
 * 
 * SIMPLIFICADO: Patrones más obvios para usuarios con Alzheimer
 */

interface SequenceData {
  sequence: string[]; // La secuencia con "?" en la posición faltante
  correctAnswer: string;
  options: string[];
  hint: string; // Pista visual
}

const sequences: SequenceData[] = [
  {
    sequence: ["🐶", "🐶", "?"],
    correctAnswer: "🐶",
    options: ["🐶", "🐱", "🐭"],
    hint: "Mismo animal",
  },
  {
    sequence: ["🍎", "🍎", "?"],
    correctAnswer: "🍎",
    options: ["🍎", "🍊", "🍌"],
    hint: "Misma fruta",
  },
  {
    sequence: ["🌙", "⭐", "?"],
    correctAnswer: "☀️",
    options: ["☀️", "🌺", "🏠"],
    hint: "En el cielo",
  },
];

interface SecuenciaVisualProps {
  onComplete: (aciertos: number, errores: number, tiempo: number) => void;
}

export function SecuenciaVisual({ onComplete }: SecuenciaVisualProps) {
  const [currentSequence, setCurrentSequence] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [startTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);

  const sequence = sequences[currentSequence];
  const isLastSequence = currentSequence === sequences.length - 1;

  const handleAnswerClick = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === sequence.correctAnswer;
    if (isCorrect) {
      setAciertos(aciertos + 1);
    } else {
      setErrores(errores + 1);
    }

    // Esperar 1.5s antes de continuar
    setTimeout(() => {
      if (isLastSequence) {
        const tiempo = Math.floor((Date.now() - startTime) / 1000);
        onComplete(aciertos + (isCorrect ? 1 : 0), errores + (isCorrect ? 0 : 1), tiempo);
      } else {
        setCurrentSequence(currentSequence + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] sm:min-h-[440px] lg:min-h-[500px]">
      <div className="text-center max-w-3xl w-full">
        {/* Progreso simple */}
        <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6" style={{ fontWeight: 600 }}>
          Secuencia {currentSequence + 1} de {sequences.length}
        </p>

        {/* Instrucción MUY clara */}
        <p className="text-xl sm:text-2xl text-gray-800 mb-5 sm:mb-8" style={{ fontWeight: 700 }}>
          ¿Qué falta aquí?
        </p>

        {/* Secuencia */}
        <div className="flex justify-center gap-3 sm:gap-5 lg:gap-6 mb-6 sm:mb-8">
          {sequence.sequence.map((item, idx) => (
            <div
              key={idx}
              className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl border-4 flex items-center justify-center text-4xl sm:text-6xl lg:text-7xl bg-white shadow-lg"
              style={{
                borderColor: item === "?" ? "#12B8B2" : "#E5ECEC",
                backgroundColor: item === "?" ? "#EFFCFB" : "#ffffff",
              }}
            >
              {item === "?" ? (
                <span className="text-3xl sm:text-4xl lg:text-5xl" style={{ color: "#12B8B2", fontWeight: 700 }}>
                  ?
                </span>
              ) : (
                item
              )}
            </div>
          ))}
        </div>

        {/* Opciones grandes y simples - solo 3 */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 lg:gap-6 max-w-2xl mx-auto mb-5 sm:mb-6">
          {sequence.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === sequence.correctAnswer;
            const showCorrect = showFeedback && isCorrect;
            const showWrong = showFeedback && isSelected && !isCorrect;

            return (
              <button
                key={idx}
                onClick={() => handleAnswerClick(option)}
                disabled={!!selectedAnswer}
                className="aspect-square rounded-2xl border-4 flex items-center justify-center text-4xl sm:text-6xl lg:text-7xl transition-all hover:scale-105 disabled:cursor-not-allowed shadow-lg"
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
                {option}
              </button>
            );
          })}
        </div>

        {/* Feedback simple */}
        {showFeedback && (
          <div className="mt-4">
            {selectedAnswer === sequence.correctAnswer ? (
              <p className="text-3xl" style={{ color: "#12B8B2", fontWeight: 700 }}>
                ✓ ¡Muy bien!
              </p>
            ) : (
              <p className="text-3xl" style={{ color: "#E88F7A", fontWeight: 700 }}>
                Era: {sequence.correctAnswer}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
