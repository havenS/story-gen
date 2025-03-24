import { useEffect, useState } from "react";
import { TypeDto, StoryDto } from "./services/api-client";
import { api } from "./services/api";
import DefaultLayout from "./layouts/default";
import Spinner from "./components/spinner";
import { CreateStoryCard } from "./components/create-story-card";
import StoryCard from "./components/story-card";
import { StoriesSection } from "./components/stories-grid";
import { AxiosResponse } from "axios";
import { HealthCheckProvider } from "./contexts/health-check-context";
import { HealthCheckBanner } from "./components/health-check-banner";
import { useHealthCheck } from "./contexts/health-check-context";

function AppContent() {
  const [types, setTypes] = useState<TypeDto[]>([]);
  const [storiesByType, setStoriesByType] = useState<Record<number, StoryDto[]>>({});
  const { isLoading, isBackendHealthy, isLlmHealthy } = useHealthCheck();

  useEffect(() => {
    if (isBackendHealthy) {
      api.findAllTypes().then((response: AxiosResponse) => {
        setTypes(response.data);
      });
    }
  }, [isBackendHealthy]);

  // Fetch stories for each type
  useEffect(() => {
    const fetchStoriesForType = async (typeId: number) => {
      try {
        const response = await api.findAllStoriesByType(String(typeId));
        setStoriesByType((prev) => ({
          ...prev,
          [typeId]: response.data as StoryDto[],
        }));
      } catch (error) {
        console.error(`Error fetching stories for type ${typeId}:`, error);
      }
    };

    types.forEach((type) => {
      if (type.id) {
        fetchStoriesForType(type.id);
      }
    });
  }, [types]);

  if (isLoading) {
    return <Spinner size={70} />;
  }

  if (!isBackendHealthy || !isLlmHealthy) {
    return null;
  }

  const getStoriesForType = (typeId: number) => {
    const stories = storiesByType[typeId] || [];
    const sortedStories = [...stories].sort((a, b) => {
      return new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime();
    });

    const publishedStories = sortedStories.filter((story) =>
      story.publishings?.some((pub) => pub.youtube_id !== null)
    );
    const unpublishedStories = sortedStories.filter(
      (story) => !story.publishings?.some((pub) => pub.youtube_id !== null)
    );

    return {
      published: publishedStories,
      unpublished: unpublishedStories,
    };
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-7xl px-4 py-6 space-y-8">
        {types.map((type) => {
          const { published, unpublished } = getStoriesForType(type.id!);

          return (
            <StoriesSection
              key={type.id}
              title={type.name}
              className="pt-4"
              createButton={
                <CreateStoryCard
                  title="Add new"
                  description="Create a new story"
                  type={type}
                />
              }
              publishedContent={
                published.length > 0 &&
                published.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))
              }
            >
              {unpublished.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </StoriesSection>
          );
        })}
      </div>
    </div>
  );
}

function App() {
  return (
    <HealthCheckProvider>
      <DefaultLayout>
        <HealthCheckBanner />
        <AppContent />
      </DefaultLayout>
    </HealthCheckProvider>
  );
}

export default App;
