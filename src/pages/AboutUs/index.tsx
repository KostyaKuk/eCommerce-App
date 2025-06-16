import React from "react";
import { Container, Typography, Grid, Card, CardContent, Avatar, Box, Link, IconButton } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import styles from "./AboutUs.module.css";

const AboutUs = () => {
  const developers = [
    {
      name: "Eugeniusz Potapczuk",
      role: "Frontend dev",
      description: `Evgeniy is an enthusiastic developer with strong motivation.
        Implemented the catalog page, authorization and basket!`,
      photo: "/assets/evgeniy.jpg",
      github: "https://github.com/squallerq",
    },
    {
      name: "Vitali Rydkin",
      role: "Frontend dev",
      description: `If we talk about the most experienced developer in our team, it is Vitali.
         He configured routing and created registration in the application.`,
      photo: "/assets/vitaly.png",
      github: "https://github.com/vitali007tut",
    },
    {
      name: "Kanstantsin Kukushkin",
      role: "Team Lead / Frontend dev",
      description: `Configured repository setup and development environment configuration.
      Created profile page and about us`,
      photo: "/assets/kukushkin.jpg",
      github: "https://github.com/kostyakuk",
    },
  ];

  return (
    <Container maxWidth="lg" style={{ padding: "2rem 0" }}>
      <Typography variant="h2" gutterBottom className={styles.pageTitle}>
        About our project on
        <Link href="https://rs.school/" target="_blank" rel="noopener noreferrer" style={{ lineHeight: 0 }}>
          <img
            src="/assets/rssLogo.svg"
            alt="RS School Logo"
            style={{
              width: "70px",
              height: "auto",
              cursor: "pointer",
            }}
          />
        </Link>
        school:
      </Typography>

      <Typography variant="body1" component="p" style={{ marginBottom: "3rem" }}>
        Our school exam project began a month ago with a three-person team. Today, we're proud to introduce a
        cutting-edge book purchasing and global delivery platform.
      </Typography>

      <Typography variant="h3" className={styles.teamTitle}>
        Our team:
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {developers.map((dev) => (
          <Grid container spacing={4} justifyContent="center">
            <Card className={styles.developerCard}>
              <Box className={styles.avatarContainer}>
                <Avatar alt={dev.name} src={dev.photo} className={styles.avatar} />
              </Box>
              <CardContent style={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  {dev.name}
                </Typography>
                <Box className={styles.iconContainer}>
                  <IconButton
                    aria-label={`${dev.name} GitHub`}
                    href={dev.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                  >
                    <GitHubIcon fontSize="large" />
                  </IconButton>
                </Box>
                <Typography variant="subtitle1" color="text.secondary" className={styles.roleText}>
                  {dev.role}
                </Typography>
                <Typography variant="body1" align="center" style={{ whiteSpace: "pre-line" }}>
                  {dev.description}
                </Typography>
                <Box textAlign="center" mt={2}>
                  <Link href={dev.github} target="_blank" rel="noopener noreferrer" underline="hover">
                    View GitHub Profile
                  </Link>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AboutUs;
