import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/services/api';

interface HealthCheckContextType {
  isBackendHealthy: boolean;
  isGenApiHealthy: boolean;
  isGenApiBusy: boolean;
  isLlmHealthy: boolean;
  isLoading: boolean;
}

const HealthCheckContext = createContext<HealthCheckContextType | undefined>(undefined);

export function HealthCheckProvider({ children }: { children: React.ReactNode }) {
  const [isBackendHealthy, setIsBackendHealthy] = useState(false);
  const [isGenApiHealthy, setIsGenApiHealthy] = useState(false);
  const [isGenApiBusy, setIsGenApiBusy] = useState(false);
  const [isLlmHealthy, setIsLlmHealthy] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Check backend health
        const backendHealth = await api.ping();
        setIsBackendHealthy(!!backendHealth);

        // Check LLM health
        const llmHealth = await api.pingLLM();
        setIsLlmHealthy(!!llmHealth);

        // Check Gen API health with timeout
        const genApiPromise = api.pingGenApi();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10000)
        );

        try {
          const genApiHealth = await Promise.race([genApiPromise, timeoutPromise]);
          setIsGenApiHealthy(!!genApiHealth);
          setIsGenApiBusy(false);
        } catch (error) {
          if (error instanceof Error && error.message === 'timeout') {
            setIsGenApiHealthy(true);
            setIsGenApiBusy(true);
          } else {
            setIsGenApiHealthy(false);
            setIsGenApiBusy(false);
          }
        }
      } catch (error) {
        setIsBackendHealthy(false);
        setIsGenApiHealthy(false);
        setIsLlmHealthy(false);
        setIsGenApiBusy(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkHealth();
    // Check health every minute
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <HealthCheckContext.Provider value={{
      isBackendHealthy,
      isGenApiHealthy,
      isGenApiBusy,
      isLlmHealthy,
      isLoading,
    }}>
      {children}
    </HealthCheckContext.Provider>
  );
}

export function useHealthCheck() {
  const context = useContext(HealthCheckContext);
  if (context === undefined) {
    throw new Error('useHealthCheck must be used within a HealthCheckProvider');
  }
  return context;
} 