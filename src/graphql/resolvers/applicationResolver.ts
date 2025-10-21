import ApplicationService from "../../services/applicationService";
import { handleGqlError } from "../../utils/error";
import type { Resolvers } from "../types/graphql";
import { PaymentStatus } from "../../types/application";

const applicationService = new ApplicationService();

const APPLICATION_RESOLVERS: Resolvers = {
    Query: {
        applications: async (_, { filter, spaceId }) => {
      try {
        return await applicationService.applications(filter || {}, spaceId);
      } catch (error) {
        throw handleGqlError({ error });
      }
    },
       application: async (_, { id }) => {
      try {
        return await applicationService.application(id);
      } catch (error) {
        throw handleGqlError({ error });
      }
    },

     payments: async (_, { applicationNumber, allocationNumber, spaceId }) => {
      try {
        return await applicationService.payments(
          applicationNumber,
          allocationNumber,
          spaceId
        );
      } catch (error) {
        throw handleGqlError({ error });
      }
    },

     payment: async (_, { id }) => {
      try {
        return await applicationService.payment(id);
      } catch (error) {
        throw handleGqlError({ error });
      }
    },
  

    },
    Mutation: {
        studentBook: async (_, { input, spaceId }) => {
      try {
         return await applicationService.studentBook(input, spaceId);
      } catch (error) {
        return handleGqlError({error});
      }
    },

      parentBulkBook: async (_, { inputs }, { spaceId }) => {
        try {
        return await applicationService.parentBulkBook(inputs, spaceId!);
      } catch (error) {
        handleGqlError({ error });
        return [];
      }
      },

      approveApplication: async (
      _: unknown,
      args: { applicationId: string; spaceId: string },
    ) => {
      try {
        const { applicationId, spaceId } = args;
        return await applicationService.approveApplication(
          applicationId,
          spaceId,
        );
      } catch (error) {
        handleGqlError({ error });
      }
    },

     payHostelFee: async (_: unknown, args: { applicationNumber: string }) => {
      try {
        const { applicationNumber } = args;
        return await applicationService.payHostelFee(applicationNumber);
      } catch (error) {
       return handleGqlError({ error });
      }
    },

    recordPayment: async (
      _: unknown,
      args: { applicationNumber: string; status: PaymentStatus },
    ) => {
      try {
        const { applicationNumber, status } = args;
        return await applicationService.recordPayment(
          applicationNumber,
          status,
        );
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    verifyPayment: async (_: unknown, args: { reference: string }) => {
      try {
        const { reference } = args;
        return await applicationService.verifyPayment(reference);
      } catch (error) {
        handleGqlError({ error });
        return false;
      }
    },

    deleteApplication: async (_: unknown, args: { applicationId: string}) => {
      try {
        const { applicationId } = args;
        return await applicationService.deleteApplication(applicationId)
      } catch (error) {
        handleGqlError ({error})
        return false
      }
    },
  }
}
export default APPLICATION_RESOLVERS;