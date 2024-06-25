export interface GridProfileValue {
  n: string;
  u: string;
  v: number;
}

export interface GridProfileSection {
  name: string;
  items: GridProfileValue[];
}

export interface GridProfileData {
  parsed: {
    name: string;
    version: string;
    sections: GridProfileSection[];
  };
  raw: number[] | null;
}
