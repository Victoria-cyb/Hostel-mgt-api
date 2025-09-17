import type { GraphQLResolveInfo } from 'graphql';
import type { ContextProps } from '../../types/index';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Allocation = {
  academicSession?: Maybe<Scalars['String']['output']>;
  academicTerm?: Maybe<Scalars['String']['output']>;
  allocationNumber: Scalars['String']['output'];
  application: Application;
  bed: Bed;
  checkInDate?: Maybe<Scalars['String']['output']>;
  checkOutDate?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  createdBy: Allocation_Source;
  endDate?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  payments: Array<Payment>;
  startDate?: Maybe<Scalars['String']['output']>;
  status: Allocation_Status;
  stayType?: Maybe<StayType>;
  student: User;
};

export type AllocationFilter = {
  allocationNumber?: InputMaybe<Scalars['String']['input']>;
  bedId?: InputMaybe<Scalars['ID']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  hostelId?: InputMaybe<Scalars['ID']['input']>;
  roomId?: InputMaybe<Scalars['ID']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  stayTypeId?: InputMaybe<Scalars['ID']['input']>;
  studentId?: InputMaybe<Scalars['ID']['input']>;
};

export type Application = {
  academicSession?: Maybe<Scalars['String']['output']>;
  academicTerm?: Maybe<Scalars['String']['output']>;
  amount: Scalars['Float']['output'];
  applicationNumber: Scalars['String']['output'];
  bed: Bed;
  createdAt: Scalars['String']['output'];
  createdBy: Allocation_Source;
  currency: Scalars['String']['output'];
  endDate?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  payments: Array<Payment>;
  startDate?: Maybe<Scalars['String']['output']>;
  status: Application_Status;
  stayType?: Maybe<StayType>;
  student: User;
};

export type ApplicationFilter = {
  applicationNumber?: InputMaybe<Scalars['String']['input']>;
  bedId?: InputMaybe<Scalars['ID']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  hostelId?: InputMaybe<Scalars['ID']['input']>;
  roomId?: InputMaybe<Scalars['ID']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  stayTypeId?: InputMaybe<Scalars['ID']['input']>;
  studentId?: InputMaybe<Scalars['ID']['input']>;
};

export type ApplyInput = {
  academicSession?: InputMaybe<Scalars['String']['input']>;
  academicTerm?: InputMaybe<Scalars['String']['input']>;
  amount: Scalars['Float']['input'];
  bedId: Scalars['ID']['input'];
  currency: Scalars['String']['input'];
  endDate?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  stayTypeId?: InputMaybe<Scalars['ID']['input']>;
  studentId: Scalars['ID']['input'];
};

export type AuthPayload = {
  token: Scalars['String']['output'];
};

export type Bed = {
  amount: Scalars['Int']['output'];
  class?: Maybe<Class>;
  currentAllocation?: Maybe<Allocation>;
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  room: Room;
  status: Bed_Status;
};

export type BedInput = {
  amount: Scalars['Int']['input'];
  classId?: InputMaybe<Scalars['ID']['input']>;
  label: Scalars['String']['input'];
  status?: InputMaybe<Bed_Status>;
};

export type Class = {
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  space: Space;
  username: Scalars['String']['output'];
};

export type CreateSpaceInput = {
  name: Scalars['String']['input'];
};

export type CreateSpaceUserInput = {
  classId?: InputMaybe<Scalars['ID']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Gender>;
  image?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  password: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  role: SpaceRole;
};

export type CreateUserInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
};

export enum Gender {
  Female = 'female',
  Male = 'male'
}

export type Hostel = {
  createdAt: Scalars['String']['output'];
  gender: Gender;
  id: Scalars['ID']['output'];
  location?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  rooms: Array<Room>;
  space: Space;
  status: Status;
};

export type HostelInput = {
  gender: Gender;
  location?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  rooms?: InputMaybe<Array<RoomInput>>;
  status?: InputMaybe<Status>;
};

