import DefaultLayout from "./layouts/default";
import { CreateStoryCard } from "./components/story/create-story-card";
import StoryCard from "./components/story/story-card";
import { StoriesSection } from "./components/story/stories-grid";
import { HealthCheckProvider } from "./contexts/health-check-context";
import { HealthCheckBanner } from "./components/common/health-check-banner";
import { useHealthCheck } from "./contexts/health-check-context";
import { useStories } from "./hooks/useStories";
import { ErrorBoundary } from "./components/common/error-boundary";
import { ServiceUnavailable } from "./components/common/service-unavailable";

function AppContent() {
  const { isBackendHealthy } = useHealthCheck();
  const { types, getStoriesForType } = useStories(isBackendHealthy);

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

function AppWrapper() {
  const { isLoading, isBackendHealthy, isLlmHealthy, isGenApiHealthy, isGenApiBusy } = useHealthCheck();

  return (
    <DefaultLayout>
      <HealthCheckBanner />
      <ServiceUnavailable
        isBackendHealthy={isBackendHealthy}
        isLlmHealthy={isLlmHealthy}
        isGenApiHealthy={isGenApiHealthy}
        isGenApiBusy={isGenApiBusy}
        isLoading={isLoading}
      />
      <AppContent />
    </DefaultLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <HealthCheckProvider>
        <AppWrapper />
      </HealthCheckProvider>
    </ErrorBoundary>
  );
}

export default App;
