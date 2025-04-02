import { StoryDto, TypeDto } from "@/services/api-client";
import Spinner from "@/components/common/spinner";
import { api } from "@/services/api";
import CreateStoryButton from "@/components/story/create-story-button";
import { useQuery } from "@tanstack/react-query";
import StoryCard from "@/components/story/story-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TypeBlockProps {
  type: TypeDto;
}

const TypeBlock: React.FC<TypeBlockProps> = ({ type }) => {
  // Queries
  const { data: stories = [], isLoading } = useQuery<StoryDto[]>({
    queryKey: [`${type.id}-stories`],
    queryFn: () => api.findAllStoriesByType(`${type.id}`).then((response) => 
      (response.data as StoryDto[]).sort((a, b) => b.id! - a.id!)
    ),
  });

  if (isLoading) {
    return <Spinner size={70} />;
  }

  return (
    <div key={type.id}>
      <h2 className="text-2xl font-bold">{type.name}</h2>
      <CreateStoryButton type={type} />
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="to-publish"
      >
        <AccordionItem value="to-publish">
          <AccordionTrigger>TO PUBLISH</AccordionTrigger>
          <AccordionContent>
            <div
              key={type.id}
              className="flex flex-wrap space-y-4 justify-evenly"
            >
              {stories
                .filter(
                  (story) => (story.publishings ?? []).length === 0
                )
                .map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="published">
          <AccordionTrigger>ALREADY PUBLISHED</AccordionTrigger>
          <AccordionContent>
            <div
              key={type.id}
              className="flex flex-wrap space-y-4 justify-evenly"
            >
              {stories
                .filter((story) => {
                  return (story.publishings?.length ?? 0) > 0;
                })
                .map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default TypeBlock;
