import SpaceService from "../../services/spaceServices";
import { handleGqlError } from "../../utils/error";
import type { Resolvers } from "../types/graphql";


const spaceService = new SpaceService()

const SPACE_RESOLVER: Resolvers = {

    Mutation: {
        createSpace: async (_, {input}, {userId}) => {
            try {
                const data = await spaceService.createSpace(input, userId)
                // Ensure createdAt and updatedAt are strings (ISO format)
                return {
                    ...data,
                    createdAt: data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt,
                    updatedAt: data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt,
                }
            } catch (error) {
                return handleGqlError({error})
            }
        },
    }
}

export default SPACE_RESOLVER;