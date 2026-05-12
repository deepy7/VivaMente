import { useState, useEffect } from "react";

/**
 * EJERCICIO 1: MEMORIA VISUAL
 * 
 * Funcionamiento:
 * 1. Mostrar 4 imágenes durante 5 segundos
 * 2. Ocultar imágenes
 * 3. Mostrar 8 opciones (incluye las originales + distractores)
 * 4. Usuario selecciona las que vio
 */

const allImages = ["🐱", "🐶", "🌺", "🏠", "🎵", "☀️", "🌟", "🎨"];

interface MemoriaVisualProps {
  onComplete: (aciertos: number, errores: number, tiempo: number) => void;
}

export function MemoriaVisual({ onComplete }: MemoriaVisualProps) {
  const [phase, setPhase] = useState<"study" | "test">("study");
  const [targetImages, setTargetImages] = useState<string[]>([]);
  const [allOptions, setAllOptions] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(5);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const shuffled = [...allImages].sort(() => Math.random() - 0.5);
    const targets = shuffled.slice(0, 4);
    setTargetImages(targets);

    const distractors = shuffled.slice(4, 8);
    const options = [...targets, ...distractors].sort(() => Math.random() - 0.5);
    setAllOptions(options);
  }, []);

  useEffect(() => {
    if (phase === "study" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (phase === "study" && timeLeft === 0) {
      setPhase("test");
    }
  }, [phase, timeLeft]);

  const handleImageClick = (image: string) => {
    if (phase !== "test") return;

    if (selectedImages.includes(image)) {
      setSelectedImages(selectedImages.filter((img) => img !== image));
      return;
    }

    if (selectedImages.length >= targetImages.length) {
      return;
    }

    setSelectedImages([...selectedImages, image]);
  };

  const handleSubmit = () => {
    const totalRespuestas = targetImages.length;
    const aciertos = selectedImages.filter((img) => targetImages.includes(img)).length;
    const errores = totalRespuestas - aciertos;
    const tiempo = Math.floor((Date.now() - startTime) / 1000);

    onComplete(aciertos, errores, tiempo);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] sm:min-h-[440px] lg:min-h-[500px]">
      {phase === "study" && (
        <div className="text-center">
          <div className="mb-6">
            <p className="text-xl sm:text-2xl text-gray-800 mb-3" style={{ fontWeight: 700 }}>
              Memoriza estas imágenes
            </p>
            <p className="text-4xl sm:text-5xl" style={{ fontWeight: 700, color: "#12B8B2" }}>
              {timeLeft}s
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 max-w-4xl mx-auto">
            {targetImages.map((img, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-2xl border-4 flex items-center justify-center text-5xl sm:text-6xl lg:text-8xl bg-white shadow-lg"
                style={{ borderColor: "#12B8B2" }}
              >
                {img}
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === "test" && (
        <div className="text-center w-full">
          <p className="text-xl sm:text-2xl text-gray-800 mb-2" style={{ fontWeight: 700 }}>
            Selecciona las que viste
          </p>

          <p className="text-xl mb-4" style={{ fontWeight: 600, color: "#12B8B2" }}>
            {selectedImages.length} / {targetImages.length}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 max-w-4xl mx-auto mb-5 sm:mb-6">
            {allOptions.map((img, idx) => {
              const isSelected = selectedImages.includes(img);
              const isDisabled = !isSelected && selectedImages.length >= targetImages.length;

              return (
                <button
                  key={idx}
                  onClick={() => handleImageClick(img)}
                  disabled={isDisabled}
                  className="aspect-square rounded-2xl border-4 flex items-center justify-center text-5xl sm:text-6xl lg:text-7xl transition-all hover:scale-105 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    borderColor: isSelected ? "#12B8B2" : "#12B8B2",
                    backgroundColor: isSelected ? "#f0fdf4" : "#ffffff",
                  }}
                >
                  {img}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedImages.length !== targetImages.length}
            className="text-white text-lg sm:text-xl px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl transition-colors shadow-lg cursor-pointer disabled:cursor-not-allowed"
            style={{
              fontWeight: 700,
              backgroundColor:
                selectedImages.length !== targetImages.length ? "#D1D5DB" : "#12B8B2",
            }}
          >
            Confirmar
          </button>
        </div>
      )}
    </div>
  );
}
