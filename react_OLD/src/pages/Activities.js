import Neon from "../componets/Neon";

export default function ErrorNotFound() {
  return (
    <>
      <link rel="canonical" href="https://asimonson.com/activities"></link>
      <Neon color="#fff">
        <h1 className="neon">ERROR 404</h1>
        <br />
        <h3 className="neon">URL Not Found</h3>
      </Neon>
    </>
  );
}
