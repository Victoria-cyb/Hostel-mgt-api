import SpaceService from "../../services/spaceServices";
import { handleGqlError } from "../../utils/error";
import type { Resolvers } from "../types/graphql";

const spaceService = new SpaceService();

const SPACE_RESOLVER: Resolvers = {
  Query: {
    space: async (_, { id }, { userId }) => {
      try {
        const space = await spaceService.getSpaceById(id);
        const role = await spaceService.getSpaceUserRole(userId, id);
        if (!role) throw new Error("Access denied");

        return space;
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    spaces: async (_, { userId }) => {
      try {
        return await spaceService.getSpacesForUser(userId!);
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    publicSpaces: async (_, {}) => {
      try {
        return await spaceService.getPublicSpaces();
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    publicSpace: async (_, { id }) => {
      try {
        return await spaceService.getPublicSpaceById(id);
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    classes: async (_, { spaceId }) => {
      try {
        return await spaceService.getClassesForSpace(spaceId);
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    class: async (_, { id }) => {
      try {
        return await spaceService.getClassById(id);
      } catch (error) {
        return handleGqlError({ error });
      }
    },
  },

  Mutation: {
    createSpace: async (_, { input }, { userId }) => {
      try {
       return await spaceService.createSpace(input, userId);
        // Ensure createdAt and updatedAt are strings (ISO format)
        // return {
        //   ...data,
        //   // createdAt: data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt,
        //   // updatedAt: data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt,
        //   createdAt:
        //     typeof data.createdAt === "string"
        //       ? new Date(data.createdAt).toISOString()
        //       : (data.createdAt as Date).toISOString(),
        //   updatedAt:
        //     typeof data.updatedAt === "string"
        //       ? new Date(data.updatedAt).toISOString()
        //       : (data.updatedAt as Date).toISOString(),
        // };
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    createSpaceUsers: async (_, { inputs, spaceId }) => {
      try {
        return await spaceService.createSpaceUsers(inputs, spaceId);
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    linkParentToStudent: async (_, { spaceId, parentId, studentId }) => {
      try {
        return await spaceService.linkParentToStudent(
          spaceId,
          parentId,
          studentId,
        );
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    createClass: async (_, { spaceId, names }) => {
      try {
        return await spaceService.createClass(spaceId, names);
      } catch (error) {
        return handleGqlError({ error });
      }
    },
  },
};

export default SPACE_RESOLVER;
