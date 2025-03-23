import DefaultLayout from "./layouts/default";
import { TypeDto } from "./services/api-client";
import { useEffect, useState } from "react";
import TypeBlock from "./components/type-block";
import { api } from "./services/api";
import { useQuery } from "@tanstack/react-query";
import Spinner from "./components/spinner";
import { cn } from "./lib/utils";

function App() {
  const [types, setTypes] = useState([]);

  useEffect(() => {
    api.findAllTypes().then((response: any) => {
      setTypes(response.data);
    });
  }, []);

  const apiQuery = useQuery({
    queryKey: ["service-api"],
    queryFn: () => {
      return api.ping();
    },
    retry: 0,
  });
  const llmQuery = useQuery({
    queryKey: ["service-llm"],
    queryFn: () => {
      return api.pingLLM();
    },
    retry: 0,
  });
  const genApiQuery = useQuery({
    queryKey: ["service-gen-api"],
    queryFn: () => {
      return api.pingGenApi();
    },
    retry: 0,
  });

  if (llmQuery.isLoading || genApiQuery.isLoading || apiQuery.isLoading) {
    return <Spinner size={70} />;
  }

  if (genApiQuery.isError || apiQuery.isError) {
    return (
      <DefaultLayout>
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          <div className="inline-block text-center justify-center">
            <h1 className="text-3xl font-bold text-red-500">
              Some required services are down
            </h1>
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row">
                <span
                  className={cn(
                    "flex",
                    "h-2",
                    "w-2",
                    "translate-y-1",
                    "rounded-full",
                    apiQuery.isError ? "bg-red-500" : "bg-green-500"
                  )}
                />
                <p className="text-sm font-medium leading-none ml-2">
                  Main API service
                </p>
              </div>
            </div>
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row">
                <span
                  className={cn(
                    "flex",
                    "h-2",
                    "w-2",
                    "translate-y-1",
                    "rounded-full",
                    llmQuery.isError ? "bg-red-500" : "bg-green-500"
                  )}
                />
                <p className="text-sm font-medium leading-none ml-2">
                  LLM API service
                </p>
              </div>
            </div>
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row">
                <span
                  className={cn(
                    "flex",
                    "h-2",
                    "w-2",
                    "translate-y-1",
                    "rounded-full",
                    genApiQuery.isError ? "bg-red-500" : "bg-green-500"
                  )}
                />
                <p className="text-sm font-medium leading-none ml-2">
                  Generation API service
                </p>
              </div>
            </div>
          </div>
        </section>
      </DefaultLayout>
    );
  }

  return (
    <>
      <DefaultLayout>
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          <div className="inline-block text-center justify-center">
            {types.map((type: TypeDto) => (
              <TypeBlock key={type.id} type={type} />
            ))}
          </div>
        </section>
      </DefaultLayout>
    </>
  );
}

export default App;
