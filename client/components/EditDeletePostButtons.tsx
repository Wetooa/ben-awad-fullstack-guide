import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, IconButton } from "@chakra-ui/react";
import router from "next/router";
import React, { useState } from "react";
import {
  PostSnippetFragment,
  useDeletePostMutation,
  useMeQuery,
} from "../generated/graphql";

interface EditDeletePostButtonsProps {
  post: PostSnippetFragment;
  insidePost?: boolean | null;
}

const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  post,
  insidePost,
}) => {
  const [{}, deletePost] = useDeletePostMutation();
  const [{ data: meData }] = useMeQuery();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Box display={"inline"} m={0}>
      {post && meData?.me?.id === post.creator.id && (
        <>
          <IconButton
            isLoading={isLoading}
            mr={2}
            aria-label="Delete"
            onClick={async () => {
              setIsLoading(true);
              await deletePost({ deletePostId: post.id });
              setIsLoading(false);
              if (!insidePost) router.push("/");
            }}
          >
            <DeleteIcon />
          </IconButton>

          <IconButton
            aria-label="Update"
            onClick={() => {
              router.push(`post/edit/${post.id}`);
            }}
          >
            <EditIcon />
          </IconButton>
        </>
      )}
    </Box>
  );
};
export default EditDeletePostButtons;
