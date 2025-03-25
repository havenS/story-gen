import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AxiosResponse } from 'axios';
import { StoryDto, TypeDto } from '@/services/api-client';

interface StoriesByPublishStatus {
  published: StoryDto[];
  unpublished: StoryDto[];
}

export const useStories = (isBackendHealthy: boolean) => {
  const [types, setTypes] = useState<TypeDto[]>([]);
  const [storiesByType, setStoriesByType] = useState<Record<number, StoryDto[]>>({});

  useEffect(() => {
    if (isBackendHealthy) {
      api.findAllTypes().then((response: AxiosResponse) => {
        setTypes(response.data);
      });
    }
  }, [isBackendHealthy]);

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

  const getStoriesForType = (typeId: number): StoriesByPublishStatus => {
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

  return {
    types,
    getStoriesForType,
  };
}; 