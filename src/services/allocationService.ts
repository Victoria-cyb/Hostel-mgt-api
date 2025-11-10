import { HostelRepository } from "../repositories/hostel";
import { AllocationRepository } from "../repositories/allocation";
import { ApplicationRepository } from "../repositories/application";
import {
  type AllocationFilter,
  AllocationSource,
  AllocationStatus,
} from "../types/allocation";
import { ApplicationStatus, type ApplyInput } from "../types/application";
import { CustomError } from "../utils/error";
import { randomUUID } from "crypto";
import { SpaceRepository } from "../repositories/space";

class AllocationService {
  private allocationRepository: AllocationRepository;
  private applicationRepository: ApplicationRepository;
  private hostelRepository: HostelRepository;
  private spaceRepository: SpaceRepository

  constructor() {
    this.allocationRepository = new AllocationRepository();
    this.applicationRepository = new ApplicationRepository();
    this.hostelRepository = new HostelRepository();
    this.spaceRepository = new SpaceRepository();
  }

  adminBulkAllocate = async (inputs: ApplyInput[], spaceId: string) => {
    const allocations = [];
  
    for (const input of inputs) {
      // Validate that student belongs to the space
      const student = await this.spaceRepository.findSpaceUser({
        where: { 
          userId: input.studentId, 
          spaceId 
        },
        include: { space: true }
      });
  
      if (!student) {
        throw new CustomError(`Student ${input.studentId} not found in this space`);
      }
  
      // Validate hostel belongs to space
      const hostel = await this.hostelRepository.findUniqueHostel({
        where: { id: input.hostelId },
      });
  
      if (!hostel || hostel.spaceId !== spaceId) {
        throw new CustomError(`Hostel ${input.hostelId} not found in this space`);
      }

      // Validate bed
      const bed = await this.hostelRepository.findUniqueBed({
        where: { id: input.bedId },
        include: { room: true }
      });

      if (!bed || bed.room?.hostelId !== input.hostelId) {
        throw new CustomError(`Bed ${input.bedId} not found in this hostel`);
      }

      const applicationId = randomUUID();
      const applicationNumber = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await this.applicationRepository.createApplication({
        data: {
          id: applicationId,
          applicationNumber,
          spaceUserId: student.id,
          hostelId: input.hostelId,
          roomId: input.roomId,
          bedId: input.bedId,
          amount: bed.amount,
          currency: "NGN",
          status: ApplicationStatus.Approved,
          stayTypeId: input.stayTypeId ?? null,
          academicSession: input.academicSession ?? null,
          academicTerm: input.academicTerm ?? null,
          createdBy: AllocationSource.Admin,
        },
      });

      // 2. Create allocation using applicationId
      const allocation = await this.allocationRepository.createAllocation({
        data: {
          id: randomUUID(),
          allocationNumber: `ALLOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          spaceUserId: student.id,
          bedId: input.bedId,
          status: AllocationStatus.Reserved,
          stayTypeId: input.stayTypeId ?? null,
          academicSession: input.academicSession ?? null,
          academicTerm: input.academicTerm ?? null,
          createdBy: AllocationSource.Admin,
          applicationId,
        },
      });

      // Return minimal data - let GraphQL resolve nested objects
      allocations.push({
        id: allocation.id,
        allocationNumber: allocation.allocationNumber,
        bedId: allocation.bedId,
        applicationId: allocation.applicationId,
        status: allocation.status as AllocationStatus,
        startDate: allocation.startDate?.toISOString() ?? null,
        endDate: allocation.endDate?.toISOString() ?? null,
        stayTypeId: allocation.stayTypeId,
        academicSession: allocation.academicSession,
        academicTerm: allocation.academicTerm,
        checkInDate: allocation.checkInDate?.toISOString() ?? null,
        checkOutDate: allocation.checkOutDate?.toISOString() ?? null,
        createdBy: allocation.createdBy as unknown as AllocationSource,
        createdAt: allocation.createdAt.toISOString(),
      });
    }

    return allocations;
  };

  checkIn = async (id: string) => {
    // 1. Find the allocation
    const allocation = await this.allocationRepository.findUniqueAllocation({
      where: { id },
    });

    if (!allocation) {
      throw new CustomError("Allocation not found");
    }

    if (allocation.status === AllocationStatus.Active) {
      throw new CustomError("Allocation is already checked in");
    }

    // 2. Update allocation status and checkInDate
    await this.allocationRepository.updateAllocation({
      where: { id },
      data: {
        status: AllocationStatus.Active,
        checkInDate: new Date(),
      },
    });

    return true;
  };

  checkOut = async (id: string): Promise<boolean> => {
    // 1. Find the allocation
    const allocation = await this.allocationRepository.findUniqueAllocation({
      where: { id },
    });

    if (!allocation) {
      throw new CustomError("Allocation not found");
    }

    if (allocation.status === AllocationStatus.CheckedOut) {
      throw new CustomError("Allocation is already checked out");
    }

    // 2. Update allocation status and checkOutDate
    await this.allocationRepository.updateAllocation({
      where: { id },
      data: {
        status: AllocationStatus.CheckedOut,
        checkOutDate: new Date(),
      },
    });

    return true;
  };

  markLeave = async (
    allocationId: string,
    reason: string,
    signOutDate: string,
    expectedReturn: string,
    spaceId: string,
  ) => {
    const allocation = await this.allocationRepository.findUniqueAllocation({
      where: { id: allocationId },
      include: {
        spaceUser: true,
        bed: { include: { room: { include: { hostel: true } } } }
      }
    });
  
    if (!allocation) {
      throw new CustomError("Allocation not found");
    }
  
    // Validate allocation belongs to the space
    if (allocation.bed?.room?.hostel?.spaceId !== spaceId) {
      throw new CustomError("Allocation not found in this space");
    }
  
    if (allocation.status === AllocationStatus.CheckedOut) {
      throw new CustomError("Allocation already checked out");
    }

    const checkOut = new Date(signOutDate);
    const expectedReturnDate = new Date(expectedReturn);

    const updatedAllocation = await this.allocationRepository.updateAllocation(
      {
        where: { id: allocationId },
        data: {
          status: AllocationStatus.HolidayLeave,
          checkOutDate: !isNaN(checkOut.getTime()) ? checkOut : null,
          leaveReason: reason,
          expectedReturn: !isNaN(expectedReturnDate.getTime())
            ? expectedReturnDate
            : null,
        },
      },
    );

    // return only what GraphQL expects
    return {
      id: updatedAllocation.id,
      allocationNumber: updatedAllocation.allocationNumber,
      bedId: updatedAllocation.bedId,
      applicationId: updatedAllocation.applicationId,
      status: updatedAllocation.status as AllocationStatus, // map enum
      startDate: updatedAllocation.startDate?.toISOString() ?? null,
      endDate: updatedAllocation.endDate?.toISOString() ?? null,
      stayTypeId: updatedAllocation.stayTypeId,
      academicSession: updatedAllocation.academicSession,
      academicTerm: updatedAllocation.academicTerm,
      checkInDate: updatedAllocation.checkInDate?.toISOString() ?? null,
      checkOutDate: updatedAllocation.checkOutDate?.toISOString() ?? null,
      createdBy: updatedAllocation.createdBy as AllocationSource,
      createdAt: updatedAllocation.createdAt.toISOString(),
      leaveReason: updatedAllocation.leaveReason,
      expectedReturn: updatedAllocation.expectedReturn?.toISOString() ?? null,
    };
  };

  allocations = async (filter: AllocationFilter) => {
    const where: Record<string, unknown> = {};

    if (filter.studentId) {
      where.spaceUserId = filter.studentId;
    }
    if (filter.startDate && !isNaN(Date.parse(filter.startDate))) {
      where.startDate = { gte: new Date(filter.startDate) };
    }
    if (filter.endDate && !isNaN(Date.parse(filter.endDate))) {
      where.endDate = { lte: new Date(filter.endDate) };
    }

    if (filter.stayTypeId) {
      where.stayTypeId = filter.stayTypeId;
    }
    if (filter.hostelId) {
      where.bed = { room: { hostelId: filter.hostelId } };
    }
    if (filter.roomId) {
      where.bed = { roomId: filter.roomId };
    }
    if (filter.bedId) {
      where.bedId = filter.bedId;
    }
    if (filter.allocationNumber) {
      where.allocationNumber = filter.allocationNumber;
    }

    const allocations = await this.allocationRepository.findAllocations({
      where,
    });

    return allocations.map((alloc) => ({
      id: alloc.id,
      allocationNumber: alloc.allocationNumber,
      bedId: alloc.bedId,
      applicationId: alloc.applicationId,
      status: alloc.status as unknown as AllocationStatus,
      startDate: alloc.startDate?.toISOString() ?? null,
      endDate: alloc.endDate?.toISOString() ?? null,
      stayTypeId: alloc.stayTypeId,
      academicSession: alloc.academicSession,
      academicTerm: alloc.academicTerm,
      checkInDate: alloc.checkInDate?.toISOString() ?? null,
      checkOutDate: alloc.checkOutDate?.toISOString() ?? null,
      createdBy: alloc.createdBy as unknown as AllocationSource,
      createdAt: alloc.createdAt.toISOString(),
    }));
  };

  allocation = async (id: string) => {
    const allocation = await this.allocationRepository.findUniqueAllocation({
      where: { id },
    });

    if (!allocation) return null;

    return {
      id: allocation.id,
      allocationNumber: allocation.allocationNumber,
      bedId: allocation.bedId,
      applicationId: allocation.applicationId,
      status: allocation.status as unknown as AllocationStatus,
      startDate: allocation.startDate?.toISOString() ?? null,
      endDate: allocation.endDate?.toISOString() ?? null,
      stayTypeId: allocation.stayTypeId,
      academicSession: allocation.academicSession,
      academicTerm: allocation.academicTerm,
      checkInDate: allocation.checkInDate?.toISOString() ?? null,
      checkOutDate: allocation.checkOutDate?.toISOString() ?? null,
      createdBy: allocation.createdBy as unknown as AllocationSource,
      createdAt: allocation.createdAt.toISOString(),
    };
  };
}

export default AllocationService;