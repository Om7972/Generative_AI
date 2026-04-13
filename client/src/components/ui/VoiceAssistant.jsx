import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2, Volume2, X, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const VoiceAssistant = () => {
  const { user } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += t;
          } else {
            interimTranscript += t;
          }
        }
        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          handleAIQuery(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch(e) {}
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setAiResponse('');
      setError('');
      setShowPanel(true);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleAIQuery = async (text) => {
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/ai/chat', {
        question: text,
        medications: [],
        age: null,
        conditions: [],
      }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAiResponse(data.answer);

      // Text-to-speech response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.answer);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      setError('Failed to get AI response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Voice Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={toggleListening}
        className={`fixed bottom-6 right-24 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center z-50 transition-all ${
          isListening
            ? 'bg-danger-500 shadow-danger-500/30 animate-pulse'
            : 'bg-gradient-to-br from-violet-600 to-purple-600 shadow-violet-500/30 hover:shadow-violet-500/50'
        }`}
        aria-label="Voice assistant"
        id="voice-assistant-btn"
      >
        {isListening ? <MicOff size={22} className="text-white" /> : <Mic size={22} className="text-white" />}
      </motion.button>

      {/* Voice Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden"
            id="voice-panel"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Sparkles size={18} className="text-white" />
                <div>
                  <h3 className="text-white font-bold text-sm">Voice Assistant</h3>
                  <span className="text-violet-200 text-[10px] font-medium">Speak naturally about your medications</span>
                </div>
              </div>
              <button onClick={() => { setShowPanel(false); if(isListening) recognitionRef.current?.stop(); }}
                className="text-white/60 hover:text-white p-1 hover:bg-white/10 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
              {/* Status */}
              <div className="text-center">
                {isListening ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-danger-50 dark:bg-danger-900/30 flex items-center justify-center">
                        <Mic size={28} className="text-danger-500" />
                      </div>
                      <div className="absolute inset-0 rounded-full border-2 border-danger-400 animate-ping opacity-30" />
                      <div className="absolute inset-[-4px] rounded-full border-2 border-danger-300 animate-ping opacity-20 [animation-delay:0.5s]" />
                    </div>
                    <p className="text-xs font-bold text-danger-600 dark:text-danger-400 animate-pulse uppercase tracking-widest">
                      Listening...
                    </p>
                  </div>
                ) : loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={28} className="text-primary-500 animate-spin" />
                    <p className="text-xs font-bold text-primary-500 uppercase tracking-widest">Processing...</p>
                  </div>
                ) : null}
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="bg-violet-50 dark:bg-violet-900/15 rounded-xl p-3 border border-violet-200/50 dark:border-violet-800/40">
                  <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-1">You said:</p>
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{transcript}</p>
                </div>
              )}

              {/* AI Response */}
              {aiResponse && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Volume2 size={12} className="text-primary-500" />
                    <p className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">AI Response:</p>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{aiResponse}</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-danger-50 dark:bg-danger-900/15 rounded-xl p-3 border border-danger-200/50 dark:border-danger-800/40">
                  <p className="text-xs text-danger-600 dark:text-danger-400 font-semibold">{error}</p>
                </div>
              )}

              {/* Suggestions */}
              {!isListening && !loading && !aiResponse && !error && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Try saying:</p>
                  {[
                    '"Can I take these meds together?"',
                    '"What are the side effects?"',
                    '"Should I take this with food?"',
                  ].map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setTranscript(s.replace(/"/g, '')); handleAIQuery(s.replace(/"/g, '')); }}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      🎙️ {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAssistant;
