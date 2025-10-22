import { MapperKind, getDirective, mapSchema } from "@graphql-tools/utils";
import { GraphQLSchema, defaultFieldResolver } from "graphql";
import { CustomError, formatError } from "../../utils/error";
import { verifyToken } from "../../utils/token";
import UserService from "../../services/userService";

const userService = new UserService();

// Auth directive
export const authDirective = (directiveName: string) => {
  // store role requirements for object-level directives
  const typeDirectiveArgumentMaps: Record<string, any> = {};

  return {
    authDirectiveTypeDefs: `
      directive @${directiveName}(requires: Role = user) on OBJECT | FIELD_DEFINITION
      
      enum Role {
        user
        cit_admin
      }
    `,
    authDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.TYPE]: (type) => {
          const authDirective = getDirective(schema, type, directiveName)?.[0];
          if (authDirective) {
            typeDirectiveArgumentMaps[type.name] = authDirective;
          }
          return undefined;
        },
        [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
          const authDirective =
            getDirective(schema, fieldConfig, directiveName)?.[0] ??
            typeDirectiveArgumentMaps[typeName];

          if (authDirective) {
            const { requires: role } = authDirective;
            const { resolve = defaultFieldResolver } = fieldConfig;

            fieldConfig.resolve = async function (source, args, context, info) {
              try {
                if (!context?.authToken) {
                  throw new CustomError("Authentication token missing");
                }

                // Verify token
                const { userId, ...tokenData } = verifyToken(context.authToken);

                // Load user from DB
                const user = await userService.getUserById(userId);
                if (!user) {
                  throw new CustomError("User not found");
                }

                // Check roles
                if (!hasRole(role, user.role)) {
                  throw new CustomError("Not authorized");
                }

                // Attach user + token data to context
                context = {
                  ...context,
                  userId,
                  user,
                  ...tokenData,
                };

                return resolve(source, args, context, info);
              } catch (error) {
                console.error("[Auth Error]:", error);
                throw new CustomError(formatError(error));
              }
            };

            return fieldConfig;
          }
          return fieldConfig;
        },
      }),
  };
};

// Role hierarchy: user < cit_admin
export const hasRole = (requiredRole: string, userRole: string) => {
  const ROLES = ["user", "cit_admin"];
  const userIndex = ROLES.indexOf(userRole);
  const requiredIndex = ROLES.indexOf(requiredRole);

  return requiredIndex >= 0 && userIndex >= requiredIndex;
};
