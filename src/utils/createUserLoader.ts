import DataLoader from "dataloader";
import { In } from "typeorm";
import { User } from "../entities/User";

export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const user = await User.findBy({ id: In(userIds as number[]) });
    const userIdToUser: Record<number, User> = {};

    user.forEach((u) => {
      userIdToUser[u.id] = u;
    });
    const sortedUsers = userIds.map((userId) => userIdToUser[userId]);
    return sortedUsers;
  });
