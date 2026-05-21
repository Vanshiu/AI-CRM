import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Mail, Phone, Calendar, Edit2, GripVertical } from 'lucide-react';

export default function LeadCard({ lead, onEditClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead._id
  });

  // Calculate transformation coordinates during active dragging
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
    cursor: 'grabbing'
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 bg-[#13192a] border ${
        isDragging 
          ? 'border-indigo-500/80 bg-[#171f35] shadow-2xl scale-[1.02]' 
          : 'border-slate-800 hover:border-slate-700/80 shadow-md'
      } rounded-2xl flex flex-col gap-3 transition-all duration-150 relative group`}
    >
      {/* Header with name and Drag handle */}
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <h4 className="font-bold text-white text-sm truncate leading-snug">{lead.customerName}</h4>
        </div>
        
        {/* Drag handle dots */}
        <div 
          {...attributes} 
          {...listeners}
          className="h-7 w-6 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[#1c253d] flex items-center justify-center cursor-grab active:cursor-grabbing shrink-0 transition-colors"
          title="Drag to change status"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      {/* Email & Phone Contact coordinates */}
      <div className="flex flex-col gap-1.5 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          <Mail className="h-3 w-3 text-slate-500 shrink-0" />
          <span className="truncate" title={lead.email}>{lead.email}</span>
        </div>
        
        {lead.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-slate-500 shrink-0" />
            <span>{lead.phone}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800/80 my-0.5"></div>

      {/* Footer: Date and Action edit button */}
      <div className="flex items-center justify-between gap-2 mt-0.5">
        {/* Follow-up scheduler */}
        <div className="min-w-0">
          {lead.followUpDate ? (
            <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 inline-flex items-center">
              <Calendar className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {new Date(lead.followUpDate).toLocaleDateString(undefined, { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-600 italic">No follow-up</span>
          )}
        </div>

        {/* Quick Edit */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Avoid triggering any unwanted card clicks
            onEditClick(lead);
          }}
          className="h-7 w-7 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-[#1a2136] border border-transparent hover:border-slate-800 flex items-center justify-center transition-all duration-150 cursor-pointer"
          title="Edit Lead coordinates"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
