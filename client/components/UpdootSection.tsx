import React, { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  //   post: PostsQuery["posts"]["posts"][0]; // selecting a type inside another type, pretty cool but kinda unnecessary

  post: PostSnippetFragment;
}

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading"); // this is how u create a union of types or like set types for useStates in react
  const [{}, vote] = useVoteMutation(); // operations gets us our variables

  return (
    <Flex
      flexDirection={"column"}
      alignItems="center" // horizontal align
      justifyContent={"center"} // vertical align
    >
      <IconButton
        isLoading={loadingState === "updoot-loading"}
        aria-label="Updoot"
        name="chevron-up"
        colorScheme={post.voteStatus === 1 ? "green" : "gray"}
        onClick={async () => {
          setLoadingState("updoot-loading");
          await vote({ postId: post.id, value: 1 });
          setLoadingState("not-loading");
        }}
      >
        <ChevronUpIcon />
      </IconButton>

      {post.points}

      <IconButton
        isLoading={loadingState === "downdoot-loading"}
        aria-label="Downdoot"
        name="chevron-up"
        colorScheme={post.voteStatus === -1 ? "red" : "gray"}
        onClick={async () => {
          setLoadingState("downdoot-loading");
          await vote({ postId: post.id, value: -1 });
          setLoadingState("not-loading");
        }}
      >
        <ChevronDownIcon />
      </IconButton>
    </Flex>
  );
};
export default UpdootSection;
