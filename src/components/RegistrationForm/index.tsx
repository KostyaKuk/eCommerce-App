import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import dayjs, { Dayjs } from "dayjs";
import {
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// List of countries for the country selector
const COUNTRIES = ["United States", "Canada", "United Kingdom", "Germany", "France", "Australia"];

// Define the form data type first
interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Dayjs | null;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// Validation schema using Yup with the same type
const schema: yup.ObjectSchema<FormData> = yup.object().shape({
  email: yup.string().email("Please enter a valid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  firstName: yup
    .string()
    .required("First name is required")
    .matches(/^[a-zA-Z]+$/, "First name must contain only letters"),
  lastName: yup
    .string()
    .required("Last name is required")
    .matches(/^[a-zA-Z]+$/, "Last name must contain only letters"),
  dateOfBirth: yup
    .mixed<Dayjs>()
    .required("Date of birth is required")
    .test("is-valid-date", "Please enter a valid date", (value) => {
      if (!value) return false;
      return dayjs(value).isValid();
    })
    .test("is-old-enough", "You must be at least 13 years old", (value) => {
      if (!value) return false;
      return dayjs().diff(dayjs(value), "year") >= 13;
    }),
  street: yup.string().required("Street address is required"),
  city: yup
    .string()
    .required("City is required")
    .matches(/^[a-zA-Z\s]+$/, "City must contain only letters"),
  postalCode: yup
    .string()
    .required("Postal code is required")
    .test("postal-code-format", "Invalid postal code format", function (value) {
      const country = this.parent.country;
      if (country === "United States") {
        return /^\d{5}(-\d{4})?$/.test(value || "");
      }
      if (country === "Canada") {
        return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(value || "");
      }
      return true;
    }),
  country: yup.string().required("Country is required"),
});

const RegistrationForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      dateOfBirth: null,
      street: "",
      city: "",
      postalCode: "",
      country: "",
    },
    mode: "onBlur",
  });

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    alert("Registration successful!");
  };

  const watchedCountry = watch("country");

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{
        maxWidth: 600,
        mx: "auto",
        p: 3,
        boxShadow: 1,
        borderRadius: 1,
        background: "#fff",
      }}
    >
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            {...register("firstName")}
            label="First Name"
            variant="outlined"
            fullWidth
            margin="normal"
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            {...register("lastName")}
            label="Last Name"
            variant="outlined"
            fullWidth
            margin="normal"
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
          />
        </Grid>
      </Grid>

      <TextField
        {...register("email")}
        label="Email"
        type="email"
        variant="outlined"
        fullWidth
        margin="normal"
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      <TextField
        {...register("password")}
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        error={!!errors.password}
        helperText={errors.password?.message}
      />

      <Controller
        name="dateOfBirth"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              {...field}
              value={field.value}
              label="Date of Birth"
              format="MM/DD/YYYY"
              onChange={field.onChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal",
                  error: !!error,
                  helperText: error?.message,
                },
              }}
            />
          </LocalizationProvider>
        )}
      />

      <Typography variant="h6" component="h2" gutterBottom mt={2} color="info">
        Address Information
      </Typography>

      <TextField
        {...register("street")}
        label="Street Address"
        variant="outlined"
        fullWidth
        margin="normal"
        error={!!errors.street}
        helperText={errors.street?.message}
      />

      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            {...register("city")}
            label="City"
            variant="outlined"
            fullWidth
            margin="normal"
            error={!!errors.city}
            helperText={errors.city?.message}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            {...register("postalCode")}
            label="Postal Code"
            variant="outlined"
            fullWidth
            margin="normal"
            error={!!errors.postalCode}
            helperText={
              watchedCountry === "United States"
                ? "Enter a valid US ZIP code (e.g., 12345 or 12345-6789)"
                : watchedCountry === "Canada"
                  ? "Enter a valid Canadian postal code (e.g., A1B 2C3)"
                  : errors.postalCode?.message
            }
          />
        </Grid>
      </Grid>

      <FormControl fullWidth margin="normal" error={!!errors.country}>
        <InputLabel id="country-label">Country</InputLabel>
        <Select {...register("country")} labelId="country-label" label="Country" value={watch("country")}>
          {COUNTRIES.map((country) => (
            <MenuItem key={country} value={country}>
              {country}
            </MenuItem>
          ))}
        </Select>
        {errors.country && <FormHelperText>{errors.country?.message}</FormHelperText>}
      </FormControl>

      <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ mt: 3 }}>
        Register
      </Button>
    </Box>
  );
};

export default RegistrationForm;
