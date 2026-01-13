import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black">E</div>
          <div>
            <h1 className="text-xl font-black text-slate-800 leading-none">EduGenius Pro</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Smart Assessment System</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
           <span className="text-[10px] font-bold text-slate-400 uppercase hidden sm:block">faizin-smp2 kudus</span>
           <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200">Bantuan</button>
        </div>
      </div>
    </header>
  );
};

export default Header;