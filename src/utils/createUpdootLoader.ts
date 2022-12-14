import DataLoader from "dataloader";
import { PostUpdoot, ReplyUpdoot } from "../entities/Updoot";

// check this out for ts shit later

// [{postId: 1, userId: 10}]
// we load [{postId: 1, userId: 10}]
// return [{postId: 1, userId: 10, value: 1}]

interface UpdootLoaderKeys {
  postId?: number;
  replyId?: number;
  userId: number;
}

export const createUpdootLoader = () =>
  new DataLoader<UpdootLoaderKeys, PostUpdoot | ReplyUpdoot | null>(
    async (keys) => {
      const updoots =
        (await PostUpdoot.findByIds(keys as any)) +
        (await ReplyUpdoot.findByIds(keys as any));

      const updootIdsToUpdoot: Record<number, Updoot> = {};
      updoots.forEach((u) => {
        updootIdsToUpdoot[`${u.userId}|${u.postId}` as any] = u;
      });
      const sortedUsers = keys.map(
        (key) => updootIdsToUpdoot[`${key.userId}|${key.postId}` as any]
      );

      return sortedUsers;
    }
  );
