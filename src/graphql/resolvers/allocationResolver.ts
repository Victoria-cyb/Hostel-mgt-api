import AllocationService from "../../services/allocationService";
import { handleGqlError } from "../../utils/error";
import type { Resolvers} from "../types/graphql";
import {  type ApplyInput } from "../../types/application";

const allocationService = new AllocationService();

const ALLOCATION_RESOLVERS: Resolvers = {
Query: {
    allocations: async (_, { filter }) => {
        try {
            return await allocationService.allocations(filter || {});
        } catch (error) {
                return handleGqlError({ error });
            }
    },

    allocation: async (_, { id }) => {
        try {
            return await allocationService.allocation(id);
        } catch (error) {
            return handleGqlError({ error });
        }
    }
}, 

Mutation: {
  adminBulkAllocate: async ( _: unknown,
            { inputs, spaceId }: { inputs: ApplyInput[]; spaceId: string },
        ) => {
            try {
                return await allocationService.adminBulkAllocate(inputs, spaceId);
            } catch (error) {
                return handleGqlError({ error });
            }
        },

      checkIn: async (_, { allocationId }) => {
      try {
        return await allocationService.checkIn(allocationId);
      } catch (error) {
        handleGqlError({ error });
        return false;
      }
    }, 
    
     checkOut: async (_, { allocationId }) => {
      try {
        return await allocationService.checkOut(allocationId);
      } catch (error) {
        handleGqlError({ error });
        return false;
      }
    },

    markLeave: async (
      _,
      { allocationId, reason, signOutDate, expectedReturn, spaceId },
    ) => {
      try {
        return await allocationService.markLeave(
          allocationId,
          reason,
          signOutDate,
          expectedReturn,
          spaceId,
        );
      } catch (error) {
       throw handleGqlError({ error });
        
      }
    },

}
}

export default ALLOCATION_RESOLVERS;