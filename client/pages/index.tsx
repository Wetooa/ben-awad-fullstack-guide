import NavBar from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import Loading from "../components/Loading";

export default withUrqlClient(createUrqlClient)(function Home() {
  const [{ data, fetching }] = usePostsQuery();

  return (
    <>
      {fetching ? (
        <>
          <div className="">Loading</div>
          <Loading />
        </>
      ) : (
        <>
          <NavBar />
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
        </>
      )}
    </>
  );
});
