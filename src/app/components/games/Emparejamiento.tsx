import { useState } from "react";

/**
 * EJERCICIO 4: EMPAREJAMIENTO DE OBJETOS
 * 
 * Funcionamiento:
 * 1. Mostrar dos columnas de elementos
 * 2. Usuario debe emparejar elementos relacionados
 * 3. Clic en elemento izquierda, luego en elemento derecha
 */

interface Pair {
  left: string;
  right: string;
}

const pairs: Pair[] = [
  { left: "🔑", right: "🚪" },
  { left: "☕", right: "🍪" },
  { left: "📚", right: "✏️" },
  { left: "🌧️", right: "☔" },
];

interface EmparejamientoProps {
  onComplete: (aciertos: number, errores: number, tiempo: number) => void;
}

export function Emparejamiento({ onComplete }: EmparejamientoProps) {
  const [leftItems] = useState(() =>
    pairs.map((p) => p.left).sort(() => Math.random() - 0.5)
  );
  const [rightItems] = useState(() =>
    pairs.map((p) => p.right).sort(() => Math.random() - 0.5)
  );

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [startTime] = useState(Date.now());

  const isMatch = (left: string, right: string): boolean => {
    return pairs.some((pair) => pair.left === left && pair.right === right);
  };

  const handleLeftClick = (item: string) => {
    if (matched.has(item)) return;
    setSelectedLeft(item);
  };

  const handleRightClick = (item: string) => {
    if (!selectedLeft || matched.has(item)) return;

    if (isMatch(selectedLeft, item)) {
      // Match correcto
      setMatched(new Set([...matched, selectedLeft, item]));
      setAciertos(aciertos + 1);
      setSelectedLeft(null);

      // Si completó todos
      if (matched.size + 2 === pairs.length * 2) {
        const tiempo = Math.floor((Date.now() - startTime) / 1000);
        setTimeout(() => {
          onComplete(aciertos + 1, errores, tiempo);
        }, 500);
      }
    } else {
      // Match incorrecto
      setErrores(errores + 1);
      setSelectedLeft(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] sm:min-h-[440px] lg:min-h-[500px]">
      <div className="max-w-4xl w-full">
        {/* Instrucción clara */}
        <p className="text-xl sm:text-2xl text-gray-800 mb-2 text-center" style={{ fontWeight: 700 }}>
          Une las parejas
        </p>
        
        <p className="text-base sm:text-lg text-gray-600 mb-5 sm:mb-6 text-center" style={{ fontWeight: 600 }}>
          Toca uno, después su pareja
        </p>

        {/* Grid de emparejamiento */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-10">
          {/* Columna izquierda */}
          <div className="space-y-3 sm:space-y-4">
            {leftItems.map((item, idx) => {
              const isMatched = matched.has(item);
              const isSelected = selectedLeft === item;

              return (
                <button
                  key={idx}
                  onClick={() => handleLeftClick(item)}
                  disabled={isMatched}
                  className="w-full p-4 sm:p-5 lg:p-6 rounded-2xl border-4 text-4xl sm:text-5xl lg:text-6xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  style={{
                    borderColor: isMatched
                      ? "#12B8B2"
                      : isSelected
                      ? "#12B8B2"
                      : "#E5ECEC",
                    backgroundColor: isMatched
                      ? "#f0fdf4"
                      : isSelected
                      ? "#EFFCFB"
                      : "#ffffff",
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* Columna derecha */}
          <div className="space-y-3 sm:space-y-4">
            {rightItems.map((item, idx) => {
              const isMatched = matched.has(item);

              return (
                <button
                  key={idx}
                  onClick={() => handleRightClick(item)}
                  disabled={isMatched || !selectedLeft}
                  className="w-full p-4 sm:p-5 lg:p-6 rounded-2xl border-4 text-4xl sm:text-5xl lg:text-6xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  style={{
                    borderColor: isMatched ? "#12B8B2" : "#E5ECEC",
                    backgroundColor: isMatched ? "#f0fdf4" : "#ffffff",
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contador simple */}
        <p className="text-xl text-center mt-6" style={{ fontWeight: 700, color: "#12B8B2" }}>
          {matched.size / 2} / {pairs.length}
        </p>
      </div>
    </div>
  );
}
