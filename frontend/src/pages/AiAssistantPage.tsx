import { useState } from "react";
import { aiApi } from "../api/ai.api";
import { Button } from "../components/common/Button";

const SUGGESTED_QUESTIONS = [
  "What events am I attending this week?",
  "When is my next event?",
  "List all events I organize.",
  "Show public tech events this weekend.",
  "Who's attending the Marketing Meetup?",
  "Where is the Design Sprint?",
];

export const AiAssistantPage = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (q?: string) => {
    const text = (q ?? question).trim();
    if (!text) return;

    setIsLoading(true);
    setAnswer(null);
    setError(null);

    try {
      const response = await aiApi.ask({ question: text });
      setAnswer(response.answer);
    } catch {
      setError(
        "Sorry, I didn't understand that. Please try rephrasing your question.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (q: string) => {
    setQuestion(q);
    void handleSubmit(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ask questions about your events in natural language
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">

        {/* Suggested questions */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Suggested questions
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSuggestedQuestion(q)}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700
                           hover:bg-indigo-100 transition-colors disabled:opacity-50
                           disabled:cursor-not-allowed cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100"></div>

        {/* Input area */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Your question
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. What events am I attending this week?"
            rows={3}
            maxLength={500}
            disabled={isLoading}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500
                       resize-none disabled:bg-gray-50 disabled:text-gray-400"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {question.length} / 500 · Press Enter to submit
            </span>
            <Button
              variant="primary"
              size="md"
              isLoading={isLoading}
              onClick={() => void handleSubmit()}
              disabled={!question.trim() || isLoading}
            >
              Ask
            </Button>
          </div>
        </div>

        {/* Answer area */}
        {isLoading && (
          <div className="flex items-center gap-3 py-4">
            <span className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shrink-0"></span>
            <span className="text-sm text-gray-500">Thinking...</span>
          </div>
        )}

        {answer && !isLoading && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Answer
            </p>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {answer}
              </p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};