
import { HostelRepository } from "../repositories/hostel";
import { Status, type HostelInput, type RoomInput, type BedInput, BedStatus, type UpdateHostelInput, type UpdateRoomInput, type UpdateBedInput} from "../types/hostel";
import { Gender } from "../types/user";
import { CustomError } from "../utils/error";



class HostelService {
    private hostelRepository: HostelRepository;

    constructor() {
        this.hostelRepository = new HostelRepository();
    }

   

createHostels = async (inputs: HostelInput[], spaceId: string) => {
  const results = [];

  for (const input of inputs) {
    const { name, gender, status } = input;

    const rooms: RoomInput[] = (input.rooms ?? []).map((room) => ({
      ...room,
      beds: room.beds ?? [],
      status: room.status ?? Status.Active,
    }));
    

    // Create hostel
    const hostel = await this.hostelRepository.createHostel({
      data: {
        name,
        gender,
        status: status ?? Status.Active,
        space: { connect: { id: spaceId } },
        // roomCount: rooms.length,
        // availableBeds: rooms.reduce(
        //   (acc, r) => acc + (r.beds ? r.beds.length : 0),
        //   0
        // ),
      },
    });

    // Create rooms & beds
    for (const roomInput of rooms) {
      const { beds: roomBeds, ...roomData } = roomInput;

      // Capacity check
      const bedCount = roomBeds?.length ?? 0;
      if (roomData.capacity && bedCount > roomData.capacity) {
        throw new CustomError(
          `Room "${roomData.label ?? "Unnamed"}" exceeds its capacity of ${roomData.capacity} beds. (${bedCount} provided)`
        );
      }

      const room = await this.hostelRepository.createRoom({
        data: {
          ...roomData,
          hostelId: hostel.id,
          status: roomData.status ?? Status.Active,
        },
      });

      const beds: BedInput[] = roomBeds ?? [];

      for (const bedInput of beds) {
        await this.hostelRepository.createBed({
          data: {
            label: bedInput.label,
            status: bedInput.status ?? BedStatus.Available,
            amount: bedInput.amount,
            roomId: room.id,
          },
        });
      }
    }

    // Fetch and format
    const fullHostel = await this.hostelRepository.findUniqueHostel({
      where: { id: hostel.id },
      include: {
        rooms: { include: { beds: true } },
      },
    });

    if (!fullHostel) throw new CustomError("Hostel not found");

    results.push({
      ...fullHostel,
      spaceId,
      createdAt: fullHostel.createdAt.toISOString(),
      updatedAt: fullHostel.updatedAt.toISOString(),
      gender: fullHostel.gender as Gender,
      status: fullHostel.status as Status,
      rooms: fullHostel.rooms.map(r => ({
     ...r,
     status: r.status as Status,
      beds: r.beds.map(b => ({
      ...b,
      status: b.status as BedStatus,
  })),
})),
    });
  }

  return true;
};


createRoom = async (input: RoomInput, hostelId: string, spaceId: string) => {
  const { label, capacity, status, beds: roomBeds } = input;

  // 1️⃣ Verify hostel exists
  const hostel = await this.hostelRepository.findUniqueHostel({
    where: { id: hostelId },
  });

  if (!hostel || hostel.spaceId !== spaceId) {
    throw new CustomError("Hostel not found or does not belong to this space");
  }

   // 2️⃣ Capacity validation
  const beds: BedInput[] = roomBeds ?? [];
  if (beds.length > capacity) {
    throw new CustomError(
      `Cannot create ${beds.length} bedspaces — exceeds room capacity of ${capacity}`
    );
  }

  

  // 3️⃣ Create the room
  const room = await this.hostelRepository.createRoom({
    data: {
      label,
      capacity,
      status: status ?? Status.Active,
      hostelId: hostel.id,
    },
  });

  // 4️⃣ Create beds if provided
  for (const bedInput of beds) {
    await this.hostelRepository.createBed({
      data: {
      label: bedInput.label,
      status: bedInput.status ?? BedStatus.Available,
      amount: bedInput.amount,
      roomId: room.id,
      },
    });
  }

  // 5️⃣ Fetch the room with beds for return
  const createdRoom = await this.hostelRepository.findUniqueRoom({
    where: { id: room.id },
    include: { beds: true, hostel: true },
  });

  if (!createdRoom) throw new CustomError("Room creation failed");

  // 6️⃣ Convert dates to strings for GraphQL
  const formattedRoom = {
    ...createdRoom,
    status: createdRoom.status as Status,
    beds: createdRoom.beds.map(b => ({
      ...b,
      status: b.status as BedStatus,
    })),
    hostel: {
      ...createdRoom.hostel,
      createdAt: createdRoom.hostel.createdAt.toISOString(),
      updatedAt: createdRoom.hostel.updatedAt.toISOString(),
      status: createdRoom.hostel.status as Status,
      gender: createdRoom.hostel.gender as Gender,
    },
  };

  return formattedRoom;
};

createBed = async (input: BedInput, roomId: string, spaceId: string) => {
  const { label, status, amount, hostelId } = input;

  if (!hostelId) throw new CustomError("Hostel ID is required");

  // 1️⃣ Verify room exists and belongs to a hostel in this space
  const hostel = await this.hostelRepository.findUniqueHostel({
    where: { id: hostelId },
    include: { space: true },
  });

   if (!hostel || hostel.spaceId !== spaceId) {
    throw new CustomError("Hostel not found or does not belong to this space");
  }

   // 2️⃣ Verify that the room exists and belongs to that hostel
  const room = await this.hostelRepository.findUniqueRoom({
    where: { id: roomId },
    include: { hostel: true, beds: true },
  });

  if (!room || room.hostel.id !== hostelId) {
    throw new CustomError("Room not found or does not belong to this hostel");
  }

    // 3️⃣ Capacity validation
  if (room.beds.length >= room.capacity) {
    throw new CustomError(
      `Cannot create new bed — room '${room.label}' has reached its capacity of ${room.capacity}`
    );
  }

  // 4️⃣ Create the bed
  const bed = await this.hostelRepository.createBed({
    data: {
      label,
    status: status ?? BedStatus.Available,
    amount,
    roomId: room.id
    },
  });

  // 5️⃣ Fetch bed with relations
  const createdBed = await this.hostelRepository.findUniqueBed({
    where: { id: bed.id },
    include: {
      room: { include: { hostel: true, beds: true } },
      
    },
  });

  if (!createdBed) throw new CustomError("Bed creation failed");

  // 6️⃣ Format return for GraphQL (mirror createRoom)
  const formattedBed = {
    ...createdBed,
    status: createdBed.status as BedStatus,   // ✅ fix mismatch here
    room: {
      ...createdBed.room,
      status: createdBed.room.status as Status,
      beds: createdBed.room.beds.map(b => ({
        ...b,
        status: b.status as BedStatus,        // ✅ also fix nested beds
      })),
      hostel: {
        ...createdBed.room.hostel,
        createdAt: createdBed.room.hostel.createdAt.toISOString(),
        updatedAt: createdBed.room.hostel.updatedAt.toISOString(),
        gender: createdBed.room.hostel.gender as Gender,
        status: createdBed.room.hostel.status as Status,
      },
    },
  };

  return formattedBed;
};

