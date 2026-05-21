import React from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';

const COLUMNS = ['New Lead', 'Interested', 'Payment Pending', 'Closed'];

export default function KanbanBoard({ leads, onStatusChange, onEditLead }) {
  
  // Sensors configuration for drag trigger delays (to prevent mouse clicks from triggering drag instantly)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8 // Drag starts only after dragging 8 pixels (allows clicking buttons inside cards smoothly)
      }
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    // Verify valid drop coordinates
    if (!over) return;

    const leadId = active.id;
    const destinationStatus = over.id;

    // Find the lead in active dataset
    const lead = leads.find(l => l._id === leadId);
    
    if (lead && lead.status !== destinationStatus) {
      // Execute parent's status update callback
      onStatusChange(leadId, destinationStatus);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {/* 
        Responsive layout styling:
        - Stacked grid on small screens (col-span-1)
        - Side-by-side grid cols on large screens (grid-cols-4)
      */}
      <div className="flex flex-row lg:grid lg:grid-cols-4 gap-6 w-full overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-800">
        {COLUMNS.map((columnStatus) => {
          // Filter leads belonging to this status column
          const columnLeads = leads.filter(l => l.status === columnStatus);

          return (
            <KanbanColumn
              key={columnStatus}
              status={columnStatus}
              leads={columnLeads}
              onEditClick={onEditLead}
            />
          );
        })}
      </div>
    </DndContext>
  );
}
