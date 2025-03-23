import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

export function useStoryMutations(storyId: number, typesId: number) {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      queryKey: [[`${typesId}-stories`]],
    });
  };

  const generateImageMutation = useMutation({
    mutationFn: () => api.generateStoryBackgroundImage(String(storyId)),
    onSuccess: invalidateQueries,
  });

  const generateChaptersContentMutation = useMutation({
    mutationFn: () => api.generateChapterContent(String(storyId)),
    onSuccess: invalidateQueries,
  });

  const generateChaptersMediaMutation = useMutation({
    mutationFn: () => api.generateStoryChapterMedia(String(storyId)),
    onSuccess: invalidateQueries,
  });

  const generateStoryMediaMutation = useMutation({
    mutationFn: () => api.generateFullStoryMedia(String(storyId)),
    onSuccess: invalidateQueries,
  });

  const publishToYoutubeMutation = useMutation({
    mutationFn: async () => {
      // First refresh YouTube connection
      const refreshResponse = await api.getYoutubeAuthUrl();
      if (refreshResponse.data) {
        window.open(refreshResponse.data, "_blank");
      }
      // Then publish to YouTube
      return api.publishYoutube(String(storyId));
    },
    onSuccess: invalidateQueries,
  });

  return {
    generateImageMutation,
    generateChaptersContentMutation,
    generateChaptersMediaMutation,
    generateStoryMediaMutation,
    publishToYoutubeMutation,
  };
} 