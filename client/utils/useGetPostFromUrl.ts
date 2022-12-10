import { usePostQuery } from "../generated/graphql";
import { useGettingIntId } from "./useGettingIntId";

export const useGetPostFromUrl = () => {
  const intId = useGettingIntId();

  return usePostQuery({
    pause: intId === -1,
    variables: {
      postId: intId,
    },
  });
};
