// Test file for PopularSection data transformation logic

// Mock data structures
interface BackendSolution {
  id: string;
  name: string; // This is the software/solution ID
  types: string[]; // Array of product IDs
}

interface FrontendSolution {
  id: string;
  name: string; // This is like "software_123" or "solution_456"
  types: string[]; // Array of product IDs
}

// Mock software/solution options
const mockSoftwareSolutionOptions = [
  { value: 'software_507f1f77bcf86cd799439011', label: 'Adobe Photoshop (Software)' },
  { value: 'software_507f1f77bcf86cd799439012', label: 'Microsoft Excel (Software)' },
  { value: 'solution_507f1f77bcf86cd799439013', label: 'Project Management (Solution)' },
  { value: 'solution_507f1f77bcf86cd799439014', label: 'Customer Support (Solution)' }
];

// Test backend to frontend transformation
export const testBackendToFrontend = () => {
  console.log('=== Testing Backend to Frontend Transformation ===');
  
  const backendData: BackendSolution[] = [
    {
      id: '1',
      name: '507f1f77bcf86cd799439011', // Adobe Photoshop ID
      types: ['product1', 'product2']
    },
    {
      id: '2', 
      name: '507f1f77bcf86cd799439013', // Project Management ID
      types: ['product3', 'product4']
    }
  ];

  const transformedData = backendData.map(sol => {
    const softwareSolutionId = sol.name;
    const frontendValue = mockSoftwareSolutionOptions.find(option => {
      const optionId = option.value.includes('_') ? option.value.split('_')[1] : option.value;
      return optionId === softwareSolutionId;
    })?.value || '';

    return {
      ...sol,
      name: frontendValue,
      types: Array.isArray(sol.types) ? sol.types : []
    };
  });

  console.log('Backend data:', backendData);
  console.log('Transformed frontend data:', transformedData);
  
  return transformedData;
};

// Test frontend to backend transformation
export const testFrontendToBackend = () => {
  console.log('=== Testing Frontend to Backend Transformation ===');
  
  const frontendData: FrontendSolution[] = [
    {
      id: '1',
      name: 'software_507f1f77bcf86cd799439011', // Adobe Photoshop
      types: ['product1', 'product2']
    },
    {
      id: '2',
      name: 'solution_507f1f77bcf86cd799439013', // Project Management
      types: ['product3', 'product4']
    }
  ];

  const transformedData = frontendData.map(sol => {
    const frontendValue = sol.name;
    const backendId = frontendValue.includes('_') ? frontendValue.split('_')[1] : frontendValue;

    return {
      id: sol.id,
      name: backendId,
      types: Array.isArray(sol.types) ? sol.types : []
    };
  });

  console.log('Frontend data:', frontendData);
  console.log('Transformed backend data:', transformedData);
  
  return transformedData;
};

// Run tests
export const runTests = () => {
  console.log('🧪 Running PopularSection Data Transformation Tests...\n');
  
  testBackendToFrontend();
  console.log('\n');
  testFrontendToBackend();
  
  console.log('\n✅ All tests completed!');
};

// Export for manual testing
if (typeof window !== 'undefined') {
  (window as any).testPopularSection = {
    testBackendToFrontend,
    testFrontendToBackend,
    runTests
  };
} 