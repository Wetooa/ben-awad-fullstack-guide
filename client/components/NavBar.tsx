import { Box, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import Loading from "./Loading";

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const [isServer, setIsServer] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setIsServer(typeof window === "undefined");
  }, []);

  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({ pause: isServer });

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
    <Box zIndex={1} position={"sticky"} top={0} width={"100%"}>
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