export type Mutation = {
  adminBulkAllocate: Array<Allocation>;
  approveApplication: Allocation;
  changePassword: Scalars['Boolean']['output'];
  checkIn: Scalars['Boolean']['output'];
  checkOut: Scalars['Boolean']['output'];
  createBed: Bed;
  createClass: Class;
  createHostel: Hostel;
  createRoom: Room;
  createSpace: Space;
  createSpaceUser: SpaceUser;
  createStayType: StayType;
  forgotPassword: Scalars['String']['output'];
  linkParentToStudent: Scalars['Boolean']['output'];
  login: AuthPayload;
  markLeave: Allocation;
  parentBulkBook: Array<Application>;
  payHostelFee: Payment;
  recordPayment: Payment;
  resetPassword: Scalars['Boolean']['output'];
  signup: AuthPayload;
  studentBook: Application;
  updateBed: Bed;
  updateHostel: Hostel;
  updateRoom: Room;
  verifyOtp: Scalars['Boolean']['output'];
  verifyPayment: Scalars['Boolean']['output'];
};


export type MutationAdminBulkAllocateArgs = {
  inputs: Array<ApplyInput>;
};


export type MutationApproveApplicationArgs = {
  applicationId: Scalars['ID']['input'];
};


export type MutationChangePasswordArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};


export type MutationCheckInArgs = {
  allocationId: Scalars['ID']['input'];
};


export type MutationCheckOutArgs = {
  allocationId: Scalars['ID']['input'];
};


export type MutationCreateBedArgs = {
  input: BedInput;
  roomId: Scalars['ID']['input'];
};


export type MutationCreateClassArgs = {
  name: Scalars['String']['input'];
  spaceId: Scalars['ID']['input'];
};


export type MutationCreateHostelArgs = {
  input: HostelInput;
  spaceId: Scalars['ID']['input'];
};


export type MutationCreateRoomArgs = {
  hostelId: Scalars['ID']['input'];
  input: RoomInput;
};


export type MutationCreateSpaceArgs = {
  input: CreateSpaceInput;
};


export type MutationCreateSpaceUserArgs = {
  input: CreateSpaceUserInput;
  spaceId: Scalars['ID']['input'];
};


