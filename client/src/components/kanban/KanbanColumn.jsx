import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import LeadCard from './LeadCard';

export default function KanbanColumn({ status, leads, onEditClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status
  });

  // Dynamic Column styling based on status tag
  const getHeaderStyle = (status) => {
    switch (status) {
      case 'New Lead':
        return {
          bulletColor: 'bg-blue-500',
          badgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
        };
      case 'Interested':
        return {
          bulletColor: 'bg-purple-500',
          badgeColor: 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
        };
      case 'Payment Pending':
        return {
          bulletColor: 'bg-amber-500',
          badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        };
      case 'Closed':
        return {
          bulletColor: 'bg-emerald-500',
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        };
      default:
        return {
          bulletColor: 'bg-slate-500',
          badgeColor: 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
        };
    }
  };

  const headerConfig = getHeaderStyle(status);

  return (
    <div className="flex flex-col bg-[#0f1422]/60 border border-slate-800/80 rounded-2xl p-4 w-full min-w-[280px] sm:min-w-[320px] lg:min-w-0 min-h-[500px] md:min-h-[600px] flex-1 snap-start snap-always">
      {/* Column Header metadata */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${headerConfig.bulletColor}`}></span>
          <h3 className="font-extrabold text-white text-sm tracking-tight">{status}</h3>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${headerConfig.badgeColor}`}>
          {leads.length}
        </span>
      </div>

      {/* Droppable cards container zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-3.5 rounded-xl transition-all duration-150 ${
          isOver ? 'bg-indigo-600/5 ring-2 ring-indigo-500/20 p-2 -m-2' : ''
        }`}
      >
        {leads.length === 0 ? (
          /* Empty Column Placeholder */
          <div className="flex-1 border border-dashed border-slate-800/80 hover:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center select-none bg-[#080b11]/30">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Empty Column</span>
            <span className="text-[10px] text-slate-600 mt-1 leading-relaxed">Drag and drop leads here to change status milestone</span>
          </div>
        ) : (
          /* Card lists */
          leads.map((lead) => (
            <LeadCard 
              key={lead._id} 
              lead={lead} 
              onEditClick={onEditClick} 
            />
          ))
        )}
      </div>
    </div>
  );
}
