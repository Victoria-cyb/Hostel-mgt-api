import { string } from "zod";
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

class AllocationService {
  private allocationaRepository = new AllocationRepository();
  private applicationRepository = new ApplicationRepository();

  constructor() {
    this.allocationaRepository = new AllocationRepository();
    this.applicationRepository = new ApplicationRepository();
  }

  adminBulkAllocate = async (inputs: ApplyInput[], spaceId: string) => {
    const allocations = [];

    for (const input of inputs) {
      // 1. Create application first
      const applicationId = randomUUID();
      const applicationNumber = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await this.applicationRepository.createApplication({
        data: {
          id: applicationId,
          applicationNumber,
          studentId: input.studentId,
          hostelId: input.hostelId,
          roomId: input.roomId,
          bedId: input.bedId,
          currency: "NGN",
          status: ApplicationStatus.Approved,
          stayTypeId: input.stayTypeId ?? null,
          academicSession: input.academicSession ?? null,
          academicTerm: input.academicTerm ?? null,
          createdBy: AllocationSource.Admin,
          // Remove spaceId - it doesn't exist in Application model
        },
      });

      // 2. Create allocation using applicationId
      const allocation = await this.allocationaRepository.createAllocation({
        data: {
          id: randomUUID(),
          allocationNumber: `ALLOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          studentId: input.studentId,
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
        studentId: allocation.studentId,
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
    const allocation = await this.allocationaRepository.findUniqueAllocation({
      where: { id },
    });

    if (!allocation) {
      throw new CustomError("Allocation not found");
    }

    if (allocation.status === AllocationStatus.Active) {
      throw new CustomError("Allocation is already checked in");
    }

    // 2. Update allocation status and checkInDate
    await this.allocationaRepository.updateAllocation({
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
    const allocation = await this.allocationaRepository.findUniqueAllocation({
      where: { id },
    });

    if (!allocation) {
      throw new CustomError("Allocation not found");
    }

    if (allocation.status === AllocationStatus.CheckedOut) {
      throw new CustomError("Allocation is already checked out");
    }

    // 2. Update allocation status and checkOutDate
    await this.allocationaRepository.updateAllocation({
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
    const allocation = await this.allocationaRepository.findUniqueAllocation({
      where: { id: allocationId },
    });

    if (!allocation) {
      throw new CustomError("Allocation not found");
    }

    if (allocation.status === AllocationStatus.CheckedOut) {
      throw new CustomError("Allocation already checked out");
    }

    const checkOut = new Date(signOutDate);
    const expectedReturnDate = new Date(expectedReturn);

    const updatedAllocation = await this.allocationaRepository.updateAllocation(
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
      studentId: updatedAllocation.studentId,
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
      where.studentId = filter.studentId;
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

    const allocations = await this.allocationaRepository.findAllocations({
      where,
    });

    return allocations.map((alloc) => ({
      id: alloc.id,
      allocationNumber: alloc.allocationNumber,
      studentId: alloc.studentId,
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
    const allocation = await this.allocationaRepository.findUniqueAllocation({
      where: { id },
    });

    if (!allocation) return null;

    return {
      id: allocation.id,
      allocationNumber: allocation.allocationNumber,
      studentId: allocation.studentId,
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
