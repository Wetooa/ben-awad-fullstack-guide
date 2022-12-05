import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import Loading from "./Loading";

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  // // no longer needed
  // const [isServer, setIsServer] = useState(true);

  // useEffect(() => {
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   setIsServer(typeof window === "undefined");
  // }, []);

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
