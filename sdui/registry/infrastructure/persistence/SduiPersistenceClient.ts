export interface ScreenPersistenceRecord {
  id: number;
  publicId: string;
  screenId: string;
  targetApp: string;
  versionNumber: number;
  status: string;
  layoutJson: unknown;
  lockVersion: number;
  publishedAt: Date | null;
  publishedBy: string | null;
  createdFromVersion: number | null;
  changeDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplatePersistenceRecord {
  id: number;
  publicId: string;
  templateId: string;
  templateType: string;
  defaultLayoutJson: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegistryPersistenceRecord {
  id: number;
  publicId: string;
  name: string;
  nodeLevel: string;
  componentType: string;
  schemaJson: unknown;
  supportedProperties: unknown;
  supportedActions: unknown;
  version: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PersistenceDelegate<TRecord> {
  findFirst(args: unknown): Promise<TRecord | null>;
  findUnique(args: unknown): Promise<TRecord | null>;
  findMany(args: unknown): Promise<TRecord[]>;
  create(args: unknown): Promise<TRecord>;
  update(args: unknown): Promise<TRecord>;
  updateMany(args: unknown): Promise<unknown>;
  upsert(args: unknown): Promise<TRecord>;
}

export interface SduiPersistenceClient {
  readonly sduiScreen: PersistenceDelegate<ScreenPersistenceRecord>;
  readonly sduiTemplate: PersistenceDelegate<TemplatePersistenceRecord>;
  readonly sduiComponentRegistry: PersistenceDelegate<RegistryPersistenceRecord>;
  $transaction<T>(operation: (transaction: SduiPersistenceClient) => Promise<T>): Promise<T>;
}
