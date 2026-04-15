import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, User, Bot, Sparkles, Calendar, TrendingUp, RefreshCw, 
  MessageCircle, LayoutDashboard, History, CheckCircle2, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

import MoodSelector from '../components/AICoach/MoodSelector';
import ChatBubble from '../components/AICoach/ChatBubble';
import CoachCard from '../components/AICoach/CoachCard';
import InsightCard from '../components/AICoach/InsightCard';

const AICoach = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mood, setMood] = useState('neutral');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [dailyBrief, setDailyBrief] = useState(null);
  const [habitsAnalysis, setHabitsAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');

  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [isAnalyzingHabits, setIsAnalyzingHabits] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (user && user?.token) {
      fetchHistory();
      fetchDailyBrief();
      fetchHabits();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ai/coach/history', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (response.data && response.data.messages) {
        setMessages(response.data.messages);
      }
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setPageLoading(false);
    }
  };

  const fetchDailyBrief = async (regenerate = false) => {
    if (regenerate) setIsGeneratingBrief(true);
    try {
      const method = regenerate ? 'post' : 'get';
      const response = await axios[method]('http://localhost:5000/api/ai/coach/daily-brief', {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setDailyBrief(response.data);
      if (regenerate) toast.success('Daily brief updated!');
    } catch (err) {
      console.error('Daily brief error:', err);
      if (regenerate) toast.error('Failed to update daily brief.');
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const fetchHabits = async (regenerate = false) => {
    if (regenerate) setIsAnalyzingHabits(true);
    try {
      const method = regenerate ? 'post' : 'get';
      const response = await axios[method]('http://localhost:5000/api/ai/coach/analyze-habits', {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setHabitsAnalysis(response.data);
      if (regenerate) toast.success('Health habits analyzed!');
    } catch (err) {
      console.error('Habits error:', err);
      if (regenerate) toast.error('Failed to analyze habits.');
    } finally {
      setIsAnalyzingHabits(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', text: input, timestamp: new Date() };
    setMessages([...messages, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/ai/coach/chat', 
        { message: input, mood },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      const aiMsg = { role: 'ai', text: response.data.message, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      toast.error('Coach is currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-slate-400 font-medium animate-pulse">Initializing your AI Health Coach...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tight">
            <span className="p-3 bg-blue-600/20 rounded-2xl text-blue-500">
              <Sparkles size={32} />
            </span>
            AI Health Coach
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Personalized, context-aware support for your medication journey.
          </p>
        </div>

        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 self-start md:self-center">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'chat' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle size={18} />
            <span className="font-bold text-sm">Coach Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('brief')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'brief' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="font-bold text-sm">Daily Brief</span>
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'insights' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp size={18} />
            <span className="font-bold text-sm">Insights</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[700px] bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-inner">
                      <Bot size={22} />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold leading-none">MediCoach</h3>
                    <span className="text-green-500 text-[10px] font-bold uppercase tracking-wider">Online</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={fetchHistory} className="p-2 text-slate-400 hover:text-white transition-colors">
                    <History size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-10">
                    <div className="p-6 bg-blue-600/10 rounded-full text-blue-500">
                      <Bot size={48} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">Hello, {user.name}!</h4>
                      <p className="text-slate-400">
                        I'm your personal health assistant. How are you feeling today? 
                        Select your mood below and let's talk about your medications.
                      </p>
                    </div>
                    <MoodSelector selectedMood={mood} onSelect={setMood} />
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => (
                      <ChatBubble key={idx} role={msg.role} text={msg.text} timestamp={msg.timestamp} />
                    ))}
                    {loading && (
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium animate-pulse pl-2">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                        </div>
                        Coach is thinking...
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 bg-slate-900/60 border-t border-slate-800">
                {messages.length > 0 && (
                   <div className="mb-4">
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Current Mood</p>
                     <MoodSelector selectedMood={mood} onSelect={setMood} />
                   </div>
                )}
                <form onSubmit={handleSendMessage} className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything about your health..."
                    className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${
                      input.trim() ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'brief' && (
            <div className="space-y-6">
              <CoachCard 
                title="Your Health Today" 
                icon={Calendar} 
                extra={dailyBrief && (
                  <button 
                    onClick={() => fetchDailyBrief(true)} 
                    disabled={isGeneratingBrief}
                    className="p-2 text-slate-400 hover:text-white transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={18} className={isGeneratingBrief ? 'animate-spin text-blue-500' : ''} />
                  </button>
                )}
              >
                {isGeneratingBrief ? (
                  <div className="py-20 flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-400 font-medium">Generating your daily protocol...</p>
                  </div>
                ) : dailyBrief ? (
                  <>
                    <p className="text-slate-200 leading-relaxed text-lg font-medium">{dailyBrief.summary}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                      <div className="p-5 bg-blue-600/5 rounded-3xl border border-blue-600/10 hover:bg-blue-600/10 transition-colors group">
                        <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <Sparkles size={14} /> Schedule Highlights
                        </h4>
                        <ul className="space-y-3">
                          {dailyBrief.schedule_highlights.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-300 text-sm font-semibold group-hover:text-white transition-colors">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="p-5 bg-rose-600/5 rounded-3xl border border-rose-600/10 hover:bg-rose-600/10 transition-colors group">
                        <h4 className="text-xs font-black text-rose-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <AlertCircle size={14} /> Potential Risks
                        </h4>
                        <ul className="space-y-3">
                          {dailyBrief.risks.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-300 text-sm font-semibold group-hover:text-white transition-colors">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8 space-y-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Clinical Insight Tips</p>
                      {dailyBrief.tips.map((tip, i) => <InsightCard key={i} type="tip" text={tip} />)}
                    </div>
                  </>
                ) : (
                  <div className="py-20 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
                    <Calendar size={48} className="mx-auto text-slate-700 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Daily Protocol Found</h3>
                    <p className="text-slate-500 mb-6 max-w-xs mx-auto">Get a personalized daily schedule and interaction analysis by generating a brief.</p>
                    <button 
                      onClick={() => fetchDailyBrief(true)} 
                      className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:scale-105 transition-all"
                    >
                      Generate My Brief
                    </button>
                  </div>
                )}
              </CoachCard>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-[2.5rem] p-8 flex items-center gap-6"
                >
                  <div className="p-4 bg-orange-500/10 rounded-3xl text-orange-500 shadow-inner">
                    <Sparkles size={32} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Consistency Streak</p>
                    <h3 className="text-4xl font-black text-white">{habitsAnalysis?.streakCount || 0}<span className="text-xl text-slate-400 ml-1">days</span></h3>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-[2.5rem] p-8 flex items-center gap-6"
                >
                  <div className="p-4 bg-blue-500/10 rounded-3xl text-blue-500 shadow-inner">
                    <TrendingUp size={32} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Personal Record</p>
                    <h3 className="text-4xl font-black text-white">{habitsAnalysis?.longestStreak || 0}<span className="text-xl text-slate-400 ml-1">days</span></h3>
                  </div>
                </motion.div>
              </div>

              <CoachCard 
                title="Weekly Habits Analysis" 
                icon={TrendingUp}
                extra={habitsAnalysis && (
                  <button 
                    onClick={() => fetchHabits(true)} 
                    disabled={isAnalyzingHabits}
                    className="p-2 text-slate-400 hover:text-white transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={18} className={isAnalyzingHabits ? 'animate-spin text-blue-500' : ''} />
                  </button>
                )}
              >
                {isAnalyzingHabits ? (
                  <div className="py-20 flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-400 font-medium">Analyzing behavioral patterns...</p>
                  </div>
                ) : habitsAnalysis ? (
                  <>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Pattern Detections</p>
                      {habitsAnalysis.insights?.map((insight, i) => (
                        <InsightCard key={i} type="trend" text={insight} />
                      ))}
                    </div>
                    
                    <div className="mt-8 p-8 bg-gradient-to-br from-blue-600/10 to-indigo-600/5 border border-blue-600/20 rounded-[2rem] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 text-blue-500/10 rotate-12">
                        <TrendingUp size={120} />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-3">Improvement Strategy</h4>
                      <p className="text-slate-300 leading-relaxed font-medium relative z-10">{habitsAnalysis.improvement_plan}</p>
                    </div>

                    <div className="mt-8 flex items-center gap-5 p-6 bg-slate-800/40 rounded-3xl border border-slate-700/50">
                      <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20">
                        <Bot size={28} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Coach Sentiment</p>
                        <p className="text-slate-200 font-bold text-lg">{habitsAnalysis.streak_info}</p>
                      </div>
                    </div>

                    <div className="mt-8 p-8 bg-slate-900/60 border border-slate-800 rounded-[2rem] flex flex-col md:flex-row items-center gap-6">
                      <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500">
                        <Bell size={28} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white mb-1">Adaptive Notifications</h4>
                        <p className="text-slate-400 text-sm">We've adjusted your reminder windows based on your performance patterns.</p>
                      </div>
                      <button
                        onClick={async () => {
                          if ('Notification' in window) {
                            const permission = await Notification.requestPermission();
                            if (permission === 'granted') {
                              toast.success('Adaptive Notifications enabled!');
                            }
                          }
                        }}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition-all whitespace-nowrap"
                      >
                        Enable Notifications
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-20 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
                    <TrendingUp size={48} className="mx-auto text-slate-700 mb-4" />
                    <h1 className="text-xl font-bold text-white mb-2">Behavioral Analysis Ready</h1>
                    <p className="text-slate-500 mb-6 max-w-xs mx-auto">Click below to analyze your adherence history and generate a custom improvement plan.</p>
                    <button 
                      onClick={() => fetchHabits(true)} 
                      className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:scale-105 transition-all"
                    >
                      Process My Habits
                    </button>
                  </div>
                )}
              </CoachCard>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6 lg:block hidden">
          <CoachCard title="Quick Guidelines" icon={Sparkles}>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-slate-400">Be specific about symptoms or how you're feeling.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-slate-400">Ask about food interactions or side effects.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-slate-400">Update your mood for more personalized advice.</p>
              </li>
            </ul>
          </CoachCard>

          <CoachCard title="Coach Identity" icon={User}>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-2xl shadow-blue-500/20">
                <Bot size={48} />
              </div>
              <h4 className="text-xl font-bold text-white">MediCoach AI</h4>
              <p className="text-slate-400 text-sm mt-1 uppercase font-bold tracking-widest ring-1 ring-slate-800 px-3 py-1 rounded-full">Pro Assistant</p>
              <div className="mt-6 w-full space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>SYSTEM TRUST</span>
                  <span className="text-blue-500">98%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[98%]" />
                </div>
              </div>
            </div>
          </CoachCard>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
