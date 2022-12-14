import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import Link from "next/link";
import React from "react";
import Loading from "./Loading";

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  // const router = useRouter();
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery();

  let body = null;

  if (fetching) {
    body = <Loading />;
  } else if (!data?.me) {
    body = (
      <>
        <Link href={"/login"}>Login</Link>
        <Link href={"/register"}>Register</Link>
      </>
    );
  } else {
    body = (
      <Flex justifyContent={"flex-end"} alignItems={"center"} gap={2}>
        <Button as={Link} ml="auto" href={"/create-post"} width="fit-content">
          create post
        </Button>

        <Box>{data?.me?.username}</Box>

        <Button
          onClick={() => {
            logout({});

            // this or invalidate the cache
            // router.reload();
          }}
          isLoading={logoutFetching}
          variant={"link"}
        >
          Log out
        </Button>
      </Flex>
    );
  }

  return (
    <Box zIndex={1} position={"sticky"} top={0} width={"100%"}>
      <Flex
        gap={2}
        justifyContent={"space-between"}
        bg="forestgreen"
        p={4}
        ml={"auto"}
      >
        <Box>
          <Link href={"/"}>
            <Heading>LiReddit</Heading>
          </Link>
        </Box>
        {body}
      </Flex>
    </Box>
  );
};
export default NavBar;
