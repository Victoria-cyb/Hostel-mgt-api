import { ApplicationRepository } from "../repositories/application";
import { SpaceRepository } from "../repositories/space";
import { HostelRepository } from "../repositories/hostel";
import { AllocationRepository } from "../repositories/allocation";
import { PaymentRepository } from "../repositories/payment";
import { Allocation, AllocationStatus, AllocationSource } from "../types/allocation";
import {
  type ApplyInput,
  ApplicationStatus,
  PaymentStatus,
  Payment,
  type ApplicationFilter,
} from "../types/application";
import { initializePaystackPayment } from "../utils/paystack";
import { CustomError } from "../utils/error";
import { randomUUID } from "crypto";
import axios from "axios";
import { BedStatus } from "../types/hostel";
import type { Payment as PrismaPayment } from "@prisma/client";
import { Status, Room, StayType, Hostel } from "../types/hostel";
import type { Space } from "../types/space";

class ApplicationService {
  private applicationRepository = new ApplicationRepository();
  private spaceRepository = new SpaceRepository();
  private hostelRepository = new HostelRepository();
  private allocationRepository = new AllocationRepository();
  private paymentRespository = new PaymentRepository();

  constructor() {
    this.applicationRepository = new ApplicationRepository();
    this.spaceRepository = new SpaceRepository();
    this.hostelRepository = new HostelRepository();
    this.allocationRepository = new AllocationRepository();
    this.paymentRespository = new PaymentRepository();
  }

