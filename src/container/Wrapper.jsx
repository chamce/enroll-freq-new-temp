import RemoteComponent from "../components/RemoteComponent";

const Wrapper = ({ url = "https://irserver2.eku.edu/libraries/remote/wrapper.cjs", ...rest }) => (
  <RemoteComponent url={url} {...rest}></RemoteComponent>
);

export default Wrapper;
