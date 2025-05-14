import { Box, Button, Typography } from "@mui/material";
import RegistrationForm from "../../components/RegistrationForm";
import styles from "./styles.module.css";
import { createCustomer } from "../../api/createCustomer";

export const RegisterPage = () => {
  return (
    <div className={styles.container}>
      <Button variant="contained" onClick={() => createCustomer()}>
        createCustomerTest
      </Button>
      <Typography sx={{ mt: 3, mb: 3 }} variant="h4">
        Create Account
      </Typography>
      <Box sx={{ mb: 3 }}>
        <RegistrationForm />
      </Box>
    </div>
  );
};
