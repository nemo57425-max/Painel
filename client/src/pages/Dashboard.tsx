import { useRevenue, useStats } from "@/hooks/use-dashboard";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie } from "recharts";
import { TrendingUp, Users, CheckCircle, ArrowUpRight, ArrowDownRight, MoreHorizontal, Wallet, Box, Package, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MaterialCalculator } from "@/components/calculator/MaterialCalculator";

export default function Dashboard({ materialCode }: { materialCode?: string }) {
  const { data: revenue, isLoading: loadingRevenue } = useRevenue();
  const { data: stats, isLoading: loadingStats } = useStats();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: material } = useQuery({
    queryKey: [`/api/materials/${materialCode}`],
    queryFn: async () => {
      const res = await fetch(`/api/materials/${encodeURIComponent(materialCode!)}`);
      if (!res.ok) throw new Error("Failed to fetch material");
      return res.json();
    },
    enabled: !!materialCode,
  });

  const displayStats = material ? [
    { id: 1, label: 'Saldo Atual', value: `${material.currentBalance} un`, trend: 'neutral', change: 0 },
    { id: 2, label: 'Ponto de Pedido', value: `${material.orderPoint} un`, trend: 'neutral', change: 0 },
    { id: 3, label: 'Status', value: material.currentBalance <= material.orderPoint ? 'Reposição' : 'OK', trend: material.currentBalance <= material.orderPoint ? 'down' : 'up', change: 0 },
    { id: 4, label: 'Tipo', value: material.type, trend: 'neutral', change: 0 },
  ] : stats;

  const displayTitle = material ? `Material: ${material.code}` : "Movimentação de Materiais";
  const displaySubtitle = material ? material.description : "controle de estoque mensal";

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  if (loadingRevenue || loadingStats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalRevenue = revenue?.reduce((acc, curr) => acc + curr.revenue, 0) || 0;
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-white/40">
          <p className="font-bold text-foreground text-xs mb-1.5">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-[10px]">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.fill || entry.stroke }} />
              <span className="text-muted-foreground capitalize">{entry.name}:</span>
              <span className="font-black">{entry.value} un</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const materialData = [
    { name: 'Entradas', value: 400, fill: 'hsl(262 83% 58%)' },
    { name: 'Saídas', value: 300, fill: 'hsl(339 90% 65%)' },
    { name: 'Estoque', value: 300, fill: '#10b981' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-foreground font-sans selection:bg-primary/10">
      <Sidebar />
      
      <div className="lg:ml-72 min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          
          {/* Tabs Navigation */}
          <div className="flex gap-1 bg-white/50 backdrop-blur-md p-1 rounded-[1.5rem] border border-white/60 w-fit mb-6 shadow-sm">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-2 rounded-2xl text-xs font-black transition-all duration-300 ${
                activeTab === "overview" 
                ? "bg-primary text-white shadow-md shadow-primary/20 scale-105" 
                : "text-muted-foreground hover:bg-white/80"
              }`}
            >
              Visão Geral
            </button>
            <button 
              onClick={() => setActiveTab("materials")}
              className={`px-6 py-2 rounded-2xl text-xs font-black transition-all duration-300 ${
                activeTab === "materials" 
                ? "bg-primary text-white shadow-md shadow-primary/20 scale-105" 
                : "text-muted-foreground hover:bg-white/80"
              }`}
            >
              Análise de Materiais
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "overview" ? (
              <motion.div 
                key="overview"
                variants={container}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Material Movement Chart */}
                  <motion.div variants={item} className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 shadow-premium border border-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-32 translate-x-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 relative z-10">
                      <div>
                        <h3 className="text-xl font-black text-foreground tracking-tight">{displayTitle}</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{displaySubtitle}</p>
                      </div>
                      
                      <div className="flex gap-1 bg-gray-100/50 p-1 rounded-xl">
                         <button className="px-4 py-1.5 text-[10px] font-black bg-white text-primary rounded-lg shadow-sm">Mensal</button>
                         <button className="px-4 py-1.5 text-[10px] font-black text-muted-foreground hover:text-foreground rounded-lg">Semanal</button>
                      </div>
                    </div>

                    <div className="h-[280px] w-full relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenue} barGap={10}>
                          <defs>
                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(262 83% 58%)" stopOpacity={1}/>
                              <stop offset="100%" stopColor="hsl(262 83% 70%)" stopOpacity={0.8}/>
                            </linearGradient>
                            <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(339 90% 65%)" stopOpacity={1}/>
                              <stop offset="100%" stopColor="hsl(339 90% 75%)" stopOpacity={0.8}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} tickFormatter={(v) => `${v} un`} domain={[0, 4000]} ticks={[0, 1000, 2000, 3000, 4000]} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 8 }} />
                          <Bar dataKey="revenue" name="Entradas" fill="url(#revGrad)" radius={[6, 6, 6, 6]} barSize={14} />
                          <Bar dataKey="expenses" name="Saídas" fill="url(#expGrad)" radius={[6, 6, 6, 6]} barSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  <div className="space-y-6">
                    {/* Inventory Card */}
                    <motion.div variants={item} className="bg-gradient-to-br from-primary to-purple-800 text-white rounded-[2rem] p-6 shadow-xl shadow-primary/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-10 -translate-y-10 blur-2xl group-hover:scale-110 transition-transform duration-700" />
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <Box className="w-6 h-6" />
                          </div>
                        </div>
                        <p className="text-white/60 font-black text-[9px] uppercase tracking-widest mb-1">Estoque Total</p>
                        <div className="flex items-baseline gap-2">
                           <h3 className="text-3xl font-black font-display">{totalRevenue.toLocaleString()} un</h3>
                           <span className="px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 text-[9px] font-black border border-emerald-400/20">+12%</span>
                        </div>
                        <div className="h-10 w-full mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenue?.slice(0,6)}>
                              <Line type="monotone" dataKey="revenue" stroke="#fff" strokeWidth={2.5} dot={false} strokeOpacity={0.8} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </motion.div>

                    {/* Materials Card */}
                    <motion.div variants={item} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-premium border border-white">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/5">
                          <Package className="w-5 h-5" />
                        </div>
                        <h4 className="font-black text-sm text-foreground">Pedidos de Material</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-black">
                          <span className="text-muted-foreground uppercase">Nível de Reposição</span>
                          <span className="text-primary text-sm">83%</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                          <div className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full" style={{ width: '83%' }} />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                           <div className="flex -space-x-2">
                              {[1,2,3,4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
                                  <img src={`https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=50&h=50&fit=crop`} alt="Material" className="w-full h-full object-cover" />
                                </div>
                              ))}
                              <div className="w-8 h-8 rounded-full border-2 border-white bg-primary text-white text-[9px] font-black flex items-center justify-center shadow-lg">+5</div>
                           </div>
                           <span className="text-[10px] font-black text-emerald-500 uppercase">Em trânsito</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {displayStats?.map((stat, i) => (
                    <motion.div 
                      key={stat.id} 
                      variants={item}
                      className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-5 shadow-premium border border-white/60 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-xl bg-gray-50 text-primary border border-gray-100 shadow-sm">
                          {i === 0 ? <Box className="w-5 h-5" /> : i === 1 ? <Package className="w-5 h-5" /> : i === 2 ? <RefreshCcw className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                        </div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${stat.trend === 'up' ? 'bg-emerald-100 text-emerald-600' : stat.trend === 'down' ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-600'}`}>
                          {stat.change > 0 ? '+' : ''}{stat.change}%
                        </span>
                      </div>
                      <h4 className="text-muted-foreground text-[9px] font-black uppercase tracking-widest mb-1">{stat.label}</h4>
                      <p className="text-2xl font-black font-display text-foreground">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="materials"
                variants={container}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6"
              >
                <MaterialCalculator />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Material Movement Analysis */}
                  <motion.div variants={item} className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-premium border border-white">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-black text-foreground tracking-tight">Movimentação de Materiais</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Fluxo de estoque atual</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-primary/5 text-primary border border-primary/10">
                        <Box className="w-6 h-6" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                      {[
                        { label: 'Total Entradas', value: '420 unidades', icon: ArrowUpRight, color: 'text-emerald-500' },
                        { label: 'Total Saídas', value: '185 unidades', icon: ArrowDownRight, color: 'text-rose-500' },
                        { label: 'Saldo Atual', value: '+235 unidades', icon: RefreshCcw, color: 'text-primary' },
                      ].map((m, idx) => (
                        <div key={idx} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 shadow-inner">
                          <div className="flex items-center gap-2 mb-2">
                            <m.icon className={`w-4 h-4 ${m.color}`} />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{m.label}</span>
                          </div>
                          <p className="text-xl font-black text-foreground tracking-tighter">{m.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenue.slice(0, 6)}>
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 8 }} />
                          <Bar dataKey="revenue" name="Entradas" fill="hsl(262 83% 58%)" radius={[6, 6, 0, 0]} barSize={25} />
                          <Bar dataKey="expenses" name="Saídas" fill="hsl(339 90% 65%)" radius={[6, 6, 0, 0]} barSize={25} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* Material Distribution / Health */}
                  <div className="space-y-6">
                    <motion.div variants={item} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-premium border border-white flex flex-col items-center">
                      <h4 className="font-black text-foreground text-sm mb-6 uppercase tracking-widest w-full">Distribuição</h4>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie 
                              data={materialData} 
                              cx="50%" cy="50%" 
                              innerRadius={60} 
                              outerRadius={80} 
                              paddingAngle={8} 
                              dataKey="value"
                              stroke="none"
                            >
                              {materialData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {materialData.map(m => (
                          <div key={m.name} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.fill }} />
                            <span className="text-[10px] font-black text-muted-foreground uppercase">{m.name}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div variants={item} className="bg-primary text-white rounded-[2rem] p-6 shadow-xl shadow-primary/20 flex items-center justify-between group overflow-hidden relative">
                      <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                      <div className="relative z-10">
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Alerta de Estoque</h4>
                        <p className="text-xl font-black tracking-tight">3 Materiais Baixos</p>
                      </div>
                      <div className="relative z-10 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Package className="w-6 h-6" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
