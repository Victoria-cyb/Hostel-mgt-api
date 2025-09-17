import UserService from "../../services/userService";
import { handleGqlError } from "../../utils/error";
import type { Resolvers } from "../types/graphql";


const userService = new UserService();

const USER_RESOLVER: Resolvers = {

    Query: {
       user: async (_, __, {userId}) => {
        try {
            const data = await userService.getUserById(userId)
            return {...data, spaces: []}
        } catch (error) {
            return handleGqlError({error})
        }
       },
    },

    Mutation: {
        signup: async (_, {input}) => {
            try {
                const data = await userService.signUp(input);
                return { token: data };
            } catch (error) {
                return handleGqlError({error})
            }
        },

        login: async (_, {identifier, password}) => {
            try {
                const data = await userService.login(identifier, password)
                return {token: data}
            } catch (error) {
                return handleGqlError({error})
            }
        }
    },
}

export default USER_RESOLVER;