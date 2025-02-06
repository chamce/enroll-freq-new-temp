import RemoteComponent from "../components/RemoteComponent";

const object = {
  github: import.meta.env.wrapperUrl,
  localhost: "http://localhost:5001/remote.cjs",
};

const Wrapper = ({ url, ...rest }) => <RemoteComponent url={object.github} {...rest}></RemoteComponent>;

export default Wrapper;
