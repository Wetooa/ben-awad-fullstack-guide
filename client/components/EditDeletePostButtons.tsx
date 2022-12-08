import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Container, IconButton } from "@chakra-ui/react";
import router from "next/router";
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  postId: number;
  postCreator: number;
  setId?: (value: number) => void;
  currentPostId?: number;
}

const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  postId,
  postCreator,
  setId,
  currentPostId,
}) => {
  const [{ fetching: deleteFetching }, deletePost] = useDeletePostMutation();
  const [{ data: meData }] = useMeQuery();

  return (
    <Box display={"inline"} m={0}>
      {meData?.me?.id === postCreator && (
        <>
          <IconButton
            isLoading={deleteFetching && postId === currentPostId}
            mr={2}
            aria-label="Delete"
            onClick={async () => {
              if (setId) setId(postId);
              await deletePost({ deletePostId: postId });
              if (setId) setId(-1);
              router.push("/");
            }}
          >
            <DeleteIcon />
          </IconButton>

          <IconButton
            aria-label="Update"
            onClick={() => {
              router.push(`post/edit/${postId}`);
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
