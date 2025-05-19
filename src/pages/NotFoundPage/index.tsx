import { Button, Typography } from "@mui/material";
import styles from "./styles.module.css";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useNavigate } from "react-router";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <Typography sx={{ mt: 3, mb: 3, textAlign: "center" }} variant="h3">
        ...Oops! Something is missing
      </Typography>
      <Button variant="contained" onClick={() => navigate(-1)}>
        Back
      </Button>
      <DotLottieReact
        src="https://lottie.host/05126975-df0a-47c5-bc3d-188c4290673c/XuusBlyKVG.lottie"
        loop
        autoplay
        style={{ maxWidth: "600px" }}
      />
    </div>
  );
};
