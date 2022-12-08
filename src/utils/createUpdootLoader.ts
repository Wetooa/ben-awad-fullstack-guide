import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";

// check this out for ts shit later

// [{postId: 1, userId: 10}]
// we load [{postId: 1, userId: 10}]
// return [{postId: 1, userId: 10, value: 1}]

interface UpdootLoaderKeys {
  postId: number;
  userId: number;
}

export const createUpdootLoader = () =>
  new DataLoader<UpdootLoaderKeys, Updoot | null>(async (keys) => {
    const updoots = await Updoot.findByIds(keys as any);

    const updootIdsToUpdoot: Record<number, Updoot> = {};
    updoots.forEach((u) => {
      updootIdsToUpdoot[`${u.userId}|${u.postId}` as any] = u;
    });
    const sortedUsers = keys.map(
      (key) => updootIdsToUpdoot[`${key.userId}|${key.postId}` as any]
    );

    return sortedUsers;
  });
