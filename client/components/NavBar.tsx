import { Box, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import { useMeQuery } from "../generated/graphql";
import Loading from "./Loading";

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
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
      <>
        <Box>{data?.me?.username}</Box>
        <Button variant={"link"}>Log out</Button>
      </>
    );
  }

  return (
    <Box width={"100%"}>
      <Flex gap={2} justifyContent={"flex-end"} bg="tomato" p={4} ml={"auto"}>
        {body}
      </Flex>
    </Box>
  );
};
export default NavBar;
