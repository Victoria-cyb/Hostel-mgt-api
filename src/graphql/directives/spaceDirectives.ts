// import { MapperKind, getDirective, mapSchema } from "@graphql-tools/utils";
// import { GraphQLSchema } from "graphql/index";
// import { formatError, CustomError } from "../../utils/error";

// const spaceService = new SpaceService();

// export const spaceDirective = (directiveName: string) => {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const typeDirectiveArgumentMaps: Record<string, any> = {};
//   return {
//     spaceDirectiveTypeDefs: `directive @${directiveName}(requires: [SpaceRole!] = [student], isExact: Boolean = false) on OBJECT | FIELD_DEFINITION 
//       enum SpaceRole {
//         student
//         parent
//         admin
//       }
//     `,
//     spaceDirectiveTransformer: (schema: GraphQLSchema) =>
//       mapSchema(schema, {
//         [MapperKind.TYPE]: (type) => {
//           const authDirective = getDirective(schema, type, directiveName)?.[0];
//           if (authDirective) {
//             typeDirectiveArgumentMaps[type.name] = authDirective;
//           }
//           return undefined;
//         },
//         [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
//           const authDirective =
//             getDirective(schema, fieldConfig, directiveName)?.[0] ??
//             typeDirectiveArgumentMaps[typeName];

//           if (authDirective) {
//             const { requires: roles, isExact } = authDirective;
//             const { resolve } = fieldConfig;

//             fieldConfig.resolve = async function (source, args, context, info) {
//               try {
//                 const userId = context.userId;
//                 if (!userId)
//                   throw new CustomError("User authentication failed");

//                 const spaceId = args?.spaceId ?? args.input?.spaceId;
//                 const alias = args?.alias ?? args.input?.alias;
//                 if (!spaceId && !alias)
//                   throw new CustomError("spaceId or alias is required");

//                 // Check if space is active
//                 const space = spaceId
//                   ? await spaceService.getSpaceById(spaceId)
//                   : await spaceService.getSpaceByAlias(alias);
//                 if (!space) {
//                   throw new CustomError("space not found");
//                 } else if (!space.active) {
//                   throw new CustomError("space is deactivated");
//                 }

//                 const userSpaceRole = await spaceService.getSpaceUserRole(
//                   userId,
//                   space.id, // use resolved ID always
//                 );

//                 if (!hasRole(roles, userSpaceRole, isExact)) {
//                   throw new CustomError("Not authorized");
//                 }

//                 context = {
//                   userId,
//                   ...context,
//                   userSpaceRole,
//                 };

//                 return resolve?.(source, args, context, info);
//               } catch (error) {
//                 console.error("[Error]: Verification failed", error);
//                 throw new CustomError(formatError(error));
//               }
//             };
//             return fieldConfig;
//           }
//         },
//       }),
//   };
// };

// export const hasRole = (
//   permissionRoles: string[] | string,
//   userRole: string,
//   isExact: boolean,
// ) => {
//   const ROLES = ["student", "parent", "admin"];
//   const requiredRoles = Array.isArray(permissionRoles)
//     ? permissionRoles
//     : [permissionRoles];

//   if (isExact) {
//     // user role must exactly match one of the required roles
//     return requiredRoles.includes(userRole);
//   }

//   // hierarchical check (higher roles inherit lower privileges)
//   const tokenIndex = ROLES.indexOf(userRole);

//   return requiredRoles.some((role) => {
//     const roleIndex = ROLES.indexOf(role);
//     return roleIndex >= 0 && tokenIndex >= roleIndex;
//   });
// };
