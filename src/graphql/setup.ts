import { ApolloServer } from "@apollo/server";
import { authDirective } from "./directives/authDirective";
import { spaceDirective } from "./directives/spaceDirectives";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { readGqlSchemas } from "./types";
import RESOLVERS from "./resolvers/indexResolver";

const { authDirectiveTypeDefs, authDirectiveTransformer } =
  authDirective("auth");
const { spaceDirectiveTypeDefs, spaceDirectiveTransformer } =
  spaceDirective("spaceAuth");

let schema = makeExecutableSchema({
  typeDefs: [
    ...readGqlSchemas(),
    authDirectiveTypeDefs,
    spaceDirectiveTypeDefs,
  ],
  resolvers: RESOLVERS,
});

const directiveTransformers = [
  spaceDirectiveTransformer,
  authDirectiveTransformer,
];

schema = directiveTransformers.reduce(
  (curSchema, transformer) => transformer(curSchema),
  schema,
);

const plugins = [
  // Only enable playground in non-production environments
  ...(process.env.ALLOW_GQL_PLAYGROUND
    ? [ApolloServerPluginLandingPageLocalDefault({ embed: true })]
    : []),
];

/// GRAPHQL SERVER
const apolloServer = new ApolloServer({
  introspection: process.env.ALLOW_GQL_PLAYGROUND ? true : false, // Disable introspection in production
  schema,
  plugins,
  includeStacktraceInErrorResponses: false,
});

export default apolloServer;
