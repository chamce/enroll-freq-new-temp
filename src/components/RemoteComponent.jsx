import { createRemoteComponent, createRequires } from "@paciolan/remote-component";
import ReactDOM from "react-dom";
import React from "react";

const requires = createRequires({
  "react-dom": ReactDOM,
  react: React,
});

const RemoteComponent = createRemoteComponent({ requires });

export default RemoteComponent;
