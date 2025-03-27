import Spinner from './spinner';

interface ServiceUnavailableProps {
  isBackendHealthy: boolean;
  isLlmHealthy: boolean;
  isGenApiHealthy: boolean;
  isGenApiBusy: boolean;
  isLoading: boolean;
}

export function ServiceUnavailable({
  isBackendHealthy,
  isLlmHealthy,
  isGenApiHealthy,
  isGenApiBusy,
  isLoading,
}: ServiceUnavailableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Spinner size={70} />
        <p className="mt-4 text-gray-600">Checking services...</p>
      </div>
    );
  }

  const issues = [];
  if (!isBackendHealthy) issues.push('Backend service');
  if (!isLlmHealthy) issues.push('LLM service');
  if (!isGenApiHealthy) issues.push('Generation API');
  if (isGenApiBusy) issues.push('Generation API is busy');

  if (issues.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <h2 className="text-2xl font-bold text-yellow-500 mb-4">Services Unavailable</h2>
      <div className="text-gray-600 mb-4">
        <p>The following services are currently unavailable:</p>
        <ul className="list-disc list-inside mt-2">
          {issues.map((issue, index) => (
            <li key={index}>{issue}</li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Retry Connection
      </button>
    </div>
  );
} 