// Assuming this is within a component that uses the accept prop for file input.  The provided change only addresses the accept prop, so the rest of the component is assumed to exist.
//Example usage within a component:
import React from 'react';

function MyComponent() {
  return (
    <input type="file" accept={{ 'application/pdf': ['.pdf'] }} />
  );
}

export default MyComponent;