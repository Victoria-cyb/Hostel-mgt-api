import HostelService from "../../services/hostelService";
import { handleGqlError } from "../../utils/error";
import type { Resolvers } from "../types/graphql";

const hostelService = new HostelService();

const HOSTEL_RESOLVERS: Resolvers = {
  Query: {
    hostels: async (_, { spaceId }) => {
      try {
        return await hostelService.hostels(spaceId);
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    hostel: async (_, { id }) => {
      try {
        return await hostelService.hostel(id);
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    publicHostels: async () => {
      try {
        return await hostelService.publicHostels();
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    publicHostel: async (_, { id }) => {
      try {
        return await hostelService.publicHostel(id);
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    rooms: async (_, { hostelId }) => {
      try {
        return await hostelService.rooms(hostelId);
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    room: async (_, { id }) => {
      try {
        return await hostelService.Room(id);
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    beds: async (_, { roomId }) => {
      try {
        return await hostelService.beds(roomId);
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    bed: async (_, { id }) => {
      try {
        return await hostelService.bed(id);
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    stayTypes: async (_, { spaceId }) => {
      try {
        return await hostelService.getStayTypes(spaceId);
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    stayType: async (_, { id }) => {
      try {
        return await hostelService.getStayType(id);
      } catch (error) {
        return handleGqlError({ error });
      }
    },
  },
  Mutation: {
    createHostel: async (_, { input, spaceId }) => {
      try {
        return await hostelService.createHostels(input, spaceId);
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    createRoom: async (_, { input, hostelId, spaceId }) => {
      try {
        return await hostelService.createRoom(input, hostelId, spaceId);
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    createBed: async (_, { input, roomId, spaceId }) => {
      try {
        return await hostelService.createBed(input, roomId, spaceId);
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    updateHostel: async (_, { id, input, spaceId }) => {
      try {
        return await hostelService.updateHostel(input, id, spaceId);
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    updateBed: async (_, { id, input, spaceId }) => {
      try {
        return await hostelService.updateBed(input, id, spaceId);
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    updateRoom: async (_, { id, input, spaceId }) => {
      try {
        return await hostelService.updateRoom(input, id, spaceId);
      } catch (error) {
        return handleGqlError({ error });
      }
    },

    createStayType: async (_, { spaceId, name, startDate, endDate }) => {
      try {
        return await hostelService.createStayType(
          spaceId,
          name,
          startDate,
          endDate,
        );
      } catch (error) {
        return handleGqlError({ error });
      }
    },
  },
};

export default HOSTEL_RESOLVERS;