 updateHostel = async (input: UpdateHostelInput, id: string, spaceId: string) => {
  // 1️⃣ Verify hostel exists
  const hostel = await this.hostelRepository.findUniqueHostel({
    where: { id },
    include: { rooms: { include: { beds: true } } },
  });

  if (!hostel || hostel.spaceId !== spaceId) {
    throw new CustomError("Hostel not found or does not belong to this space");
  }

  // 2️⃣ Update hostel
  const updated = await this.hostelRepository.updateHostel({
    where: { id },
    data: {
      ...(input.name != null && { name: { set: input.name } }),
      ...(input.gender != null && { gender: { set: input.gender } }),
      ...(input.status != null && { status: { set: input.status } }),
     },
    include: { rooms: { include: { beds: true, hostel: true } } },
  });

  if (!updated) throw new CustomError("Hostel update failed");

  // 3️⃣ Format return for GraphQL (like createRoom)
  const formattedHostel = {
    ...updated,
    gender: updated.gender as Gender,
    status: updated.status as Status,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    rooms: updated.rooms.map(r => ({
      ...r,
      status: r.status as Status,
      beds: r.beds.map(b => ({
        ...b,
        status: b.status as BedStatus,
      })),
      hostel: {
        ...r.hostel,
        createdAt: r.hostel.createdAt.toISOString(),
        updatedAt: r.hostel.updatedAt.toISOString(),
        status: r.hostel.status as Status,
        gender: r.hostel.gender as Gender,
      },
    })),
  };

  return formattedHostel;
};


