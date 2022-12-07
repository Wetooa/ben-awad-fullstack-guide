import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Container, IconButton } from "@chakra-ui/react";
import router from "next/router";
import React from "react";
import { useDeletePostMutation } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  postId: number;
  setId: (value: number) => void;
  currentPostId: number;
}

const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  postId,
  setId,
  currentPostId,
}) => {
  const [{ fetching: deleteFetching }, deletePost] = useDeletePostMutation();

  return (
    <Container>
      <IconButton
        isLoading={deleteFetching && postId === currentPostId}
        mr={2}
        aria-label="Delete"
        onClick={async () => {
          setId(postId);
          await deletePost({ deletePostId: postId });
          setId(-1);
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
    </Container>
  );
};
export default EditDeletePostButtons;
