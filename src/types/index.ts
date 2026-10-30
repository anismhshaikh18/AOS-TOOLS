export interface ToolItem {
  id: string;
  name: string;
  shortDesc: string;
  category: 'pdf' | 'image' | 'special';
  iconName: string;
  status?: 'fully-supported' | 'client-mock' | 'in-development' | string;
  acceptedFormats?: string;
  badge?: string;
  isPopular?: boolean;
}

export interface PanServiceGuide {
  id: string;
  title: string;
  type: string;
  description: string;
  eligibility: string[];
  documentsRequired: {
    poi: string[];
    poa: string[];
    pod?: string[];
    supportingDocs?: string[];
  };
  fees?: string | {
    physicalPanIndia?: string;
    physicalPanAbroad?: string;
    ePanOnly?: string;
    [key: string]: string | undefined;
  };
  steps?: string[];
  proteanUrl?: string;
  utiitslUrl?: string;
}

export interface GovernmentPortal {
  id: string;
  name: string;
  category: string;
  description: string;
  officialDomain: string;
  portalUrl: string;
  isStateSpecific?: boolean;
  state?: string;
}
