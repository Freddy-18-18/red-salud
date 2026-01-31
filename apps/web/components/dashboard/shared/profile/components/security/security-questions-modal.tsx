"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Key, Loader2, Check, AlertCircle } from "lucide-react";

interface SecurityQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_QUESTIONS = [
  "¿Cuál es el nombre de tu primera mascota?",
  "¿En qué ciudad naciste?",
  "¿Cuál es el nombre de soltera de tu madre?",
  "¿Cuál fue tu primer trabajo?",
  "¿Cuál es tu comida favorita?",
  "¿Cuál es el nombre de tu mejor amigo de la infancia?",
  "¿En qué calle vivías cuando eras niño?",
  "¿Cuál es tu libro favorito?",
  "¿Cuál fue el modelo de tu primer carro?",
  "¿Cuál es el nombre de tu escuela primaria?",
];

export function SecurityQuestionsModal({ isOpen, onClose }: SecurityQuestionsModalProps) {
  const [questions, setQuestions] = useState([
    { question: "", answer: "" },
    { question: "", answer: "" },
    { question: "", answer: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validar que todas las preguntas sean diferentes
    const selectedQuestions = questions.map(q => q.question);
    if (new Set(selectedQuestions).size !== 3) {
      setError("Debes seleccionar 3 preguntas diferentes");
      setLoading(false);
      return;
    }

    // Validar que todas las respuestas estén completas
    if (questions.some(q => !q.answer.trim())) {
      setError("Debes responder todas las preguntas");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/security/questions/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Error al guardar preguntas");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-xl shadow-2xl z-[201] p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Key className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Preguntas de Seguridad
                </h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="p-3 bg-green-100 rounded-full mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  ¡Preguntas Guardadas!
                </p>
                <p className="text-sm text-gray-500 text-center">
                  Tus preguntas de seguridad han sido configuradas
                </p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                <p className="text-sm text-gray-600">
                  Configura 3 preguntas de seguridad para recuperar tu cuenta en caso de olvido de contraseña.
                </p>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {questions.map((q, index) => (
                  <div key={index} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pregunta {index + 1}
                      </label>
                      <select
                        value={q.question}
                        onChange={(e) => {
                          const newQuestions = [...questions];
                          newQuestions[index].question = e.target.value;
                          setQuestions(newQuestions);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      >
                        <option value="">Selecciona una pregunta</option>
                        {AVAILABLE_QUESTIONS.map((question, i) => (
                          <option key={i} value={question}>
                            {question}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Respuesta
                      </label>
                      <input
                        type="text"
                        value={q.answer}
                        onChange={(e) => {
                          const newQuestions = [...questions];
                          newQuestions[index].answer = e.target.value;
                          setQuestions(newQuestions);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Tu respuesta"
                        required
                      />
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Preguntas"
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
