import React, { useEffect, useState } from "react";
import { useQuery, gql, useSubscription } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import { Alert } from "@mui/material";

const GLOBAL_SIGN_IN_COUNT_QUERY = gql`
  query globalSignInCount {
    globalSignInCount
  }
`;

const SIGN_IN_COUNT_SUBSCRIPTION = gql`
  subscription {
    signInCountUpdated
  }
`;

const Dashboard = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const { data: globalData, refetch: refetchGlobal } = useQuery(
    GLOBAL_SIGN_IN_COUNT_QUERY,
  );
  const [globalSignInCount, setGlobalSignInCount] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useSubscription(SIGN_IN_COUNT_SUBSCRIPTION, {
    onData: ({ subscriptionData }) => {
      if (subscriptionData.data) {
        setGlobalSignInCount(subscriptionData.data.signInCountUpdated);
        refetchGlobal();
      }
    },
  });

  useEffect(() => {
    if (globalData) {
      setGlobalSignInCount(globalData.globalSignInCount);
    }
  }, [globalData]);

  useEffect(() => {
    if (globalSignInCount >= 5) {
      setOpenSnackbar(true);
    }
  }, [globalSignInCount]);

  useEffect(() => {
    if (!user) {
      console.log("Not authenticated, redirecting to login...");
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 0);
    }
  }, [user, logout, navigate]);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Button
            color="inherit"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.username}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Your Sign-In Count
                </Typography>
                <Typography variant="h2">{user.signInCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Global Sign-In Count
                </Typography>
                <Typography variant="h2">{globalSignInCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="info">
          Global sign-in count has reached 5!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Dashboard;
