import React from "react";
import Lottie from "lottie-react";
import loadingAnimation from "@/assets/loader.json";

const LottieLoader = ({
  style = { width: 80, height: 80 },
  animationData = loadingAnimation,
  ...props
}) => (
  <Lottie animationData={animationData} loop={true} style={style} {...props} />
);

export default LottieLoader;
