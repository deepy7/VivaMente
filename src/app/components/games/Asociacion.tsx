import { useState, useEffect } from "react";

/**
 * EJERCICIO 2: ASOCIACIÓN IMAGEN-PALABRA
 * 
 * Funcionamiento:
 * 1. Mostrar una imagen
 * 2. Mostrar 3 palabras/conceptos
 * 3. Usuario selecciona la palabra correcta
 */

interface QuestionData {
  image: string;
  correctWord: string;
  options: string[];
}

const questions: QuestionData[] = [
  {
    image: "🐱",
    correctWord: "Gato",
    options: ["Gato", "Perro", "Pájaro"],
  },
  {
    image: "🌺",
    correctWord: "Flor",
    options: ["Árbol", "Flor", "Hoja"],
  },
  {
    image: "🏠",
    correctWord: "Casa",
    options: ["Casa", "Edificio", "Tienda"],
  },
  {
    image: "☀️",
    correctWord: "Sol",
    options: ["Luna", "Sol", "Estrella"],
  },
];

interface AsociacionProps {
  onComplete: (aciertos: number, errores: number, tiempo: number) => void;
}

export function Asociacion({ onComplete }: AsociacionProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [startTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleWordClick = (word: string) => {
    if (selectedWord) return; // Ya seleccionó una respuesta

    setSelectedWord(word);
    setShowFeedback(true);

    const isCorrect = word === question.correctWord;
    if (isCorrect) {
      setAciertos(aciertos + 1);
    } else {
      setErrores(errores + 1);
    }

    // Esperar 1.5s antes de pasar a la siguiente pregunta
    setTimeout(() => {
      if (isLastQuestion) {
        const tiempo = Math.floor((Date.now() - startTime) / 1000);
        onComplete(aciertos + (isCorrect ? 1 : 0), errores + (isCorrect ? 0 : 1), tiempo);
      } else {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedWord(null);
        setShowFeedback(false);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: "500px", maxHeight: "600px" }}>
      <div className="text-center max-w-3xl w-full">
        {/* Progreso simple */}
        <p className="text-lg text-gray-600 mb-6" style={{ fontWeight: 600 }}>
          Pregunta {currentQuestion + 1} de {questions.length}
        </p>

        {/* Instrucción clara */}
        <p className="text-2xl text-gray-800 mb-6" style={{ fontWeight: 700 }}>
          ¿Qué es esto?
        </p>

        {/* Imagen grande */}
        <div
          className="w-48 h-48 mx-auto rounded-3xl border-4 flex items-center justify-center text-8xl bg-white shadow-xl mb-8"
          style={{ borderColor: "#12B8B2" }}
        >
          {question.image}
        </div>

        {/* Opciones grandes */}
        <div className="grid grid-cols-3 gap-5 max-w-2xl mx-auto mb-6">
          {question.options.map((word, idx) => {
            const isSelected = selectedWord === word;
            const isCorrect = word === question.correctWord;
            const showCorrect = showFeedback && isCorrect;
            const showWrong = showFeedback && isSelected && !isCorrect;

            return (
              <button
                key={idx}
                onClick={() => handleWordClick(word)}
                disabled={!!selectedWord}
                className="p-6 rounded-2xl border-4 text-2xl transition-all hover:scale-105 disabled:cursor-not-allowed shadow-lg text-gray-800"
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
                  fontWeight: 700,
                }}
              >
                {word}
              </button>
            );
          })}
        </div>

        {/* Feedback simple */}
        {showFeedback && (
          <div className="mt-4">
            {selectedWord === question.correctWord ? (
              <p className="text-3xl" style={{ color: "#12B8B2", fontWeight: 700 }}>
                ✓ ¡Muy bien!
              </p>
            ) : (
              <p className="text-3xl" style={{ color: "#E88F7A", fontWeight: 700 }}>
                Es: {question.correctWord}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}