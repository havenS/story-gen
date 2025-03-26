import DefaultLayout from "./layouts/default";
import Spinner from "./components/common/spinner";
import { CreateStoryCard } from "./components/story/create-story-card";
import StoryCard from "./components/story/story-card";
import { StoriesSection } from "./components/story/stories-grid";
import { HealthCheckProvider } from "./contexts/health-check-context";
import { HealthCheckBanner } from "./components/common/health-check-banner";
import { useHealthCheck } from "./contexts/health-check-context";
import { useStories } from "./hooks/useStories";

function AppContent() {
  const { isLoading, isBackendHealthy, isLlmHealthy } = useHealthCheck();
  const { types, getStoriesForType } = useStories(isBackendHealthy);

  if (isLoading) {
    return <Spinner size={70} />;
  }

  if (!isBackendHealthy || !isLlmHealthy) {
    return null;
  }

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