  studentBook = async (input: ApplyInput, spaceId: string) => {
    const { studentId, bedId, stayTypeId, academicSession, academicTerm, hostelId, roomId } =
      input;

    // ✅ Check student exists and get spaceUserId
    const spaceUser = await this.spaceRepository.findSpaceUser({
      where: { userId: studentId, spaceId },
    });
    if (!spaceUser) throw new CustomError("Student not found in this space");

    // ✅ Check bed availability
    const bed = await this.hostelRepository.findUniqueBed({
      where: { id: bedId },
      include: { applications: true },
    });
    if (!bed) throw new CustomError("Bed not found");
    if (
      bed.applications?.some(
        (app) =>
          (app.status === ApplicationStatus.Pending ||
            app.status === ApplicationStatus.Approved) &&
          app.academicSession === academicSession &&
          app.academicTerm === academicTerm,
      )
    ) {
      throw new CustomError("Bed already booked or allocated");
    }

    // ✅ Generate application number
    const applicationNumber = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const amount = bed.amount ?? 0;

    // ✅ Create application with spaceUserId
    const application = await this.applicationRepository.createApplication({
      data: {
        id: randomUUID(),
        applicationNumber,
        spaceUserId: spaceUser.id, // ✅ Use spaceUserId instead of studentId
        hostelId,
        roomId,
        bedId,
        amount,
        currency: "NGN",
        status: ApplicationStatus.Pending,
        stayTypeId: stayTypeId ?? null,
        academicSession: academicSession ?? null,
        academicTerm: academicTerm ?? null,
        createdBy: AllocationSource.Student,
      },
      include: {
        spaceUser: { include: { user: true } }, // ✅ Use spaceUser instead of student
        bed: true,
        stayType: true,
        payments: true,
      },
    });

    return {
      id: application.id,
      applicationNumber: application.applicationNumber,
      status: application.status as ApplicationStatus,
      amount: application.amount,
      currency: application.currency,
      startDate: application.startDate?.toISOString() ?? null,
      endDate: application.endDate?.toISOString() ?? null,
      stayTypeId: application.stayTypeId,
      academicSession: application.academicSession,
      academicTerm: application.academicTerm,
      createdBy: application.createdBy as AllocationSource,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt?.toISOString() ?? null,
      bed: application.bed
        ? {
            ...application.bed,
            status: application.bed.status as BedStatus,
          }
        : null,
      payments: application.payments.map((p: PrismaPayment) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt?.toISOString() ?? null,
        status: p.status as PaymentStatus,
      })),
    };
  };

  parentBulkBook = async (inputs: ApplyInput[], spaceId: string) => {
    const createdApplications = [];

    for (const input of inputs) {
      const { studentId, bedId, stayTypeId, academicSession, academicTerm, hostelId, roomId } =
        input;

      const spaceUser = await this.spaceRepository.findSpaceUser({
        where: {
          userId: studentId,
          spaceId,
        },
      });
      if (!spaceUser) {
        throw new CustomError("Student user not found in this space");
      }

      // Check bed availability
      const bed = await this.hostelRepository.findUniqueBed({
        where: { id: bedId },
        include: { applications: true },
      });
      if (!bed) {
        throw new CustomError("Bed not found");
      }
      if (
        bed.applications?.some(
          (app) =>
            app.status === ApplicationStatus.Pending ||
            app.status === ApplicationStatus.Approved,
        )
      ) {
        throw new CustomError("Bed already booked or allocated");
      }

      const applicationNumber = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const amount = bed.amount ?? 0;

      const application = await this.applicationRepository.createApplication({
        data: {
          id: randomUUID(),
          applicationNumber,
          spaceUserId: spaceUser.id, // ✅ Use spaceUserId
          hostelId,
          roomId,
          amount,
          bedId,
          status: ApplicationStatus.Pending,
          currency: "NGN",
          stayTypeId: stayTypeId ?? null,
          academicSession: academicSession ?? null,
          academicTerm: academicTerm ?? null,
          createdBy: AllocationSource.Parent,
        },
        include: { bed: true, payments: true, spaceUser: true },
      });

      createdApplications.push({
        id: application.id,
        applicationNumber: application.applicationNumber,
        bedId: application.bedId,
        status: application.status as ApplicationStatus,
        amount: application.amount,
        currency: application.currency,
        startDate: application.startDate?.toISOString() ?? null,
        endDate: application.endDate?.toISOString() ?? null,
        stayTypeId: application.stayTypeId,
        academicSession: application.academicSession,
        academicTerm: application.academicTerm,
        createdBy: application.createdBy as AllocationSource,
        createdAt: application.createdAt.toISOString(),
        updatedAt: application.updatedAt?.toISOString() ?? null,
        bed: application.bed
          ? {
              ...application.bed,
              status: application.bed.status as BedStatus,
            }
          : null,
        payments:
          application.payments?.map((p: PrismaPayment) => ({
            ...p,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
            status: p.status as PaymentStatus,
          })) ?? [],
      });
    }

    return createdApplications;
  };

  // approveApplication = async (
  //   applicationId: string,
  //   spaceId: string,
  // ): Promise<Allocation> => {
  //   const application = await this.applicationRepository.findUniqueApplication({
  //     where: { id: applicationId },
  //     include: {
  //       bed: {
  //         include: {
  //           room: {
  //             include: { 
  //               hostel: true,
  //               beds: {
  //                 include: {
  //                   room: true
  //                 }
  //               }
  //             },
  //           },
  //         },
  //       },
  //       spaceUser: {
  //         include: { space: true, user: true },
  //       },
  //     },
  //   });
  
  //   if (!application) {
  //     throw new CustomError("Application not found");
  //   }
  
  //   if (application.bed?.room?.hostel?.spaceId !== spaceId) {
  //     throw new CustomError("Application not found in this space");
  //   }
  
  //   if (application.spaceUser && application.spaceUser.spaceId !== spaceId) {
  //     throw new CustomError("Student does not belong to this space");
  //   }
  
  //   if (application.status === ApplicationStatus.Approved) {
  //     throw new CustomError("Application is already approved");
  //   }
  
  //   const updatedApplication =
  //     await this.applicationRepository.updateApplication({
  //       where: { id: applicationId },
  //       data: { status: ApplicationStatus.Approved },
  //     });
  
  //   const allocationResult = await this.allocationRepository.createAllocation({
  //     data: {
  //       applicationId: updatedApplication.id,
  //       spaceUserId: updatedApplication.spaceUserId,
  //       bedId: updatedApplication.bedId,
  //       status: AllocationStatus.Reserved,
  //       createdBy: AllocationSource.Admin,
  //       stayTypeId: updatedApplication.stayTypeId,
  //       academicSession: updatedApplication.academicSession,
  //       academicTerm: updatedApplication.academicTerm,
  //     },
  //     include: { 
  //       bed: {
  //         include: {
  //           room: {
  //             include: { 
  //               hostel: true,
  //               beds: {
  //                 include: {
  //                   room: true
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }, 
  //       spaceUser: true, 
  //       application: {
  //         include: {
  //           spaceUser: true,
  //           bed: true,
  //           payments: true,
  //           allocations: {
  //             include: {
  //               bed: true,
  //               application: true,
  //               payments: true
  //             }
  //           }
  //         },
  //       },
  //       payments: true,
  //       stayType: { 
  //         include: { space: { include: { createdBy: true, hostels: true, stayTypes: true, classes: true } } } 
  //       }
  //     },
  //   });
  
  //   if (!allocationResult) {
  //     throw new CustomError("Failed to create allocation");
  //   }
  
  //   // Type assertion to include the nested relations for TypeScript
  //   const allocation = allocationResult as any;
  
  //   // Helper function to map a room (including its beds and hostel gender)
  //   const mapRoom = (room: any) => ({
  //     ...room,
  //     status: room.status as Status,
  //     hostel: {
  //       ...room.hostel,
  //       gender: room.hostel.gender === 'male' ? 'MALE' : 'FEMALE', // Map to GraphQL enum value (adjust if enum uses different casing, e.g., 'Male')
  //       status: room.hostel.status as Status,
  //     },
  //     beds: room.beds.map((b: any) => ({
  //       ...b,
  //       status: b.status as BedStatus,
  //       room: mapRoom(b.room),
  //     })),
  //   });
  
  //   // Helper function to map an allocation (focusing on bed/room/hostel)
  //   const mapAllocation = (alloc: any) => ({
  //     ...alloc,
  //     status: alloc.status as AllocationStatus,
  //     createdBy: alloc.createdBy as AllocationSource,
  //     bed: {
  //       ...alloc.bed,
  //       status: alloc.bed.status as BedStatus,
  //       room: mapRoom(alloc.bed.room),
  //     },
  //     // Add mappings for other nested fields if needed (e.g., application, payments)
  //     application: {
  //       ...alloc.application,
  //       status: alloc.application.status as ApplicationStatus,
  //       // Recurse if allocations have further nesting, but since we're mapping bed here, it's covered
  //     },
  //     payments: alloc.payments.map((p: any) => ({
  //       ...p,
  //       status: p.status as PaymentStatus,
  //     })),
  //   });
  
  //   return {
  //     id: allocation.id,
  //     allocationNumber: allocation.allocationNumber,
  //     bed: {
  //       id: allocation.bed.id,
  //       label: allocation.bed.label,
  //       amount: allocation.bed.amount,
  //       status: allocation.bed.status as BedStatus,
  //       room: mapRoom(allocation.bed.room),
  //     },
  //     status: allocation.status as AllocationStatus,
  //     createdBy: allocation.createdBy as AllocationSource,
  //     startDate: allocation.startDate?.toISOString() ?? null,
  //     endDate: allocation.endDate?.toISOString() ?? null,
  //     stayType: allocation.stayType ? {
  //       id: allocation.stayType.id,
  //       name: allocation.stayType.name,
  //       space: {
  //         ...allocation.stayType.space,
  //         hostels: allocation.stayType.space.hostels?.map((h: any) => ({
  //           ...h,
  //           gender: h.gender === 'male' ? 'MALE' : 'FEMALE', // Map hostel gender in space.hostels
  //         })) ?? [],
  //       } as Space, // Assert after mapping
  //       startDate: allocation.stayType.startDate.toISOString(),
  //       endDate: allocation.stayType.endDate.toISOString(),
  //     } : null,
  //     academicSession: allocation.academicSession,
  //     academicTerm: allocation.academicTerm,
  //     checkInDate: allocation.checkInDate?.toISOString() ?? null,
  //     checkOutDate: allocation.checkOutDate?.toISOString() ?? null,
  //     application: {
  //       ...allocation.application,
  //       allocations: allocation.application.allocations.map(mapAllocation),
  //       status: allocation.application.status as ApplicationStatus,
  //       startDate: allocation.application.startDate?.toISOString() ?? null,
  //       endDate: allocation.application.endDate?.toISOString() ?? null,
  //       createdBy: allocation.application.createdBy as AllocationSource,
  //       createdAt: allocation.application.createdAt.toISOString(),
  //       updatedAt: allocation.application.updatedAt?.toISOString() ?? null,
  //     },
  //     payments: allocation.payments.map((p: PrismaPayment) => ({
  //       ...p,
  //       status: p.status as PaymentStatus,
  //       createdAt: p.createdAt.toISOString(),
  //       updatedAt: p.updatedAt?.toISOString() ?? null,
  //     })),
  //     createdAt: allocation.createdAt.toISOString(),
  //   };
  // };
  
  approveApplication = async (
    applicationId: string,
    spaceId: string,
  ): Promise<Allocation> => {
    const application = await this.applicationRepository.findUniqueApplication({
      where: { id: applicationId },
      include: {
        bed: {
          include: {
            room: {
              include: {
                hostel: true,
                beds: {
                  include: { room: true },
                },
              },
            },
          },
        },
        spaceUser: {
          include: { space: true, user: true },
        },
      },
    });

    if (!application) throw new CustomError("Application not found");

    if (application.bed?.room?.hostel?.spaceId !== spaceId)
      throw new CustomError("Application not found in this space");

    if (application.spaceUser && application.spaceUser.spaceId !== spaceId)
      throw new CustomError("Student does not belong to this space");

    if (application.status === ApplicationStatus.Approved)
      throw new CustomError("Application is already approved");

    const updatedApplication =
      await this.applicationRepository.updateApplication({
        where: { id: applicationId },
        data: { status: ApplicationStatus.Approved },
      });

    const allocationResult = await this.allocationRepository.createAllocation({
      data: {
        applicationId: updatedApplication.id,
        spaceUserId: updatedApplication.spaceUserId,
        bedId: updatedApplication.bedId,
        status: AllocationStatus.Reserved,
        createdBy: AllocationSource.Admin,
        stayTypeId: updatedApplication.stayTypeId,
        academicSession: updatedApplication.academicSession,
        academicTerm: updatedApplication.academicTerm,
      },
      include: {
        bed: {
          include: {
            room: {
              include: {
                hostel: true,
                beds: { include: { room: true } },
              },
            },
          },
        },
        spaceUser: true,
        application: {
          include: {
            spaceUser: true,
            bed: true,
            payments: true,
           allocations: {
  include: {
    bed: {
      include: {
        room: {
          include: {
            hostel: true,
            beds: true,
          },
        },
      },
    },
    application: true, // ✅ application belongs to Allocation, not Bed
    payments: true,
  },
},
          },
        },
        payments: true,
        stayType: {
          include: {
            space: {
              include: {
                createdBy: true,
                hostels: true,
                stayTypes: true,
                classes: true,
              },
            },
          },
        },
      },
    });

    if (!allocationResult)
      throw new CustomError("Failed to create allocation");


    // ─────────────────────────────
    // Helper mappers (strongly typed)
    // ─────────────────────────────
    const mapRoom = (room: Room): Room => ({
      ...room,
      status: room.status as Status,
      hostel: room.hostel
        ? {
            ...room.hostel,
            gender: room.hostel.gender,
            status: room.hostel.status as Status,
          }
        : undefined,
      beds: (room.beds ?? []).map((b) => ({
  ...b,
  status: b.status as BedStatus,
  room: b.room ? mapRoom(b.room) : undefined,
})),
    });

    const mapPayment = (p: Payment): Payment => ({
      ...p,
      status: p.status as PaymentStatus,
      createdAt: new Date(p.createdAt).toISOString(),
      updatedAt: p.updatedAt
        ? new Date(p.updatedAt).toISOString()
        : undefined,
    });


    // eslint-disable-next-line
    const mapAllocation = (alloc: any): Allocation => ({
      ...alloc,
      
      status: alloc.status as AllocationStatus,
      createdBy: alloc.createdBy as AllocationSource,
      bed: {
        ...alloc.bed,
        status: alloc.bed.status as BedStatus,
        room: alloc.bed.room ? mapRoom(alloc.bed.room) : undefined,
      },
      application: {
        ...alloc.application,
        status: alloc.application.status as ApplicationStatus,
        allocations: alloc.application.allocations.map(mapAllocation),
        startDate: alloc.application.startDate ?? null,
        endDate: alloc.application.endDate ?? null,
        createdAt: new Date(alloc.application.createdAt).toISOString(),
        updatedAt: alloc.application.updatedAt
          ? new Date(alloc.application.updatedAt).toISOString()
          : null,
      },
      payments: alloc.payments.map(mapPayment),
      createdAt: new Date(alloc.createdAt).toISOString(),
    });

  
    const mapped = mapAllocation(allocationResult);

    // Rebuild stayType for stronger typing
    const stayType: StayType | null = mapped.stayType
      ? {
          ...mapped.stayType,
          space: {
            ...mapped.stayType.space,
            hostels:
              mapped.stayType.space.hostels?.map((h: Hostel) => ({
                ...h,
                gender: h.gender,
              })) ?? [],
          } as Space,
        }
      : null;

    return {
      ...mapped,
      stayType,
    };
  };

  payHostelFee = async (applicationNumber: string, spaceId: string) => {
    const application = await this.applicationRepository.findApplication({
      where: { applicationNumber },
      include: {
        spaceUser: { include: { user: true } }, // ✅ Use spaceUser
        bed: {
          include: {
            room: {
              include: { hostel: true },
            },
          },
        },
      },
    });
  
    if (!application) {
      throw new CustomError("Application not found");
    }
  
    if (application.bed?.room?.hostel?.spaceId !== spaceId) {
      throw new CustomError("Application not found in this space");
    }
  
    const existingPayment = await this.paymentRespository.findPayment({
      where: { applicationId: application.id },
    });
  
    if (existingPayment && existingPayment.status === PaymentStatus.Paid) {
      throw new CustomError("Payment already completed for this application");
    }
  
    if (application.amount === null) {
      throw new CustomError("Application amount not set");
    }
  
    const reference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
    const paystackResponse = await initializePaystackPayment({
      email: application.spaceUser?.user?.email ?? "guest@cloudnotte.com", // ✅ Access email through spaceUser.user
      amount: application.amount,
      currency: application.currency,
      reference,
    });
  
    const payment = existingPayment
      ? await this.paymentRespository.updatePayment({
          where: { id: existingPayment.id },
          data: {
            reference,
            amount: application.amount,
            status: PaymentStatus.Pending,
          },
        })
      : await this.paymentRespository.createPayment({
          data: {
            id: randomUUID(),
            applicationId: application.id,
            reference,
            amount: application.amount,
            currency: application.currency,
            status: PaymentStatus.Pending,
            method: "paystack",
          },
        });
  
    if (!payment) {
      throw new CustomError("Failed to create payment");
    }
  
    return {
      id: payment.id,
      applicationId: payment.applicationId,
      allocationId: payment.allocationId,
      reference: payment.reference,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status as PaymentStatus,
      method: payment.method,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt?.toISOString() ?? null,
      authorizationUrl: paystackResponse.data.authorization_url,
    };
  };

  recordPayment = async (applicationNumber: string, status: PaymentStatus) => {
    if (status !== PaymentStatus.Paid) {
      throw new CustomError(
        "Admin can only record payments with status 'paid'",
      );
    }

    const application = await this.applicationRepository.findApplication({
      where: { applicationNumber },
    });

    if (!application) throw new CustomError("Application not found");
    if (application.amount === null)
      throw new CustomError("Application amount not set");

    const payment = await this.paymentRespository.createPayment({
      data: {
        id: randomUUID(),
        applicationId: application.id,
        reference: `offline_${Date.now()}`,
        amount: application.amount,
        currency: application.currency,
        status,
        method: "offline",
      },
    });

    return {
      ...payment,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
      status: payment.status as PaymentStatus,
    };
  };

  verifyPayment = async (reference: string) => {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const verified = response.data.data.status === "success";
    if (!verified) return false;

    await this.paymentRespository.updatePayment({
      where: { reference },
      data: { status: PaymentStatus.Paid },
    });

    return true;
  };

  applications = async (filter: ApplicationFilter, spaceId: string) => {
    const where: Record<string, unknown> = {
      spaceUser: { spaceId },
    };

    // ✅ Remove studentId filter since it doesn't exist
    // If you need to filter by user, use spaceUserId

    if (filter.startDate && filter.endDate) {
      const startDate = new Date(filter.startDate);
      const endDate = new Date(filter.endDate);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      where.startDate = { gte: startDate };
      where.endDate = { lte: endDate };
    }

    if (filter.stayTypeId) {
      where.stayTypeId = filter.stayTypeId;
    }

    if (filter.hostelId) {
      where.hostelId = filter.hostelId;
    }

    if (filter.roomId) {
      where.roomId = filter.roomId;
    }

    if (filter.bedId) {
      where.bedId = filter.bedId;
    }

    if (filter.applicationNumber) {
      where.applicationNumber = filter.applicationNumber;
    }

    const applications = await this.applicationRepository.findApplications({
      where,
      include: {
        spaceUser: { include: { user: true, space: true } }, // ✅ Use spaceUser
        bed: true,
        stayType: true,
        payments: true,
      },
    });

    return applications.map((app) => ({
      id: app.id,
      applicationNumber: app.applicationNumber,
      bedId: app.bedId,
      status: app.status as ApplicationStatus,
      amount: app.amount,
      currency: app.currency,
      startDate: app.startDate?.toISOString() ?? null,
      endDate: app.endDate?.toISOString() ?? null,
      stayTypeId: app.stayTypeId,
      academicSession: app.academicSession,
      academicTerm: app.academicTerm,
      createdBy: app.createdBy as AllocationSource,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt?.toISOString() ?? null,
    }));
  };

  application = async (id: string) => {
    const app = await this.applicationRepository.findUniqueApplication({
      where: { id },
      include: {
        spaceUser: { include: { user: true } }, // ✅ Use spaceUser
        bed: true,
        stayType: true,
        payments: true,
      },
    });

    if (!app) return null;

    return {
      id: app.id,
      applicationNumber: app.applicationNumber,
      bedId: app.bedId,
      status: app.status as ApplicationStatus,
      amount: app.amount,
      currency: app.currency,
      startDate: app.startDate?.toISOString() ?? null,
      endDate: app.endDate?.toISOString() ?? null,
      stayTypeId: app.stayTypeId,
      academicSession: app.academicSession,
      academicTerm: app.academicTerm,
      createdBy: app.createdBy as AllocationSource,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt?.toISOString() ?? null,
      payments:
        app.payments?.map((p: PrismaPayment) => ({
          id: p.id,
          reference: p.reference,
          amount: p.amount,
          currency: p.currency,
          status: p.status as PaymentStatus,
          method: p.method,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt?.toISOString() ?? null,
        })) ?? [],
    };
  };

  payments = async (
    applicationNumber?: string | null,
    allocationNumber?: string | null,
    spaceId?: string,
  ) => {
    const payments = await this.paymentRespository.findPayments({
      where: {
        ...(applicationNumber || spaceId
          ? {
              application: {
                is: {
                  ...(applicationNumber ? { applicationNumber } : {}),
                  ...(spaceId ? { spaceUser: { spaceId } } : {}),
                },
              },
            }
          : {}),

        ...(allocationNumber
          ? {
              allocation: {
                is: { allocationNumber },
              },
            }
          : {}),
      },
      include: {
        application: false,
        allocation: false,
      },
    });

    return payments.map((p) => ({
      id: p.id,
      applicationId: p.applicationId,
      allocationId: p.allocationId,
      reference: p.reference,
      amount: p.amount,
      currency: p.currency,
      status: p.status as PaymentStatus,
      method: p.method,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt?.toISOString() ?? null,
    }));
  };

  payment = async (id: string) => {
    const payment = await this.paymentRespository.findUniquePayment({
      where: { id },
      include: {
        application: false,
        allocation: false,
      },
    });

    if (!payment) return null;

    return {
      id: payment.id,
      applicationId: payment.applicationId,
      allocationId: payment.allocationId,
      reference: payment.reference,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status as PaymentStatus,
      method: payment.method,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt?.toISOString() ?? null,
    };
  };

  deleteApplication = async (applicationId: string) => {
    const existingApp = await this.applicationRepository.findApplication({
      where: { id: applicationId },
    });

    if (!existingApp) throw new CustomError("Application not found");

    await this.applicationRepository.deleteApplication({
      where: { id: applicationId },
    });

    return true;
  };
}

export default ApplicationService;