 updateRoom = async (input: UpdateRoomInput, id: string, spaceId: string) => {
  const room = await this.hostelRepository.findUniqueRoom({
    where: { id },
    include: { hostel: true, beds: true },
  });

  if (!room || room.hostel.spaceId !== spaceId) {
    throw new CustomError("Room not found in this space");
  }

  // Capacity check — only if updating capacity
  if (input.capacity != null) {
    const existingBedCount = room.beds?.length ?? 0;
    if (input.capacity < existingBedCount) {
      throw new CustomError(
        `Cannot reduce room capacity to ${input.capacity} — there are already ${existingBedCount} beds in this room.`
      );
    }
  }

  const updated = await this.hostelRepository.updateRoom({
    where: { id },
    data: {
      ...(input.label != null && { label: input.label }),
      ...(input.capacity != null && { capacity: input.capacity }),
      ...(input.status != null && { status: input.status as Status }),
    },
    include: { beds: true, hostel: true },
  });

  if (!updated) throw new CustomError("Room update failed");

  // 🛠 Format return object for GraphQL
  const formattedRoom = {
    ...updated,
    status: updated.status as Status,
    beds: updated.beds.map(b => ({
      ...b,
      status: b.status as BedStatus,
    })),
    hostel: {
      ...updated.hostel,
      status: updated.hostel.status as Status,
      gender: updated.hostel.gender as Gender,
      createdAt: updated.hostel.createdAt.toISOString(),
      updatedAt: updated.hostel.updatedAt.toISOString(),
    },
  };

  return formattedRoom;
};


  updateBed = async (input: UpdateBedInput, id: string, spaceId: string) => {
  const bed = await this.hostelRepository.findUniqueBed({
    where: { id },
    include: { room: { include: { hostel: true } } },
  });

  if (!bed || bed.room.hostel.spaceId !== spaceId) {
    throw new CustomError("Bed not found in this space");
  }

  const updated = await this.hostelRepository.updateBed({
    where: { id },
    data: {
      ...(input.label != null && { label: input.label }),
      ...(input.amount != null && { amount: input.amount }),
      ...(input.status != null && { status: input.status as BedStatus })
    },
    include: {
      room: { include: { hostel: true, beds: true } },
      
    },
  });

  if (!updated) throw new CustomError("Bed update failed");

  // 🛠 Format to GraphQL-friendly object (like updateHostel does)
  const formattedBed = {
    ...updated,
    status: updated.status as BedStatus,
    room: {
      ...updated.room,
      status: updated.room.status as Status,
      beds: updated.room.beds.map(b => ({
        ...b,
        status: b.status as BedStatus,
      })),
      hostel: {
        ...updated.room.hostel,
        status: updated.room.hostel.status as Status,
        gender: updated.room.hostel.gender as Gender,
        createdAt: updated.room.hostel.createdAt.toISOString(),
        updatedAt: updated.room.hostel.updatedAt.toISOString(),
      },
    },
  };

  return formattedBed;
};

createStayType = async (
  spaceId: string,
  name: string,
  startDate: string,
  endDate: string
) => {

     const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("-").map(Number);
    if (
      typeof day !== "number" || isNaN(day) ||
      typeof month !== "number" || isNaN(month) ||
      typeof year !== "number" || isNaN(year)
    ) {
      throw new CustomError(`Invalid date string: ${dateStr}`);
    }
     return new Date(Date.UTC(year, month - 1, day)); // JS months are 0-indexed
  };

