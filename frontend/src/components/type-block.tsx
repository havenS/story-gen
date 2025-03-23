import { TypeDto } from "../services/api-client";
import Spinner from "./spinner";
import { api } from "../services/api";
import CreateStoryButton from "./create-story-button";
import { useQuery } from "@tanstack/react-query";
import StoryCard from "./story-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface TypeBlockProps {
  type: TypeDto;
}

const TypeBlock: React.FC<TypeBlockProps> = ({ type }) => {
  // Queries
  const query = useQuery({
    queryKey: [`${type.id}-stories`],
    queryFn: () => {
      return api
        .findAllStoriesByType(`${type.id}`)
        .then((response: any) =>
          response.data.sort((a: any, b: any) => b.id - a.id)
        );
    },
  });

  if (query.isLoading) {
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
              {[...query.data]
                ?.filter((story: any) => story.publishings.length === 0)
                .map((story: any) => (
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
              {[...query.data]
                ?.filter((story: any) => {
                  console.log(story);
                  return story.publishings.length > 0;
                })
                .map((story: any) => (
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
