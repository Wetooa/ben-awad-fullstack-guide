import React from "react";
import NavBar from "./NavBar";
import Wrapper, { WrapperVariant } from "./Wrapper";

interface LayoutProps extends WrapperVariant {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, variant }) => {
  return (
    <Wrapper variant={variant}>
      <NavBar />
      {children}
    </Wrapper>
  );
};
export default Layout;