export type MutationCreateStayTypeArgs = {
  endDate: Scalars['String']['input'];
  name: Scalars['String']['input'];
  spaceId: Scalars['ID']['input'];
  startDate: Scalars['String']['input'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationLinkParentToStudentArgs = {
  parentId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  identifier: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationMarkLeaveArgs = {
  allocationId: Scalars['ID']['input'];
  expectedReturn: Scalars['String']['input'];
  reason: Scalars['String']['input'];
  signOutDate: Scalars['String']['input'];
};


export type MutationParentBulkBookArgs = {
  inputs: Array<ApplyInput>;
};


export type MutationPayHostelFeeArgs = {
  applicationNumber: Scalars['String']['input'];
};


export type MutationRecordPaymentArgs = {
  applicationNumber: Scalars['String']['input'];
  status: Payment_Status;
};


export type MutationResetPasswordArgs = {
  email: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
  otp: Scalars['String']['input'];
};


export type MutationSignupArgs = {
  input: CreateUserInput;
};


export type MutationStudentBookArgs = {
  input: ApplyInput;
};


export type MutationUpdateBedArgs = {
  id: Scalars['ID']['input'];
  input: UpdateBedInput;
};


export type MutationUpdateHostelArgs = {
  id: Scalars['ID']['input'];
  input: UpdateHostelInput;
};


export type MutationUpdateRoomArgs = {
  id: Scalars['ID']['input'];
  input: UpdateRoomInput;
};


export type MutationVerifyOtpArgs = {
  email: Scalars['String']['input'];
  otp: Scalars['String']['input'];
};


export type MutationVerifyPaymentArgs = {
  reference: Scalars['String']['input'];
};

export type Payment = {
  allocation?: Maybe<Allocation>;
  amount: Scalars['Float']['output'];
  application?: Maybe<Application>;
  createdAt: Scalars['String']['output'];
  currency: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  method?: Maybe<Scalars['String']['output']>;
  reference: Scalars['String']['output'];
  status: Payment_Status;
};

export type PublicHostel = {
  availableBeds: Scalars['Int']['output'];
  gender: Gender;
  id: Scalars['ID']['output'];
  location?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  roomCount: Scalars['Int']['output'];
  status: Status;
};

export type PublicSpace = {
  hostels: Array<PublicHostel>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Query = {
  allocation?: Maybe<Allocation>;
  allocations: Array<Allocation>;
  application?: Maybe<Application>;
  applications: Array<Application>;
  bed?: Maybe<Bed>;
  beds: Array<Bed>;
  class?: Maybe<Class>;
  classes: Array<Class>;
  hostel?: Maybe<Hostel>;
  hostels: Array<Hostel>;
  payment?: Maybe<Payment>;
  payments: Array<Payment>;
  publicHostel?: Maybe<PublicHostel>;
  publicHostels: Array<PublicHostel>;
  publicSpace?: Maybe<PublicSpace>;
  publicSpaces: Array<PublicSpace>;
  room?: Maybe<Room>;
  rooms: Array<Room>;
  space?: Maybe<Space>;
  spaces: Array<Space>;
  stayType?: Maybe<StayType>;
  stayTypes: Array<StayType>;
  user: User;
  users: Array<SpaceUser>;
};


export type QueryAllocationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAllocationsArgs = {
  filter?: InputMaybe<AllocationFilter>;
};


export type QueryApplicationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryApplicationsArgs = {
  filter?: InputMaybe<ApplicationFilter>;
};


export type QueryBedArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBedsArgs = {
  roomId: Scalars['ID']['input'];
};


export type QueryClassArgs = {
  id: Scalars['ID']['input'];
};


export type QueryClassesArgs = {
  spaceId: Scalars['ID']['input'];
};


export type QueryHostelArgs = {
  id: Scalars['ID']['input'];
};


export type QueryHostelsArgs = {
  spaceId: Scalars['ID']['input'];
};


export type QueryPaymentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPaymentsArgs = {
  allocationNumber?: InputMaybe<Scalars['String']['input']>;
  applicationNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPublicHostelArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPublicHostelsArgs = {
  spaceId: Scalars['ID']['input'];
};


export type QueryPublicSpaceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRoomArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRoomsArgs = {
  hostelId: Scalars['ID']['input'];
};


export type QuerySpaceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryStayTypeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryStayTypesArgs = {
  spaceId: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  spaceId: Scalars['ID']['input'];
};

export enum Role {
  CitAdmin = 'cit_admin',
  User = 'user'
}

export type Room = {
  beds: Array<Bed>;
  capacity: Scalars['Int']['output'];
  hostel: Hostel;
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  price?: Maybe<Scalars['Int']['output']>;
  status: Status;
};

export type RoomInput = {
  beds?: InputMaybe<Array<BedInput>>;
  capacity: Scalars['Int']['input'];
  label: Scalars['String']['input'];
  price?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Status>;
};

export type SimpleSpaceInfo = {
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type SimpleUser = {
  email?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
};

export type Space = {
  classes: Array<Class>;
  createdAt: Scalars['String']['output'];
  createdBy: SimpleUser;
  createdById: Scalars['ID']['output'];
  hostels: Array<Hostel>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  stayTypes: Array<StayType>;
  users: Array<SpaceUser>;
};

export type SpaceUser = {
  allocations: Array<Allocation>;
  applications: Array<Application>;
  class?: Maybe<Class>;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  parent?: Maybe<User>;
  role: SpaceRole;
  space?: Maybe<SimpleSpaceInfo>;
  user: User;
};

export type StayType = {
  endDate: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  space: Space;
  startDate: Scalars['String']['output'];
};

export type UpdateBedInput = {
  amount?: InputMaybe<Scalars['Int']['input']>;
  classId?: InputMaybe<Scalars['ID']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Bed_Status>;
};

export type UpdateHostelInput = {
  gender?: InputMaybe<Gender>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Status>;
};

export type UpdateRoomInput = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Status>;
};

export type User = {
  email?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  gender?: Maybe<Gender>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  lastName: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  spaces: Array<Space>;
  username: Scalars['String']['output'];
};

export enum Allocation_Source {
  Admin = 'admin',
  Parent = 'parent',
  Student = 'student'
}

export enum Allocation_Status {
  Active = 'active',
  CheckedOut = 'checked_out',
  HolidayLeave = 'holiday_leave',
  Reserved = 'reserved'
}

export enum Application_Status {
  Approved = 'approved',
  Pending = 'pending',
  Rejected = 'rejected'
}

export enum Bed_Status {
  Available = 'available',
  Inactive = 'inactive',
  Occupied = 'occupied',
  Reserved = 'reserved'
}

export enum Payment_Status {
  Paid = 'paid',
  Pending = 'pending'
}

export enum SpaceRole {
  Admin = 'admin',
  Parent = 'parent',
  Student = 'student'
}

export enum Status {
  Active = 'active',
  Inactive = 'inactive'
}

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Allocation: ResolverTypeWrapper<Partial<Allocation>>;
  AllocationFilter: ResolverTypeWrapper<Partial<AllocationFilter>>;
  Application: ResolverTypeWrapper<Partial<Application>>;
  ApplicationFilter: ResolverTypeWrapper<Partial<ApplicationFilter>>;
  ApplyInput: ResolverTypeWrapper<Partial<ApplyInput>>;
  AuthPayload: ResolverTypeWrapper<Partial<AuthPayload>>;
  Bed: ResolverTypeWrapper<Partial<Bed>>;
  BedInput: ResolverTypeWrapper<Partial<BedInput>>;
  Boolean: ResolverTypeWrapper<Partial<Scalars['Boolean']['output']>>;
  Class: ResolverTypeWrapper<Partial<Class>>;
  CreateSpaceInput: ResolverTypeWrapper<Partial<CreateSpaceInput>>;
  CreateSpaceUserInput: ResolverTypeWrapper<Partial<CreateSpaceUserInput>>;
  CreateUserInput: ResolverTypeWrapper<Partial<CreateUserInput>>;
  Float: ResolverTypeWrapper<Partial<Scalars['Float']['output']>>;
  Gender: ResolverTypeWrapper<Partial<Gender>>;
  Hostel: ResolverTypeWrapper<Partial<Hostel>>;
  HostelInput: ResolverTypeWrapper<Partial<HostelInput>>;
  ID: ResolverTypeWrapper<Partial<Scalars['ID']['output']>>;
  Int: ResolverTypeWrapper<Partial<Scalars['Int']['output']>>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Payment: ResolverTypeWrapper<Partial<Payment>>;
  PublicHostel: ResolverTypeWrapper<Partial<PublicHostel>>;
  PublicSpace: ResolverTypeWrapper<Partial<PublicSpace>>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Role: ResolverTypeWrapper<Partial<Role>>;
  Room: ResolverTypeWrapper<Partial<Room>>;
  RoomInput: ResolverTypeWrapper<Partial<RoomInput>>;
  SimpleSpaceInfo: ResolverTypeWrapper<Partial<SimpleSpaceInfo>>;
  SimpleUser: ResolverTypeWrapper<Partial<SimpleUser>>;
  Space: ResolverTypeWrapper<Partial<Space>>;
  SpaceUser: ResolverTypeWrapper<Partial<SpaceUser>>;
  StayType: ResolverTypeWrapper<Partial<StayType>>;
  String: ResolverTypeWrapper<Partial<Scalars['String']['output']>>;
  UpdateBedInput: ResolverTypeWrapper<Partial<UpdateBedInput>>;
  UpdateHostelInput: ResolverTypeWrapper<Partial<UpdateHostelInput>>;
  UpdateRoomInput: ResolverTypeWrapper<Partial<UpdateRoomInput>>;
  User: ResolverTypeWrapper<Partial<User>>;
  allocation_source: ResolverTypeWrapper<Partial<Allocation_Source>>;
  allocation_status: ResolverTypeWrapper<Partial<Allocation_Status>>;
  application_status: ResolverTypeWrapper<Partial<Application_Status>>;
  bed_status: ResolverTypeWrapper<Partial<Bed_Status>>;
  payment_status: ResolverTypeWrapper<Partial<Payment_Status>>;
  spaceRole: ResolverTypeWrapper<Partial<SpaceRole>>;
  status: ResolverTypeWrapper<Partial<Status>>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Allocation: Partial<Allocation>;
  AllocationFilter: Partial<AllocationFilter>;
  Application: Partial<Application>;
  ApplicationFilter: Partial<ApplicationFilter>;
  ApplyInput: Partial<ApplyInput>;
  AuthPayload: Partial<AuthPayload>;
  Bed: Partial<Bed>;
  BedInput: Partial<BedInput>;
  Boolean: Partial<Scalars['Boolean']['output']>;
  Class: Partial<Class>;
  CreateSpaceInput: Partial<CreateSpaceInput>;
  CreateSpaceUserInput: Partial<CreateSpaceUserInput>;
  CreateUserInput: Partial<CreateUserInput>;
  Float: Partial<Scalars['Float']['output']>;
  Hostel: Partial<Hostel>;
  HostelInput: Partial<HostelInput>;
  ID: Partial<Scalars['ID']['output']>;
  Int: Partial<Scalars['Int']['output']>;
  Mutation: Record<PropertyKey, never>;
  Payment: Partial<Payment>;
  PublicHostel: Partial<PublicHostel>;
  PublicSpace: Partial<PublicSpace>;
  Query: Record<PropertyKey, never>;
  Room: Partial<Room>;
  RoomInput: Partial<RoomInput>;
  SimpleSpaceInfo: Partial<SimpleSpaceInfo>;
  SimpleUser: Partial<SimpleUser>;
  Space: Partial<Space>;
  SpaceUser: Partial<SpaceUser>;
  StayType: Partial<StayType>;
  String: Partial<Scalars['String']['output']>;
  UpdateBedInput: Partial<UpdateBedInput>;
  UpdateHostelInput: Partial<UpdateHostelInput>;
  UpdateRoomInput: Partial<UpdateRoomInput>;
  User: Partial<User>;
}>;

export type AllocationResolvers<ContextType = ContextProps, ParentType extends ResolversParentTypes['Allocation'] = ResolversParentTypes['Allocation']> = ResolversObject<{
  academicSession?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  academicTerm?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  allocationNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  application?: Resolver<ResolversTypes['Application'], ParentType, ContextType>;
  bed?: Resolver<ResolversTypes['Bed'], ParentType, ContextType>;
  checkInDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  checkOutDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['allocation_source'], ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  payments?: Resolver<Array<ResolversTypes['Payment']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['allocation_status'], ParentType, ContextType>;
  stayType?: Resolver<Maybe<ResolversTypes['StayType']>, ParentType, ContextType>;
  student?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
}>;

export type ApplicationResolvers<ContextType = ContextProps, ParentType extends ResolversParentTypes['Application'] = ResolversParentTypes['Application']> = ResolversObject<{
  academicSession?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  academicTerm?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  applicationNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  bed?: Resolver<ResolversTypes['Bed'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['allocation_source'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  payments?: Resolver<Array<ResolversTypes['Payment']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['application_status'], ParentType, ContextType>;
  stayType?: Resolver<Maybe<ResolversTypes['StayType']>, ParentType, ContextType>;
  student?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
}>;

export type AuthPayloadResolvers<ContextType = ContextProps, ParentType extends ResolversParentTypes['AuthPayload'] = ResolversParentTypes['AuthPayload']> = ResolversObject<{
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type BedResolvers<ContextType = ContextProps, ParentType extends ResolversParentTypes['Bed'] = ResolversParentTypes['Bed']> = ResolversObject<{
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  class?: Resolver<Maybe<ResolversTypes['Class']>, ParentType, ContextType>;
  currentAllocation?: Resolver<Maybe<ResolversTypes['Allocation']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  room?: Resolver<ResolversTypes['Room'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['bed_status'], ParentType, ContextType>;
}>;

export type ClassResolvers<ContextType = ContextProps, ParentType extends ResolversParentTypes['Class'] = ResolversParentTypes['Class']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  space?: Resolver<ResolversTypes['Space'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type HostelResolvers<ContextType = ContextProps, ParentType extends ResolversParentTypes['Hostel'] = ResolversParentTypes['Hostel']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gender?: Resolver<ResolversTypes['Gender'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rooms?: Resolver<Array<ResolversTypes['Room']>, ParentType, ContextType>;
  space?: Resolver<ResolversTypes['Space'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['status'], ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = ContextProps, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  adminBulkAllocate?: Resolver<Array<ResolversTypes['Allocation']>, ParentType, ContextType, RequireFields<MutationAdminBulkAllocateArgs, 'inputs'>>;
  approveApplication?: Resolver<ResolversTypes['Allocation'], ParentType, ContextType, RequireFields<MutationApproveApplicationArgs, 'applicationId'>>;
  changePassword?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationChangePasswordArgs, 'newPassword' | 'oldPassword'>>;
  checkIn?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationCheckInArgs, 'allocationId'>>;
  checkOut?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationCheckOutArgs, 'allocationId'>>;
  createBed?: Resolver<ResolversTypes['Bed'], ParentType, ContextType, RequireFields<MutationCreateBedArgs, 'input' | 'roomId'>>;
  createClass?: Resolver<ResolversTypes['Class'], ParentType, ContextType, RequireFields<MutationCreateClassArgs, 'name' | 'spaceId'>>;
  createHostel?: Resolver<ResolversTypes['Hostel'], ParentType, ContextType, RequireFields<MutationCreateHostelArgs, 'input' | 'spaceId'>>;
  createRoom?: Resolver<ResolversTypes['Room'], ParentType, ContextType, RequireFields<MutationCreateRoomArgs, 'hostelId' | 'input'>>;
  createSpace?: Resolver<ResolversTypes['Space'], ParentType, ContextType, RequireFields<MutationCreateSpaceArgs, 'input'>>;
  createSpaceUser?: Resolver<ResolversTypes['SpaceUser'], ParentType, ContextType, RequireFields<MutationCreateSpaceUserArgs, 'input' | 'spaceId'>>;
  createStayType?: Resolver<ResolversTypes['StayType'], ParentType, ContextType, RequireFields<MutationCreateStayTypeArgs, 'endDate' | 'name' | 'spaceId' | 'startDate'>>;
  forgotPassword?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationForgotPasswordArgs, 'email'>>;
  linkParentToStudent?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationLinkParentToStudentArgs, 'parentId' | 'studentId'>>;
  login?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'identifier' | 'password'>>;
  markLeave?: Resolver<ResolversTypes['Allocation'], ParentType, ContextType, RequireFields<MutationMarkLeaveArgs, 'allocationId' | 'expectedReturn' | 'reason' | 'signOutDate'>>;
  parentBulkBook?: Resolver<Array<ResolversTypes['Application']>, ParentType, ContextType, RequireFields<MutationParentBulkBookArgs, 'inputs'>>;
  payHostelFee?: Resolver<ResolversTypes['Payment'], ParentType, ContextType, RequireFields<MutationPayHostelFeeArgs, 'applicationNumber'>>;
  recordPayment?: Resolver<ResolversTypes['Payment'], ParentType, ContextType, RequireFields<MutationRecordPaymentArgs, 'applicationNumber' | 'status'>>;
  resetPassword?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationResetPasswordArgs, 'email' | 'newPassword' | 'otp'>>;
  signup?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationSignupArgs, 'input'>>;
  studentBook?: Resolver<ResolversTypes['Application'], ParentType, ContextType, RequireFields<MutationStudentBookArgs, 'input'>>;
  updateBed?: Resolver<ResolversTypes['Bed'], ParentType, ContextType, RequireFields<MutationUpdateBedArgs, 'id' | 'input'>>;
  updateHostel?: Resolver<ResolversTypes['Hostel'], ParentType, ContextType, RequireFields<MutationUpdateHostelArgs, 'id' | 'input'>>;
  updateRoom?: Resolver<ResolversTypes['Room'], ParentType, ContextType, RequireFields<MutationUpdateRoomArgs, 'id' | 'input'>>;
  verifyOtp?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationVerifyOtpArgs, 'email' | 'otp'>>;
  verifyPayment?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationVerifyPaymentArgs, 'reference'>>;
}>;

export type PaymentResolvers<ContextType = ContextProps, ParentType extends ResolversParentTypes['Payment'] = ResolversParentTypes['Payment']> = ResolversObject<{
  allocation?: Resolver<Maybe<ResolversTypes['Allocation']>, ParentType, ContextType>;
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  application?: Resolver<Maybe<ResolversTypes['Application']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  method?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reference?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['payment_status'], ParentType, ContextType>;
}>;

export type PublicHostelResolvers<ContextType = ContextProps, ParentType extends ResolversParentTypes['PublicHostel'] = ResolversParentTypes['PublicHostel']> = ResolversObject<{
  availableBeds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  gender?: Resolver<ResolversTypes['Gender'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  roomCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['status'], ParentType, ContextType>;
}>;

export type PublicSpaceResolvers<ContextType = ContextProps, ParentType extends ResolversParentTypes['PublicSpace'] = ResolversParentTypes['PublicSpace']> = ResolversObject<{
  hostels?: Resolver<Array<ResolversTypes['PublicHostel']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = ContextProps, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  allocation?: Resolver<Maybe<ResolversTypes['Allocation']>, ParentType, ContextType, RequireFields<QueryAllocationArgs, 'id'>>;
  allocations?: Resolver<Array<ResolversTypes['Allocation']>, ParentType, ContextType, Partial<QueryAllocationsArgs>>;
  application?: Resolver<Maybe<ResolversTypes['Application']>, ParentType, ContextType, RequireFields<QueryApplicationArgs, 'id'>>;
  applications?: Resolver<Array<ResolversTypes['Application']>, ParentType, ContextType, Partial<QueryApplicationsArgs>>;
  bed?: Resolver<Maybe<ResolversTypes['Bed']>, ParentType, ContextType, RequireFields<QueryBedArgs, 'id'>>;
  beds?: Resolver<Array<ResolversTypes['Bed']>, ParentType, ContextType, RequireFields<QueryBedsArgs, 'roomId'>>;
  class?: Resolver<Maybe<ResolversTypes['Class']>, ParentType, ContextType, RequireFields<QueryClassArgs, 'id'>>;
  classes?: Resolver<Array<ResolversTypes['Class']>, ParentType, ContextType, RequireFields<QueryClassesArgs, 'spaceId'>>;
  hostel?: Resolver<Maybe<ResolversTypes['Hostel']>, ParentType, ContextType, RequireFields<QueryHostelArgs, 'id'>>;
  hostels?: Resolver<Array<ResolversTypes['Hostel']>, ParentType, ContextType, RequireFields<QueryHostelsArgs, 'spaceId'>>;
  payment?: Resolver<Maybe<ResolversTypes['Payment']>, ParentType, ContextType, RequireFields<QueryPaymentArgs, 'id'>>;
  payments?: Resolver<Array<ResolversTypes['Payment']>, ParentType, ContextType, Partial<QueryPaymentsArgs>>;
  publicHostel?: Resolver<Maybe<ResolversTypes['PublicHostel']>, ParentType, ContextType, RequireFields<QueryPublicHostelArgs, 'id'>>;
  publicHostels?: Resolver<Array<ResolversTypes['PublicHostel']>, ParentType, ContextType, RequireFields<QueryPublicHostelsArgs, 'spaceId'>>;
  publicSpace?: Resolver<Maybe<ResolversTypes['PublicSpace']>, ParentType, ContextType, RequireFields<QueryPublicSpaceArgs, 'id'>>;
  publicSpaces?: Resolver<Array<ResolversTypes['PublicSpace']>, ParentType, ContextType>;
  room?: Resolver<Maybe<ResolversTypes['Room']>, ParentType, ContextType, RequireFields<QueryRoomArgs, 'id'>>;
  rooms?: Resolver<Array<ResolversTypes['Room']>, ParentType, ContextType, RequireFields<QueryRoomsArgs, 'hostelId'>>;
  space?: Resolver<Maybe<ResolversTypes['Space']>, ParentType, ContextType, RequireFields<QuerySpaceArgs, 'id'>>;
  spaces?: Resolver<Array<ResolversTypes['Space']>, ParentType, ContextType>;
  stayType?: Resolver<Maybe<ResolversTypes['StayType']>, ParentType, ContextType, RequireFields<QueryStayTypeArgs, 'id'>>;
  stayTypes?: Resolver<Array<ResolversTypes['StayType']>, ParentType, ContextType, RequireFields<QueryStayTypesArgs, 'spaceId'>>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  users?: Resolver<Array<ResolversTypes['SpaceUser']>, ParentType, ContextType, RequireFields<QueryUsersArgs, 'spaceId'>>;
}>;

export type RoomResolvers<ContextType = ContextProps, ParentType extends ResolversParentTypes['Room'] = ResolversParentTypes['Room']> = ResolversObject<{
  beds?: Resolver<Array<ResolversTypes['Bed']>, ParentType, ContextType>;
  capacity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  hostel?: Resolver<ResolversTypes['Hostel'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['status'], ParentType, ContextType>;
}>;

export type SimpleSpaceInfoResolvers<ContextType = ContextProps, ParentType extends ResolversParentTypes['SimpleSpaceInfo'] = ResolversParentTypes['SimpleSpaceInfo']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type SimpleUserResolvers<ContextType = ContextProps, ParentType extends ResolversParentTypes['SimpleUser'] = ResolversParentTypes['SimpleUser']> = ResolversObject<{
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type SpaceResolvers<ContextType = ContextProps, ParentType extends ResolversParentTypes['Space'] = ResolversParentTypes['Space']> = ResolversObject<{
  classes?: Resolver<Array<ResolversTypes['Class']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['SimpleUser'], ParentType, ContextType>;
  createdById?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  hostels?: Resolver<Array<ResolversTypes['Hostel']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stayTypes?: Resolver<Array<ResolversTypes['StayType']>, ParentType, ContextType>;
  users?: Resolver<Array<ResolversTypes['SpaceUser']>, ParentType, ContextType>;
}>;

export type SpaceUserResolvers<ContextType = ContextProps, ParentType extends ResolversParentTypes['SpaceUser'] = ResolversParentTypes['SpaceUser']> = ResolversObject<{
  allocations?: Resolver<Array<ResolversTypes['Allocation']>, ParentType, ContextType>;
  applications?: Resolver<Array<ResolversTypes['Application']>, ParentType, ContextType>;
  class?: Resolver<Maybe<ResolversTypes['Class']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parent?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  role?: Resolver<ResolversTypes['spaceRole'], ParentType, ContextType>;
  space?: Resolver<Maybe<ResolversTypes['SimpleSpaceInfo']>, ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
}>;

export type StayTypeResolvers<ContextType = ContextProps, ParentType extends ResolversParentTypes['StayType'] = ResolversParentTypes['StayType']> = ResolversObject<{
  endDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  space?: Resolver<ResolversTypes['Space'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = ContextProps, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gender?: Resolver<Maybe<ResolversTypes['Gender']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  spaces?: Resolver<Array<ResolversTypes['Space']>, ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type Resolvers<ContextType = ContextProps> = ResolversObject<{
  Allocation?: AllocationResolvers<ContextType>;
  Application?: ApplicationResolvers<ContextType>;
  AuthPayload?: AuthPayloadResolvers<ContextType>;
  Bed?: BedResolvers<ContextType>;
  Class?: ClassResolvers<ContextType>;
  Hostel?: HostelResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Payment?: PaymentResolvers<ContextType>;
  PublicHostel?: PublicHostelResolvers<ContextType>;
  PublicSpace?: PublicSpaceResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Room?: RoomResolvers<ContextType>;
  SimpleSpaceInfo?: SimpleSpaceInfoResolvers<ContextType>;
  SimpleUser?: SimpleUserResolvers<ContextType>;
  Space?: SpaceResolvers<ContextType>;
  SpaceUser?: SpaceUserResolvers<ContextType>;
  StayType?: StayTypeResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
}>;

