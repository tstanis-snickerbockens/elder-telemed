import React, { useCallback } from "react";
import * as firebase from "firebase/app";

import { startVideo } from "./video";
type Props = {
  user: firebase.User;
};
export const UserPage: React.FC<Props> = () => {
  const localVideoRef = useCallback((localVideo: HTMLMediaElement | null) => {
    if (localVideo) {
      startVideo(localVideo);
    }
  }, []);
  return (
    <>
      <video ref={localVideoRef} playsInline autoPlay></video>
    </>
  );
};
