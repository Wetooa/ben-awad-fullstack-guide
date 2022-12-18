import React from "react";
import { Flex, Heading, Text, Box } from "@chakra-ui/react";
import EditDeletePostButtons from "./EditDeletePostButtons";
import UpdootSection from "./UpdootSection";
import { PostQuery } from "../generated/graphql";

interface RepliesProps {
  post: PostQuery["post"][];
}

const Replies: React.FC<RepliesProps> = ({ post }) => {
  return (
    <>
      {post.map<any>((r) => {
        if (r) {
          return (
            <Flex key={r.id} flexDirection={"column"}>
              <Flex
                borderTop={"1px solid gray"}
                p={4}
                gap={6}
                alignItems={"center"}
              >
                <UpdootSection post={r} />
                <Flex flexDirection={"column"}>
                  <Heading size={"md"}>{r.creator.username}</Heading>
                  <Text mt={1}>{r.text}</Text>
                </Flex>
                <Box ml={"auto"}>
                  <EditDeletePostButtons post={r} insidePost />
                </Box>
              </Flex>
              {r.replies && Replies(r.replies)}
            </Flex>
          );
        }
        return null;
      })}
    </>
  );
};
export default Replies;
