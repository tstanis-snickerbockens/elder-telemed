import * as firebaseLib from "firebase/app";

export const firebaseInit = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const firebase = firebaseLib;
  const response = await fetch("/__/firebase/init.js");
  const body = await response.text();
  // eslint-disable-next-line no-eval
  eval(body);
};
