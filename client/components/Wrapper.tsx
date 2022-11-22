import { Box } from "@chakra-ui/react";
import React from "react";

export type WrapperVariant = {
  variant?: "small" | "regular";
};

interface WrapperProps extends WrapperVariant {
  children: React.ReactNode;
}

const Wrapper: React.FC<WrapperProps> = ({ children, variant = "regular" }) => {
  return (
    <Box
      maxW={variant === "regular" ? "800px" : "400px"}
      width="100%"
      mt="18px"
      mx="auto"
    >
      {children}
    </Box>
  );
};
export default Wrapper;
