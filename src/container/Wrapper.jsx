import RemoteComponent from "../components/RemoteComponent";

const Wrapper = ({ url = import.meta.env.wrapperUrl, ...rest }) => (
  <RemoteComponent url={url} {...rest}></RemoteComponent>
);

export default Wrapper;
