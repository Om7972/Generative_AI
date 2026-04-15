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
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'brief', 'insights'

  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
    fetchDailyBrief();
    fetchHabits();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ai/coach/history', {
        headers: { Authorization: `Bearer ${user.token}` }
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

  const fetchDailyBrief = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ai/coach/daily-brief', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setDailyBrief(response.data);
    } catch (err) {
      console.error('Daily brief fetch error:', err);
    }
  };

  const fetchHabits = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ai/coach/analyze-habits', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setHabitsAnalysis(response.data);
    } catch (err) {
      console.error('Habits fetch error:', err);
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
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const aiMsg = { role: 'ai', text: response.data.message, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMsg]);
      
      // If the AI gives tips/warnings in the chat response, we could display them separately
      // but for now, we'll just include the message.
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
              <CoachCard title="Your Health Today" icon={Calendar}>
                {dailyBrief ? (
                  <>
                    <p className="text-slate-300 leading-relaxed text-lg">{dailyBrief.summary}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                        <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Sparkles size={14} /> Schedule Highlights
                        </h4>
                        <ul className="space-y-2">
                          {dailyBrief.schedule_highlights.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                              <CheckCircle2 size={14} className="text-blue-500" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                        <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <AlertCircle size={14} /> Potential Risks
                        </h4>
                        <ul className="space-y-2">
                          {dailyBrief.risks.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                              <span className="text-red-500">•</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Health Tips</h4>
                      {dailyBrief.tips.map((tip, i) => <InsightCard key={i} type="tip" text={tip} />)}
                    </div>
                  </>
                ) : (
                  <div className="py-20 text-center">
                    <button onClick={fetchDailyBrief} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Generate Daily Brief</button>
                  </div>
                )}
              </CoachCard>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                    <Sparkles size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Streak</p>
                    <h3 className="text-3xl font-black text-white">{habitsAnalysis?.streakCount || 0} days</h3>
                  </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                    <TrendingUp size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Longest Streak</p>
                    <h3 className="text-3xl font-black text-white">{habitsAnalysis?.longestStreak || 0} days</h3>
                  </div>
                </div>
              </div>

              <CoachCard title="Weekly Habits Analysis" icon={TrendingUp}>
                {habitsAnalysis ? (
                  <>
                    <div className="space-y-4">
                      {habitsAnalysis.insights.map((insight, i) => (
                        <InsightCard key={i} type="trend" text={insight} />
                      ))}
                    </div>
                    
                    <div className="mt-8 p-6 bg-blue-600/10 border border-blue-600/20 rounded-2xl">
                      <h4 className="text-lg font-bold text-white mb-2">Improvement Plan</h4>
                      <p className="text-slate-300 leading-relaxed font-medium">{habitsAnalysis.improvement_plan}</p>
                    </div>

                    <div className="mt-6 flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                      <div className="p-3 bg-blue-600 rounded-xl">
                        <TrendingUp size={24} className="text-white" />
                      </div>
                      <p className="text-slate-200 font-bold">{habitsAnalysis.streak_info}</p>
                    </div>

                    <div className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                            <Bell size={20} />
                          </div>
                          <div>
                            <h4 className="text-white font-bold">Smart Notifications</h4>
                            <p className="text-slate-400 text-xs mt-0.5">Never miss a dose with AI-timed reminders.</p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if ('Notification' in window) {
                              const permission = await Notification.requestPermission();
                              if (permission === 'granted') {
                                toast.success('Smart Notifications enabled!');
                              }
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-colors"
                        >
                          Enable Now
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-20 text-center">
                    <button onClick={fetchHabits} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Analyze My Habits</button>
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