  // 1️⃣ Create stay type in DB
  const stayType = await this.hostelRepository.createStayType({
    data: {
      spaceId,
      name,
      startDate: parseDate(startDate),
      endDate: parseDate(endDate),
    },
    include: {
      space: {
        include: {
          classes: true,
          hostels: true,
          stayTypes: true,
          createdBy: true,
          spaceUsers: true,
        },
      },
    },
  });

  if (!stayType) throw new CustomError("Failed to create StayType");

  // 2️⃣ Map nested objects for GraphQL
  const space = stayType.space;

  const formattedSpace = {
    id: space.id,
    name: space.name,
    createdAt: space.createdAt.toISOString(),
    updatedAt: space.updatedAt.toISOString(),
    createdById: space.createdById,
    createdBy: {
      ...space.createdBy,
      createdAt: space.createdBy.createdAt.toISOString(),
      updatedAt: space.createdBy.updatedAt.toISOString(),
    },
    classes: space.classes.map(c => ({
      ...c,
      names: Array.isArray(c.name) ? c.name : [],
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    hostels: space.hostels.map(h => ({
      ...h,
      createdAt: h.createdAt.toISOString(),
      updatedAt: h.updatedAt.toISOString(),
      status: h.status as Status,
      gender: h.gender as Gender,
    })),
    stayTypes: space.stayTypes.map(s => ({
      ...s,
      startDate: s.startDate.toISOString(),
      endDate: s.endDate.toISOString(),
      space: {
          id: space.id,
          name: space.name,
        },
    })),
    users: space.spaceUsers.map(u => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    })),
  };

  // 3️⃣ Return GraphQL-ready StayType
  return {
    id: stayType.id,
    name: stayType.name,
    startDate: stayType.startDate.toISOString(),
    endDate: stayType.endDate.toISOString(),
    spaceId: stayType.spaceId,
    space: {
      ...formattedSpace,
      stayTypes: [], // Prevent circular ref
      users: [],    // Prevent circular ref
    },
  };
};




hostels = async (spaceId: string) => {
  // 1️⃣ Fetch all hostels in the space
  const hostels = await this.hostelRepository.findHostels({
    where: { spaceId },
    include: { rooms: { include: { beds: true } } },
  });

  // 2️⃣ Format hostels for GraphQL
  return hostels.map(h => ({
    ...h,
    gender: h.gender as Gender,
    status: h.status as Status,
    createdAt: h.createdAt.toISOString(),
    updatedAt: h.updatedAt.toISOString(),
    rooms: h.rooms.map(r => ({
      ...r,
      status: r.status as Status,
      beds: r.beds.map(b => ({
        ...b,
        status: b.status as BedStatus,
      })),
    })),
  }));
};


hostel = async (id: string) => {
  // 1️⃣ Fetch hostel by ID
  const hostel = await this.hostelRepository.findUniqueHostel({
    where: { id },
    include: { rooms: { include: { beds: true } } },
  });

  // 2️⃣ Validate existence and space ownership
  if (!hostel) {
    throw new CustomError("Hostel not found or does not belong to this space");
  }

  // 3️⃣ Format hostel for GraphQL
  return {
    ...hostel,
    gender: hostel.gender as Gender,
    status: hostel.status as Status,
    createdAt: hostel.createdAt.toISOString(),
    updatedAt: hostel.updatedAt.toISOString(),
    rooms: hostel.rooms.map(r => ({
      ...r,
      status: r.status as Status,
      beds: r.beds.map(b => ({
        ...b,
        status: b.status as BedStatus,
      })),
    })),
  };
};

publicHostels = async () => {
  // Fetch all hostels with space info (if needed)
  const hostels = await this.hostelRepository.findHostels({
    include: {
      space: true,
    },
  });

  // Format for GraphQL
  return hostels.map(h => ({
    id: h.id,
    name: h.name,
    gender: h.gender as Gender,
    status: h.status as Status,
    // roomCount: h.roomCount,
    // availableBeds: h.availableBeds,
  }));
};

publicHostel = async (id: string) => {
  const hostel = await this.hostelRepository.findUniqueHostel({
    where: { id },
  });

  if (!hostel) {
    throw new CustomError("Hostel not found");
  }

  // Format for GraphQL
  return {
    id: hostel.id,
    name: hostel.name,
    gender: hostel.gender as Gender,
    status: hostel.status as Status,
    // roomCount: hostel.roomCount,
    // availableBeds: hostel.availableBeds,
  };
};

rooms = async (hostelId: string) => {
  const hostel = await this.hostelRepository.findUniqueHostel({
    where: { id: hostelId },
    include: { rooms: { include: { beds: true } } },
  });

  if (!hostel) throw new CustomError("Hostel not found");
  

  return hostel.rooms.map(room => ({
    ...room,
    status: room.status as Status,
    beds: room.beds.map(bed => ({
      ...bed,
      status: bed.status as BedStatus,
    })),
    hostel: {
      id: hostel.id,
      name: hostel.name,
      gender: hostel.gender as Gender,
      status: hostel.status as Status,
      // roomCount: hostel.roomCount,
      // availableBeds: hostel.availableBeds,
      createdAt: hostel.createdAt.toISOString(),      // ✅ add this
      updatedAt: hostel.updatedAt.toDateString(),      // ✅ add this
    },
  }));
};

Room = async (id: string) => {
  // 1️⃣ Fetch room with hostel and beds
  const room = await this.hostelRepository.findUniqueRoom({
    where: { id },
    include: {
      beds: true,
      hostel: true,
    },
  });

  // 2️⃣ Validate room exists and belongs to the space
  if (!room) {
    throw new CustomError("Room not found in this space");
  }

  // 3️⃣ Format room for GraphQL
  return {
    ...room,
    status: room.status as Status,
    beds: room.beds.map(b => ({
      ...b,
      status: b.status as BedStatus,
    })),
    hostel: {
      ...room.hostel,
      status: room.hostel.status as Status,
      gender: room.hostel.gender as Gender,
      createdAt: room.hostel.createdAt.toISOString(),
      updatedAt: room.hostel.updatedAt.toISOString(),
    },
  };
  
};


// In hostelService.ts
beds = async (roomId: string) => {
  // 1️⃣ Verify room exists and belongs to the space
  const room = await this.hostelRepository.findUniqueRoom({
    where: { id: roomId },
    include: { hostel: true, beds: true },
  });

  if (!room) {
    throw new CustomError("Room not found in this space");
  }

  // 2️⃣ Format beds for GraphQL
  const formattedBeds = room.beds.map(bed => ({
    ...bed,
    status: bed.status as BedStatus,
    room: {
      ...room,
      status: room.status as Status,
      beds: room.beds.map(b => ({
        ...b,
        status: b.status as BedStatus,
      })),
      hostel: {
        ...room.hostel,
        status: room.hostel.status as Status,
        gender: room.hostel.gender as Gender,
        createdAt: room.hostel.createdAt.toISOString(),
        updatedAt: room.hostel.updatedAt.toISOString(),
      },
    },
  }));

  return formattedBeds;
};

bed = async (bedId: string) => {
  const bed = await this.hostelRepository.findUniqueBed({
    where: { id: bedId },
    include: {
      room: {
        include: { hostel: true } // include only what we need
      },
    },
  });

  if (!bed) {
    throw new Error("Bed not found in this space");
  }

  return {
    ...bed,
    status: bed.status as BedStatus,
    room: {
      id: bed.room.id,
      label: bed.room.label,
      status: bed.room.status as Status,
      hostelId: bed.room.hostelId,
      capacity: bed.room.capacity,
      beds: [], // remove recursive beds
      hostel: {
        id: bed.room.hostel.id,
        name: bed.room.hostel.name,
        status: bed.room.hostel.status as Status,
        gender: bed.room.hostel.gender as Gender,
        spaceId: bed.room.hostel.spaceId,
        createdAt: bed.room.hostel.createdAt.toISOString(),
        updatedAt: bed.room.hostel.updatedAt.toISOString(),
      },
    },
  };
};

getStayTypes = async (spaceId: string) => {
  // 1️⃣ Fetch stay types from the repository
  const stayTypes = await this.hostelRepository.findStayTypes({
    where: { spaceId },
    include: {
      space: {
        include: {
          classes: true,
          hostels: true,
          stayTypes: true,
          createdBy: true,
          spaceUsers: true,
        },
      },
    },
  });

  // 2️⃣ Map each stay type to GraphQL-ready format
  return stayTypes.map(stayType => {
    const space = stayType.space;

    const formattedSpace = {
      id: space.id,
      name: space.name,
      createdAt: space.createdAt.toISOString(),
      updatedAt: space.updatedAt.toISOString(),
      createdById: space.createdById,
      createdBy: {
        ...space.createdBy,
        createdAt: space.createdBy.createdAt.toISOString(),
        updatedAt: space.createdBy.updatedAt.toISOString(),
      },
      classes: space.classes.map(c => ({
        ...c,
          names: Array.isArray(c.name) ? c.name : [],
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      hostels: space.hostels.map(h => ({
        ...h,
        createdAt: h.createdAt.toISOString(),
        updatedAt: h.updatedAt.toISOString(),
        gender: h.gender as Gender,
        status: h.status as Status,
      })),
      stayTypes: [], // avoid circular references
      users: [],     // avoid circular references
    };

    return {
      id: stayType.id,
      name: stayType.name,
      startDate: stayType.startDate.toISOString(),
      endDate: stayType.endDate.toISOString(),
      spaceId: stayType.spaceId,
      space: formattedSpace,
    };
  });
};


getStayType = async (id: string) => {
  // 1️⃣ Fetch stay type from the repository
  const stayType = await this.hostelRepository.findUniqueStayType({
    where: { id },
    include: {
      space: {
        include: {
          classes: true,
          hostels: true,
          stayTypes: true,
          createdBy: true,
          spaceUsers: true,
        },
      },
    },
  });

  if (!stayType) {
    throw new CustomError("StayType not found");
  }

  const space = stayType.space;

  // 2️⃣ Format space for GraphQL response
  const formattedSpace = {
    id: space.id,
    name: space.name,
    createdAt: space.createdAt.toISOString(),
    updatedAt: space.updatedAt.toISOString(),
    createdById: space.createdById,
    createdBy: {
      ...space.createdBy,
      createdAt: space.createdBy.createdAt.toISOString(),
      updatedAt: space.createdBy.updatedAt.toISOString(),
    },
    classes: space.classes.map(c => ({
      ...c,
        names: Array.isArray(c.name) ? c.name : [],
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    hostels: space.hostels.map(h => ({
      ...h,
      createdAt: h.createdAt.toISOString(),
      updatedAt: h.updatedAt.toISOString(),
      gender: h.gender as Gender,
      status: h.status as Status,
    })),
    stayTypes: [], // prevent circular reference
    users: [],     // prevent circular reference
  };

  // 3️⃣ Return GraphQL-ready stay type
  return {
    id: stayType.id,
    name: stayType.name,
    startDate: stayType.startDate.toISOString(),
    endDate: stayType.endDate.toISOString(),
    spaceId: stayType.spaceId,
    space: formattedSpace,
  };
};















}



export default HostelService;