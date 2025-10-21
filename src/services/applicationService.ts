import { ApplicationRepository } from "../repositories/application";
import { SpaceRepository } from "../repositories/space";
import { HostelRepository } from "../repositories/hostel";
import { AllocationRepository } from "../repositories/allocation";
import { PaymentRepository } from "../repositories/payment";
import { AllocationStatus } from "../types/allocation";
import { type ApplyInput, ApplicationStatus,  AllocationSource, PaymentStatus, type ApplicationFilter } from "../types/application";
import { initializePaystackPayment } from "../utils/paystack";
import { CustomError } from "../utils/error";
import { randomUUID } from "crypto";
import axios from "axios";
import { BedStatus} from "../types/hostel";




 class ApplicationService {
    private applicationRepository = new ApplicationRepository();
    private spaceRepository = new SpaceRepository();
    private hostelRepository = new HostelRepository()
    private allocationRepository = new AllocationRepository();
    private paymentRespository = new PaymentRepository();
   

    constructor() {
        this.applicationRepository = new ApplicationRepository();
        this.spaceRepository = new SpaceRepository();
        this.hostelRepository = new HostelRepository();
       this.allocationRepository = new AllocationRepository()
       this.paymentRespository = new PaymentRepository();
    }





 studentBook = async (input: ApplyInput, spaceId: string) => {
  const {
    studentId,
    bedId,
    stayTypeId,
    academicSession,
    academicTerm,
  } = input;

  // ✅ Check student exists
  const student = await this.spaceRepository.findSpaceUser({
    where: { userId: studentId, spaceId },
  });
  if (!student) throw new CustomError("Student not found in this space");

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
        app.status === ApplicationStatus.Approved) && app.academicSession === academicSession && app.academicTerm === academicTerm
    )
  ) {
    throw new CustomError("Bed already booked or allocated");
  }

  // ✅ Generate application number
  const applicationNumber = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const amount =
  bed.amount ??
  0; // fallback to 0 or throw if you prefer strict validation


  // ✅ Create application
  const application = await this.applicationRepository.createApplication({
    data: {
      id: randomUUID(),
      applicationNumber,
      studentId,
      bedId,
      amount,
      currency: 'NGN',
      status: ApplicationStatus.Pending,
      stayTypeId: stayTypeId ?? null,
      academicSession: academicSession ?? null,
      academicTerm: academicTerm ?? null,
      createdBy: AllocationSource.Student,
    },
    include: {
      student: true,
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
    bed: {
      ...bed,
      status: bed.status as BedStatus,
      applications: bed.applications.map(app => ({
        ...app,
        startDate: app.startDate?.toISOString() ?? null,
        endDate: app.endDate?.toISOString() ?? null,
        status: app.status as ApplicationStatus,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt?.toISOString() ?? null,
      })),
    },
    payments: application.payments.map(p => ({
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
    const {
      studentId,
      bedId,
      stayTypeId,
      academicSession,
      academicTerm,
    } = input;

    const student = await this.spaceRepository.findSpaceUser({
      where: {
        userId: studentId,
        spaceId,
      },
    });
    if (!student) {
      throw new CustomError("Student user not found in this space");
    }

    // Check bed availability
      const bed = await this.hostelRepository.findUniqueBed({
        where: { id: bedId },
        include: { applications: true }, // Include applications to check booking status
      });
      if (!bed) {
        throw new CustomError("Bed not found");
      }
      if (
        bed.applications?.some(
          (app) =>
            app.status === ApplicationStatus.Pending ||
            app.status === ApplicationStatus.Approved
        )
      ) {
        throw new CustomError("Bed already booked or allocated");
      }

  

   


    const applicationNumber = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
     const amount =
  bed.amount ??
  0; // fallback to 0 or throw if you prefer strict validation

    const application = await this.applicationRepository.createApplication({
      data: {
        id: randomUUID(),
        applicationNumber,  
        studentId,
        amount,
        bedId,
        status: ApplicationStatus.Pending,
        currency: "NGN",
        stayTypeId: stayTypeId ?? null,
        academicSession: academicSession ?? null,
        academicTerm: academicTerm ?? null,
        createdBy: AllocationSource.Parent,
      },
      include: { bed: true, payments: true}
    });

  
    createdApplications.push({
      ...application,
      id: application.id,
      applicationNumber: application.applicationNumber,
      studentId: application.studentId,
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

      payments: application.payments?.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    status: p.status as PaymentStatus,
  })) ?? [],
  
    });
  }

  return createdApplications;
};

 approveApplication = async (applicationId: string, spaceId: string): Promise<any> => {
  // 1. Find application
  const application = await this.applicationRepository.findUniqueApplication({
    where: { id: applicationId },
    include: { bed: true, student: true },
  });

  if (!application) {
    throw new CustomError("Application not found");
  }

  if (application.status === ApplicationStatus.Approved) {
    throw new CustomError("Application is already approved");
  }

  // 2. Update application status → approved
  const updatedApplication = await this.applicationRepository.updateApplication({
    where: { id: applicationId },
    data: { status: ApplicationStatus.Approved },
  });

  // 3. Create Allocation from approved application
  const allocation = await this.allocationRepository.createAllocation({
    data: {
      applicationId: updatedApplication.id,
      studentId: updatedApplication.studentId,
      bedId: updatedApplication.bedId,
      status: AllocationStatus.Reserved,
      createdBy: AllocationSource.Admin,
    },
    include: { bed: true, student: true, application: true },
  });

  if (!allocation) {
    throw new CustomError("Failed to create allocation");
  }

  
  return {
    id: allocation.id,
    allocationNumber: allocation.allocationNumber,
    studentId: allocation.studentId,
    bedId: allocation.bedId,
    applicationId: allocation.applicationId,
    status: allocation.status,
    createdBy: allocation.createdBy,
    startDate: allocation.startDate?.toISOString() ?? null,
    endDate: allocation.endDate?.toISOString() ?? null,
    createdAt: allocation.createdAt.toISOString(),
    updatedAt: allocation.updatedAt?.toISOString() ?? null,
  };
};

 payHostelFee = async (applicationNumber: string) => {
  // 1. Find the application
  const application = await this.applicationRepository.findApplication({
    where: { applicationNumber },
    include: { student: true },
  });

  if (!application) {
    throw new CustomError("Application not found");
  }

  // 2. Check for existing payments
  const existingPayment = await this.paymentRespository.findPayment({
    where: { applicationId: application.id },
  });

  

  // 2. Generate payment reference
  const reference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  if (application.amount === null) throw new CustomError("Application amount not set");

  // 3. Initialize Paystack
  const paystackResponse = await initializePaystackPayment({
    email: application.student.email ?? "guest@cloudnotte.com",
    amount: application.amount,
    currency: application.currency,
    reference,
  });

  // 4. Save Payment in DB as pending
  const payment = await this.paymentRespository.createPayment({
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

  // 5. Return payment + paystack authorization_url with proper types
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
    if (application.amount === null) throw new CustomError("Application amount not set");

    const payment = await this.paymentRespository.createPayment({
      data: {
        id: randomUUID(),
        applicationId: application.id,
        reference: `offline_${Date.now()}`,
        amount: application.amount ,
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
    spaceUser: { spaceId }
  };

  if (filter.studentId) {
    where.studentId = filter.studentId;
  }

  // Fix the date format - convert to proper ISO-8601 DateTime
  if (filter.startDate && filter.endDate) {
    // Convert date strings to Date objects or ISO-8601 strings
    const startDate = new Date(filter.startDate);
    const endDate = new Date(filter.endDate);
    
    // Set time to start of day for startDate and end of day for endDate
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    where.startDate = { gte: startDate };
    where.endDate = { lte: endDate };
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

  if (filter.applicationNumber) {
    where.applicationNumber = filter.applicationNumber;
  }

  const applications = await this.applicationRepository.findApplications({
    where,
    include: {
      student: true,
      bed: true,
      stayType: true,
      payments: true,
      spaceUser: {
        include: { space: true }
      }
    },
  });

  return applications.map(app => ({
    id: app.id,
    applicationNumber: app.applicationNumber,
    studentId: app.studentId,
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
      student: true,
      bed: true,
      stayType: true,
      payments: true,
    },
  });

  if (!app) return null;

  return {
    id: app.id,
    applicationNumber: app.applicationNumber,
    studentId: app.studentId,
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

    payments: app.payments?.map(p => ({
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
  spaceId?: string
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

  return payments.map(p => ({
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