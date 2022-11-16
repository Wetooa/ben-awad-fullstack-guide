import { Box, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import React, { useEffect } from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import Loading from "./Loading";

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  let isServer = false;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    isServer = typeof window === "undefined";
  }, []);

  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({ pause: isServer });

  let body = null;
  console.log(data);

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
      <>
        <Box>{data?.me?.username}</Box>
        <Button
          onClick={() => {
            logout({});
          }}
          isLoading={logoutFetching}
          variant={"link"}
        >
          Log out
        </Button>
      </>
    );
  }

  return (
    <Box width={"100%"}>
      <Flex
        gap={2}
        justifyContent={"flex-end"}
        bg="forestgreen"
        p={4}
        ml={"auto"}
      >
        {body}
      </Flex>
    </Box>
  );
};
export default NavBar;
