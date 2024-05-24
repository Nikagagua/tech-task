import React from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider as Provider,
  createHttpLink,
  split,
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { useUser } from "./components/UserContext";

const ApolloProvider = ({ children }) => {
  const { user } = useUser();
  const httpLink = createHttpLink({
    uri: "http://localhost:4000/graphql",
    headers: {
      authorization: user
        ? `Bearer ${localStorage.getItem("token") || ""}`
        : "",
    },
  });

  const wsLink = new WebSocketLink({
    uri: `ws://localhost:4000/graphql`,
    options: {
      reconnect: true,
      connectionParams: {
        authorization: user
          ? `Bearer ${localStorage.getItem("token") || ""}`
          : "",
      },
    },
  });

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink,
  );

  const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });

  return <Provider client={client}>{children}</Provider>;
};

export default ApolloProvider;
