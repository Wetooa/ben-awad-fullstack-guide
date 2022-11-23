import NavBar from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import Loading from "../components/Loading";
import Layout from "../components/Layout";
import { Link } from "@chakra-ui/react";

// ssr results in the page loading before its sent to client so loading thingy doesnt show on the client

// u can either ssr or not ssr
// with ssr, ur browser will load for a while before ur page shows so custom loading stuff in the client side will be obsolete

// without ssr, ur page would load but requests which take time will cause ur page to load for a while so u can implement custom made spinners client side if u want that to be the case

// no need to ssr everything. only ssr dynamic pages which need server requests while static pages such as login forms can be left with no ssr

export default withUrqlClient(createUrqlClient, { ssr: true })(function Home() {
  const [{ data, fetching }] = usePostsQuery();

  return (
    <>
      {fetching ? (
        <>
          <div className="">Loading</div>
          <Loading />
        </>
      ) : (
        <Layout>
          <Link href="/create-post">create post</Link>
          <div>hello world</div>

          <br />
          {!data
            ? null
            : data.posts.map((p) => {
                return (
                  <div className="" key={p.id}>
                    {p.title}
                  </div>
                );
              })}
        </Layout>
      )}
    </>
  );
});
