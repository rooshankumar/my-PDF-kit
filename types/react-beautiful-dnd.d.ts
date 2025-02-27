
declare module 'react-beautiful-dnd' {
  import * as React from 'react';
  
  // Re-export everything
  export * from 'react-beautiful-dnd';
  
  // Add explicit interfaces if needed in your components
  export interface DroppableProvided {
    innerRef: React.RefObject<HTMLElement>;
    droppableProps: Record<string, any>;
    placeholder: React.ReactElement | null;
  }
  
  export interface DraggableProvided {
    innerRef: React.RefObject<HTMLElement>;
    draggableProps: Record<string, any>;
    dragHandleProps: Record<string, any> | null;
  }
}
