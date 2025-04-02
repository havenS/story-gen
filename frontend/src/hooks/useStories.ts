import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { StoryDto, TypeDto } from '@/services/api-client';

interface StoriesByPublishStatus {
  published: StoryDto[];
  unpublished: StoryDto[];
}

export const useStories = (isBackendHealthy: boolean) => {
  const queryClient = useQueryClient();

  const { data: types = [] } = useQuery<TypeDto[]>({
    queryKey: ['types'],
    queryFn: async () => {
      const response = await api.findAllTypes();
      return Array.isArray(response.data) ? response.data : [response.data];
    },
    enabled: isBackendHealthy,
  });

  // Fetch stories for all types
  useQueries({
    queries: types.map((type) => ({
      queryKey: [`${type.id}-stories`],
      queryFn: async () => {
        const response = await api.findAllStoriesByType(`${type.id}`);
        return Array.isArray(response.data) ? response.data : [response.data];
      },
      enabled: isBackendHealthy && !!type.id,
    })),
  });

  const getStoriesForType = (typeId: number): StoriesByPublishStatus => {
    const stories = queryClient.getQueryData<StoryDto[]>([`${typeId}-stories`]) || [];
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

  return {
    types,
    getStoriesForType,
  };
}; 