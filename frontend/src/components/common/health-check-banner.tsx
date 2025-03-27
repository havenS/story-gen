import { useHealthCheck } from '@/contexts/health-check-context';

export function HealthCheckBanner() {
  const { isBackendHealthy, isGenApiBusy, isLlmHealthy, isLoading } = useHealthCheck();

  if (isLoading) {
    return null;
  }

  if (!isBackendHealthy || !isLlmHealthy) {
    return (
      <div className="bg-red-500 text-white p-4 text-center">
        <p className="font-medium">Some services are not available:</p>
        <div className="flex justify-center gap-4 mt-2">
          {!isBackendHealthy && <span>Backend</span>}
          {!isLlmHealthy && <span>LLM</span>}
        </div>
      </div>
    );
  }

  if (isGenApiBusy) {
    return (
      <div className="bg-yellow-500 text-white p-4 text-center">
        <p className="font-medium">The Gen API seems to be currently busy. Some features might be slower than usual.</p>
      </div>
    );
  }

  return null;
} 